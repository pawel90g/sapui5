sap.ui.define([
    "sapui5/demo/trippin/models/AppModel"
], function (AppModel) {
    var AppointmentsService = class {
        constructor() {
            this._appointmentsServiceUrl = "http://localhost:3000/api/appointments/"
            this._authServiceUrl = "http://localhost:3000/api/auth/"
        }

        register(username, password, successCallback, errorCallback) {
            let url = this._authServiceUrl + "register";

            let registerModel = new AppModel();
            registerModel.post({
                username: username,
                password: password
            }, url, {}, (res) => {
                registerModel.setData(res);

                if (successCallback)
                    successCallback(res);
            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback();
                }
            });

            return registerModel;
        }

        signin(username, password, successCallback, errorCallback) {
            let url = this._authServiceUrl + "signin";

            let signinModel = new AppModel();
            signinModel.post({
                username: username,
                password: password
            }, url, {}, (res) => {
                signinModel.setData(res);

                if (successCallback)
                    successCallback(res);
            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback();
                }
            });

            return signinModel;
        }

        changePassword(token, oldPassword, newPassword, successCallback, errorCallback) {
            let url = this._authServiceUrl + "changePassword";

            let changePasswordModel = new AppModel();
            changePasswordModel.post({
                oldPassword: oldPassword,
                newPassword: newPassword
            }, url, {
                    "x-access-token": token
                }, (res) => {
                    changePasswordModel.setData(res);

                    if (successCallback)
                        successCallback(res);
                }), (jqXHR, textStatus, errorThrown) => {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);

                    if (errorCallback) {
                        errorCallback();
                    }
                };

            return changePasswordModel;
        }

        me(token, successCallback, errorCallback) {
            let url = this._authServiceUrl + "me";

            let meModel = new AppModel();
            meModel.get(url, {
                "Content-Type": "application/json",
                "x-access-token": token
            }, (res) => {
                meModel.setData(res);

                if (successCallback)
                    successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback();
                }
            });

            return meModel;
        }

        listUsers(token, successCallback, errorCallback) {
            let url = this._authServiceUrl + "list";

            let usersListModel = new AppModel();
            usersListModel.get(url, {
                "Content-Type": "application/json",
                "x-access-token": token
            }, (res) => {
                usersListModel.setData(res);

                if (successCallback)
                    successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback();
                }
            });

            return usersListModel;
        }

        loadAppointments(token, successCallback, errorCallback) {
            let url = this._appointmentsServiceUrl;

            let appointmentsModel = new AppModel();
            appointmentsModel.get(url, { "x-access-token": token }, (res) => {

                if (res.auth === false) {
                    errorCallback(res);
                    return;
                }

                res.forEach(element => {
                    let start = new Date(element.start);
                    element.start = start;

                    let end = new Date(element.end);
                    element.end = end;
                });

                let rows = [{
                    appointments: res
                }];

                appointmentsModel.setData(rows);

                successCallback(rows);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });

            return appointmentsModel;
        }

        sharedAppointments(token, successCallback, errorCallback) {
            let url = this._appointmentsServiceUrl + "shared/";

            let appointmentsModel = new AppModel();
            appointmentsModel.get(url, { "x-access-token": token }, (res) => {

                if (res.auth === false) {
                    errorCallback(res);
                    return;
                }

                res.forEach(share => {
                    share.appointments.forEach(element => {
                        let start = new Date(element.start);
                        element.start = start;

                        let end = new Date(element.end);
                        element.end = end;
                    });
                });

                appointmentsModel.setData(res);

                successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });

            return appointmentsModel;
        }

        updateAppointment(token, id, appointment, successCallback, errorCallback) {
            let url = this._appointmentsServiceUrl + id;

            let appointmentsModel = new AppModel();
            appointmentsModel.patch(appointment, url, { "x-access-token": token }, (res) => {

                if (res.auth === false) {
                    errorCallback(res);
                    return;
                }

                successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }

        newAppointment(token, appointment, successCallback, errorCallback) {
            let url = this._appointmentsServiceUrl;

            let appointmentsModel = new AppModel();
            appointmentsModel.post(appointment, url, { "x-access-token": token }, (res) => {

                if (res.auth === false) {
                    errorCallback(res);
                    return;
                }

                successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }

        shareAppointment(token, appointmentId, users, successCallback, errorCallback) {
            let url = this._appointmentsServiceUrl + "share";

            let shareModel = new AppModel();
            shareModel.post({
                id: appointmentId,
                users: users
            }, url, { "x-access-token": token }, (res) => {

                if (res.auth === false) {
                    errorCallback(res);
                    return;
                }

                successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }

        deleteAppointment(token, appointmentId, successCallback, errorCallback) {
            let url = this._appointmentsServiceUrl + appointmentId;

            let deleteModel = new AppModel();
            deleteModel.delete(url, { "x-access-token": token }, (res) => {

                if (res.auth === false) {
                    errorCallback(res);
                    return;
                }

                successCallback(res);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }
    };

    return new AppointmentsService();
});