sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/AppointmentsService",
    "sapui5/demo/trippin/models/BusyDialog",
    "sapui5/demo/trippin/models/AppModel",
    "sap/m/MessageToast",
    "sap/ui/unified/FileUploaderParameter"
], function (BaseController, AppointmentsService, BusyDialog, AppModel, MessageToast, FileUploaderParameter) {
    'use strict';

    return BaseController.extend("sapui5.demo.trippin.controller.Profile", {
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
        _loadMe: function () {
            this._oBusyDialog.open(true);
            let storedToken = this._getToken();
            var that = this;

            if (storedToken) {
                let meModel = AppointmentsService.me(storedToken, res => { that._oBusyDialog.close(true); });
                this.getView().setModel(meModel, "me");
            } else {
                this._oBusyDialog.close(true);
            }
        },
        _loadData: function () {
            this._loadMe();
        },
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this.getView().setModel(new AppModel({ oldPassword: "", newPassword: "", confirmPassword: "" }), "pwd");
            this._loadData();
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onNavPress: function () {
            this.getRouter().navTo("master");
        },
        onPasswordReset: function () {
            let pwdModel = this.getView().getModel("pwd").getProperty("/");

            if (pwdModel.newPassword !== pwdModel.confirmPassword) {
                MessageToast.show("Hasła nie są zgodne!");
                return;
            }

            let storedToken = this._getToken();
            if (!storedToken) {
                return;
            }

            var that = this;

            AppointmentsService.changePassword(storedToken, pwdModel.oldPassword, pwdModel.newPassword, (res) => {
                console.log(res);
                if (res.success) {
                    let me = that.getView().getModel("me").getProperty("/");

                    AppointmentsService.signin(me.username, pwdModel.newPassword, (res) => {
                        if (!res.auth) {
                            MessageToast.show(res.message);
                        } else {
                            sessionStorage.setItem("appointmentsApiToken", res.token);
                            sessionStorage.setItem("appointmentsApiTokenExpiration", res.expirationDate);

                            console.log("token updated");
                        }
                    });

                    MessageToast.show("Hasło zostało zmienione");
                    this.getView().setModel(new AppModel({ oldPassword: "", newPassword: "", confirmPassword: "" }), "pwd");
                }
            });
        },
        onUploadAvatar: function () {
            var oFileUploader = this.byId("avatarUploader");
            let storedToken = this._getToken();

            var headerToken = new FileUploaderParameter();
            headerToken.setName("x-access-token");
            headerToken.setValue(storedToken);

            oFileUploader.removeAllHeaderParameters();
            oFileUploader.setSendXHR(true);
            oFileUploader.addHeaderParameter(headerToken);

            oFileUploader.upload();
        },
        onUploadComplete: function () {
            this._loadMe();
            var oFileUploader = this.byId("avatarUploader");
            oFileUploader.setValue("");
        },
        onSchedulerClick: function () {
            this.getRouter().navTo("scheduler");
        }
    });
});