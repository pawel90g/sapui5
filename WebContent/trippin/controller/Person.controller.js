sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/models/BusyDialog",
    "sapui5/demo/trippin/models/AppModel",
    "sap/ui/core/routing/History"
], function (BaseController, ODataService, BusyDialog, AppModel, History) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Person", {
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this.getRouter().getRoute("person").attachPatternMatched(this._onDetailMatched, this);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        _loadData: function () {
            this._oBusyDialog.open();
            var that = this;
            var oPersonModel = ODataService.person(this.sUserName, () => { that._oBusyDialog.close(); });

            this.getView().setModel(oPersonModel);
        },
        _onDetailMatched: function (oEvent) {

            this.sUserName = oEvent.getParameter("arguments").UserName;
            this._loadData();
        },
        onNavPress: function () {
            this.getRouter().navTo("people");
        },
        onFlightsList: function () {
            this.getRouter().navTo("personTrips", {
                UserName: this.sUserName
            });
        },
        onFriendsList: function () {
            this.getRouter().navTo("personFriends", {
                UserName: this.sUserName
            });
        },
        onPersonEdit: function () {
            this.getRouter().navTo("editPerson", {
                UserName: this.sUserName
            });
        }
    });
});