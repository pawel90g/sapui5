sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/ui/core/routing/History",
    "sapui5/demo/trippin/models/formatters"
], function (BaseController, ODataService, AppModel, BusyDialog, History, formatters) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.PersonTrips", {
        formatters: formatters,
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);

            this.getRouter().getRoute("personTrips").attachPatternMatched(this._onDetailMatched, this);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        _loadData: function () {
            this._oBusyDialog.open();
            var that = this;

            var oPersonTripsModel = ODataService.trips(this.sUserName, () => { that._oBusyDialog.close(); });
            this.getView().setModel(oPersonTripsModel);
        },
        _onDetailMatched: function (oEvent) {
            this.sUserName = oEvent.getParameter("arguments").UserName;

            this._loadData();
        },
        onNavPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else if (this.sUserName) {
                this.getRouter().navTo("person", {
                    UserName: this.sUserName
                });
            } else {
                this.getRouter().navTo("people");
            }
        },
        onListPress: function (oEvent) {
            var oTrip = oEvent.getSource();
            var oContext = oTrip.getBindingContext();
            var sPath = oContext.getPath();

            var iTripId = this.getView().getModel().getProperty(sPath + "/TripId");

            this.getRouter().navTo("trip", {
                UserName: this.sUserName,
                TripId: iTripId
            });
        },
        onPopoverClose: function () {
            if (this._oPopover) {
                this._oPopover.close();
            }
        },
        _showPopover: function (oEvent, bindingPath) {
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("sapui5.demo.trippin.view.fragments.Popover", this);
                this.getView().addDependent(this._oPopover);
            }

            this._oPopover.bindElement(bindingPath);
            this._oPopover.openBy(oEvent.getSource());

            jQuery.sap.delayedCall(3000, this, function () {
                this.onPopoverClose();
            });
        },
        onAppointmentClick: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            if (!oAppointment) {
                return;
            }

            this._showPopover(oEvent, oAppointment.getBindingContext().getPath());
        }
    });
});