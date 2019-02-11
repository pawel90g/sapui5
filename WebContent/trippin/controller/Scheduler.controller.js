sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/AppointmentsService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/m/MessageToast"
], function (BaseController, AppointmentsService, AppModel, BusyDialog, MessageToast) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Scheduler", {

        _getToken: function () {
            let storedToken = sessionStorage.getItem("appointmentsApiToken");
            let expirationDate = sessionStorage.getItem("appointmentsApiTokenExpiration");

            let now = new Date();

            if (!expirationDate || now > new Date(expirationDate)) {
                this.getRouter().navTo("appointments");
                return null;
            }

            return storedToken;
        },
        _loadMyAppointments: function (storedToken) {
            var that = this;
            var appointmentsModel = new AppModel();

            AppointmentsService.loadAppointments(storedToken, (res) => {

                AppointmentsService.me(storedToken, (s) => {
                    res.forEach(element => {
                        element.username = s.username;
                    });

                    appointmentsModel.refresh(true);
                });

                appointmentsModel.setData(res);
                that._loadSharedAppointments(storedToken);

            }, (jqXHR, textStatus, errorThrown) => {

                let err = JSON.parse(jqXHR.responseText);
                if (err.auth === false) {
                    MessageToast.show(err.message);
                    that.getRouter().navTo("appointments");
                }
            });

            this.getView().setModel(appointmentsModel);
        },
        _loadSharedAppointments: function (storedToken) {
            var that = this;
            var sharedAppointmentsModel = new AppModel();

            AppointmentsService.sharedAppointments(storedToken, (res) => {

                sharedAppointmentsModel.setData(res);
                that._oBusyDialog.close(true);

            }, (jqXHR, textStatus, errorThrown) => {

                let err = JSON.parse(jqXHR.responseText);
                if (err.auth === false) {
                    MessageToast.show(err.message);
                    that.getRouter().navTo("appointments");
                }
            });

            this.getView().setModel(sharedAppointmentsModel, "shared");
        },
        _loadData: function () {
            this._oBusyDialog.open(true);
            let storedToken = this._getToken();

            if (storedToken) {
                this._loadMyAppointments(storedToken);
            } else {
                this._oBusyDialog.close(true);
            }
        },
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);

            this._loadData();
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onNavPress: function () {
            this.getRouter().navTo("profile");
        },
        handleAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");

            if (oAppointment) {
                if (!this._oPopover) {
                    this._oPopover = sap.ui.xmlfragment("sapui5.demo.trippin.view.fragments.EventPopover", this);
                    this.getView().addDependent(this._oPopover);
                }

                this._oPopover.bindElement(oAppointment.getBindingContext().getPath());
                this._oPopover.openBy(oEvent.getSource());

            }
        },
        onPopoverClose: function () {
            if (this._oPopover) {
                this._oPopover.close();
            }
        },
        onEventEdit: function (oEvent) {
            this.onPopoverClose();

            let oBindingContext = oEvent.getSource().getBindingContext();

            if (!this._oAppointmentDetails) {
                this._oAppointmentDetails = sap.ui.xmlfragment("appointmentDetails", "sapui5.demo.trippin.view.fragments.AppointmentDetails", this);
                this.getView().addDependent(this._oAppointmentDetails);
            }

            this._oAppointmentDetails.setBindingContext(oBindingContext);
            this._oAppointmentDetails.open();
        },
        onEventDelete: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext();
            let appointment = this.getView().getModel().getProperty(oBindingContext.getPath());

            var that = this;

            var storedToken = this._getToken();
            if (storedToken) {
                AppointmentsService.deleteAppointment(storedToken, appointment._id, (res) => {
                    that._loadData();
                    that.onPopoverClose();
                });
            }
        },
        onEventShare: function (oEvent) {
            this.onPopoverClose();

            this._oBusyDialog.open(true);
            var that = this;
            let storedToken = this._getToken();

            if (storedToken) {
                var that = this;
                let usersListModel = AppointmentsService.listUsers(storedToken, () => that._oBusyDialog.close(true));
                this.getView().setModel(usersListModel, "users");
            }

            let oBindingContext = oEvent.getSource().getBindingContext();

            if (!this._oShareModal) {
                this._oShareModal = sap.ui.xmlfragment("shareEventModal", "sapui5.demo.trippin.view.fragments.ShareEventModal", this);
                this.getView().addDependent(this._oShareModal);
            }
            this._oShareModal.setBindingContext(oBindingContext);
            this._oShareModal.open();
        },
        onShare: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext();
            let appointment = this.getView().getModel().getProperty(oBindingContext.getPath());

            var storedToken = this._getToken();
            if (storedToken) {
                AppointmentsService.shareAppointment(storedToken, appointment._id, this.selectedUsers, (res) => {
                    MessageToast.show(res.message);
                });
            }

            this._oShareModal.close();
        },
        onShareClose: function () {
            this._oShareModal.close();
        },
        onUsersSelectionFinish: function (oEvent) {
            this.selectedUsers = [];
            var that = this;

            oEvent.getParameter("selectedItems").forEach(function (element) {
                that.selectedUsers.push(element.getKey());
            });
        },
        handleAppointmentAddWithContext: function (oEvent) {

            let oFragment = sap.ui.core.Fragment;

            if (!this._oAddAppointment) {
                this._oAddAppointment = sap.ui.xmlfragment("addAppointment", "sapui5.demo.trippin.view.fragments.AddAppointment", this);
                this.getView().addDependent(this._oAddAppointment);
            }

            let oSelectedIntervalStart = oEvent.getParameter("startDate");
            let oStartDate = oFragment.byId("addAppointment", "startsAtDatePicker");
            oStartDate.setDateValue(oSelectedIntervalStart);

            let oSelectedIntervalEnd = oEvent.getParameter("endDate");
            let oEndDate = oFragment.byId("addAppointment", "endsAtDatePicker");
            oEndDate.setDateValue(oSelectedIntervalEnd);


            this._oAddAppointment.open();
        },
        onDetailClose: function () {
            this._oAppointmentDetails.close();
        },
        onAddAppointmentClose: function () {
            this._oAddAppointment.close();
        },
        onDetailSave: function (oAppointment) {
            let sPath = this._oAppointmentDetails.getBindingContext().getPath();
            let oFragment = sap.ui.core.Fragment;

            let title = oFragment.byId("appointmentDetails", "detailTitleInput").getValue();
            let info = oFragment.byId("appointmentDetails", "detailInfoInput").getValue();

            let start = oFragment.byId("appointmentDetails", "startsAtDatePicker").getDateValue();
            let end = oFragment.byId("appointmentDetails", "endsAtDatePicker").getDateValue();

            let oModel = this.getView().getModel();

            oModel.setProperty(sPath + "/title", title);
            oModel.setProperty(sPath + "/info", info);
            oModel.setProperty(sPath + "/start", start);
            oModel.setProperty(sPath + "/end", end);

            let appointment = oModel.getProperty(sPath);

            let storedToken = this._getToken();
            if (storedToken) {
                AppointmentsService.updateAppointment(storedToken, appointment._id, appointment, (res) => {
                    MessageToast.show("Updated");
                });
            }

            this._oAppointmentDetails.close();
        },
        onAddAppointment: function () {

            let oFragment = sap.ui.core.Fragment;

            let title = oFragment.byId("addAppointment", "titleInput").getValue();
            let info = oFragment.byId("addAppointment", "infoInput").getValue();

            let start = oFragment.byId("addAppointment", "startsAtDatePicker").getDateValue();
            let end = oFragment.byId("addAppointment", "endsAtDatePicker").getDateValue();

            let appointment = {
                start: start,
                end: end,
                title: title,
                info: info
            };

            let storedToken = this._getToken();

            if (storedToken) {
                var that = this;
                AppointmentsService.newAppointment(storedToken, appointment, (res) => {
                    that._loadData();
                });
            }

            this._oAddAppointment.close();
        }
    });
});