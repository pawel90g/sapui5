sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/ui/core/routing/History",
    "sap/ui/layout/VerticalLayout",
], function (BaseController, ODataService, AppModel, BusyDialog, History, VerticalLayout) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.People", {

        _loadData: function () {
            this._oBusyDialog.open();
            var that = this;

            var oPeopleModel = ODataService.people(() => { that._oBusyDialog.close(); });

            this.getView().setModel(oPeopleModel);
        },
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this._loadData();
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onListPress: function (oEvent) {
            var oItem = oEvent.getSource();

            this.getRouter().navTo("person", {
                UserName: oItem.getBindingContext().getProperty("UserName")
            });
        },
        onNavPress: function () {
            this.getRouter().navTo("master");
        },
        onSearch: function (oEvent) {

            var sValue = oEvent.getSource().getValue();
            var that = this;

            this._oBusyDialog.open();
            var oPeopleModel = ODataService.people(sValue, () => { that._oBusyDialog.close(); });

            this.getView().setModel(oPeopleModel);
        }
    });
});