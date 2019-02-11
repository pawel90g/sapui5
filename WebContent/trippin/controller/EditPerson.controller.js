sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sap/ui/core/routing/History",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/m/MessageToast"
], function (BaseController, ODataService, History, AppModel, BusyDialog, MessageToast) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.EditPerson", {
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this.getRouter().getRoute("editPerson").attachPatternMatched(this._onEditPersonMatched, this);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        _onEditPersonMatched: function (oEvent) {
             this._oBusyDialog.open(true);

            this.sUserName = oEvent.getParameter("arguments").UserName;
            var that = this;
            var oPersonModel = ODataService.person(this.sUserName, () => { that._oBusyDialog.close(true); });
            this.getView().setModel(oPersonModel);
        },
        onNavPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("people");
            }
        },
        onSave: function () {
            var oBundle = this.getResourceBundle();
            var oModel = this.getView().getModel();

            var that = this;

            var toUpdate = {
                FirstName: oModel.oData.FirstName,
                LastName: oModel.oData.LastName,
                Age: oModel.oData.Age,
                Emails: oModel.oData.Emails
            };

            ODataService.updatePerson(this.sUserName, toUpdate, () => {
                MessageToast.show(oBundle.getText("updateSuccess"));
                that.getRouter().navTo("person", {
                    UserName: that.sUserName
                });
            }, () => {
                MessageToast.show(oBundle.getText("updateFailed"));
            });
        },
        onDiscard: function () {
            this.getRouter().navTo("person", {
                UserName: this.sUserName
            });
        },
        onAddEmail: function (oEvent) {
            var sNewEmail = this.getView().byId("newEmailInput").getValue();
            var oModel = this.getView().getModel();
            oModel.oData.Emails.push(sNewEmail);

            var oList = this.getView().byId("emailsList")
            oList.getBinding("items").refresh(true);
        },
        onEmailDelete: function (oEvent) {
            var oModel = this.getView().getModel();

            var oList = oEvent.getSource(),
                oItem = oEvent.getParameter("listItem"),
                sPath = oItem.getBindingContext().getPath();

            var index = sPath.split("/").pop();

            delete oModel.oData.Emails[index];

            oModel.oData.Emails = oModel.oData.Emails.filter(function (el) { return el; });

            oList.getBinding("items").refresh(true);
        }
    });
});