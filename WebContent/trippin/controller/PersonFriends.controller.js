sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/ui/core/routing/History",
    "sapui5/demo/trippin/models/formatters"
], function (BaseController, ODataService, AppModel, BusyDialog, History, formatters) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.PersonFriends", {
        formatters: formatters,
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this.getRouter().getRoute("personFriends").attachPatternMatched(this._onDetailMatched, this);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        _loadData: function () {
            this._oBusyDialog.open();
            var that = this;

            var oPersonTripsModel = ODataService.friends(this.sUserName, () => { that._oBusyDialog.close(); });

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
        }
    });
});