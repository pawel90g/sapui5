sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    'sap/m/MessageToast',
    "sap/ui/core/routing/History"
], function (BaseController, ODataService, AppModel, BusyDialog, MessageToast, History) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Trip", {
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this.getRouter().getRoute("trip").attachPatternMatched(this._onDetailMatched, this);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        _loadTrips: function () {
            this._oBusyDialog.open();
            var that = this;

            var oTripModel = ODataService.trip(this.sUserName, this.iTripId, () => { that._loadInvolvedPeople(); });
            this.getView().setModel(oTripModel);
        },
        _loadInvolvedPeople: function () {
            var oView = this.getView();
            var that = this;

            var oInvolvedPeopleModel = ODataService.tripInvolvedPeople(this.sUserName, this.iTripId, () => { that._oBusyDialog.close(); });
            oView.setModel(oInvolvedPeopleModel, "involvedPeople");
        },
        _loadData: function () {
            this._loadTrips();
        },
        _onDetailMatched: function (oEvent) {
            this.sUserName = oEvent.getParameter("arguments").UserName;
            this.iTripId = oEvent.getParameter("arguments").TripId;

            this._loadData();
        },
        onNavPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("person", {
                    UserName: this.sUserName
                });
            }
        },
        onShareTrip: function (oEvent) {
            var oView = this.getView();

            if (this.getView().getModel("availablePeople") === undefined) {

                var aInvolvedPeople = this.getView().getModel("involvedPeople").getProperty("/value");
                var oPeopleModel = new AppModel();

                ODataService.friends(this.sUserName, (res) => {
                    var aAvailablePeople = res.value;
                    jQuery.each(aInvolvedPeople, function (iIndex, oItem) {
                        var oResult = jQuery.grep(aAvailablePeople, function (e) {
                            return e.UserName === oItem.UserName;
                        });

                        var iElIndex = aAvailablePeople.indexOf(oResult[0]);
                        aAvailablePeople.splice(iElIndex, 1);
                    });

                    oPeopleModel.setData(res);
                });

                oView.setModel(oPeopleModel, "availablePeople");
            }

            if (this.oShareTripDialog === undefined) {
                this.oShareTripDialog = sap.ui.xmlfragment("shareTripDialog", "sapui5.demo.trippin.view.fragments.AddPersonToTrip", this);
                oView.addDependent(this.oShareTripDialog);
            }

            this.oShareTripDialog.open();
        },
        onShareTripDialogClose: function () {
            this.oShareTripDialog.close();
        },

        onSelectionFinish: function (oEvent) {

            this.peopleToInvolve = [];
            var that = this;

            oEvent.getParameter("selectedItems").forEach(function (element) {
                that.peopleToInvolve.push(element.getKey());
            });
        },
        onInvolvePeople: function () {
            var oBundle = this.getResourceBundle();
            var oPeopleModel = this.getView().getModel("availablePeople");

            var that = this;

            if (this.peopleToInvolve.length > 0) {

                ODataService.shareTrip(this.iTripId, this.sUserName, this.peopleToInvolve, () => {
                    that._loadData();
                    MessageToast.show(oBundle.getText("updateSuccess"));
                }, () => {
                    MessageToast.show(oBundle.getText("updateFailed"));
                });
            }
        }
    });
});