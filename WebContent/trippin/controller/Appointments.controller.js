sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/AppointmentsService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/m/MessageToast"
], function (BaseController, AppointmentsService, AppModel, BusyDialog, MessageToast) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Appointments", {

        onInit: function () {
            let token = sessionStorage.getItem("appointmentsApiToken");
            let expiration = sessionStorage.getItem("appointmentsApiTokenExpiration");
            let now = new Date();
            if (token && expiration && now < new Date(expiration)) {
                this.getRouter().navTo("profile");
            }

            this._oBusyDialog = new BusyDialog(this);

            var registerModel = new AppModel({
                UserName: "",
                Password: "",
                ConfirmPassword: ""
            });

            this.getView().setModel(registerModel);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onNavPress: function () {
            this.getRouter().navTo("master");
        },
        onRegister: function () {
            var model = this._getRegisterModel();
            if (model === undefined) return;

            AppointmentsService.register(model.username, model.password, (res) => {
                if (!res.success) {
                    MessageToast.show(res.message);
                }
            });
        },
        onSignin: function () {
            var model = this._getRegisterModel(true);
            if (model === undefined) return;

            AppointmentsService.signin(model.username, model.password, (res) => {
                if (!res.auth) {
                    MessageToast.show(res.message);
                } else {
                    sessionStorage.setItem("appointmentsApiToken", res.token);
                    sessionStorage.setItem("appointmentsApiTokenExpiration", res.expirationDate);
                    this.getRouter().navTo("profile");
                }
            });
        },
        _getRegisterModel: function (doNotcomparePassword) {
            let model = this.getView().getModel();

            let username = model.getProperty("/UserName");
            if (username.length === 0) {
                MessageToast.show("Nazwa użytkownika nie może być pusta!");
                return undefined;
            }

            let password = model.getProperty("/Password");
            if (password.length < 4) {
                MessageToast.show("Hasło musi składać się przynajmniej z 4 znaków!");
                return undefined;
            }

            if (!doNotcomparePassword) {
                let confirmPassword = model.getProperty("/ConfirmPassword");
                if (password !== confirmPassword) {
                    MessageToast.show("Hasła nie są zgodne!");
                    return undefined;
                }
            }

            return {
                username: username,
                password: password
            }
        }
    });
});