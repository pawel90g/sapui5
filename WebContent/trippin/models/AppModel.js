sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return JSONModel.extend("sapui5.demo.trippin.models.AppModel", {

        _request: (sMethod, sUrl, oObject, successCallback, errorCallback) => {
            var that = this;
            return jQuery.ajax({
                method: sMethod,
                url: "http://localhost:5000/api/Wrapper/",
                data: oObject ? JSON.stringify(oObject) : null,
                headers: {
                    "Content-Type": "application/json",
                    "Wrapper-Dest-Url": sUrl
                },
                success: function (res, textStatus, jqXHR) {
                    successCallback(res, textStatus, jqXHR);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        },
        patchForce: (oObject, sUrl, successCallback, errorCallback) => {
            this._request("PATCH", sUrl, oObject, (res, textStatus, jqXHR) => {
                if (successCallback) {
                    successCallback(res, textStatus, jqXHR);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                if (errorCallback)
                    errorCallback(jqXHR, textStatus, errorThrown);
            });
        },
        postForce: (oObject, sUrl, successCallback, errorCallback) => {
            return this._request("POST", sUrl, oObject, (res, textStatus, jqXHR) => {
                if (successCallback) {
                    successCallback(res, textStatus, jqXHR);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                if (errorCallback)
                    errorCallback(jqXHR, textStatus, errorThrown);
            });
        },
        getForce: (oObject, sUrl, successCallback, errorCallback) => {
            return this._request("GET", sUrl, oObject, (res, textStatus, jqXHR) => {
                if (successCallback) {
                    successCallback(res, textStatus, jqXHR);
                }
            }, (jqXHR, textStatus, errorThrown) => {
                if (errorCallback)
                    errorCallback(jqXHR, textStatus, errorThrown);
            });
        },
        patch: (oObject, sUrl, oHeaders, successCallback, errorCallback) => {

            var that = this;

            if (oHeaders["Content-Type"] === "application/json" && oObject) {
                oObject = JSON.stringify(oObject);
            };

            jQuery.ajax({
                method: "PATCH",
                url: sUrl,
                data: oObject ? oObject : null,
                headers: oHeaders,
                success: function (res, textStatus, jqXHR) {
                    successCallback(res, textStatus, jqXHR);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        },
        post: (oObject, sUrl, oHeaders, successCallback, errorCallback) => {

            var that = this;

            if (oHeaders["Content-Type"] === "application/json" && oObject) {
                oObject = JSON.stringify(oObject);
            };

            jQuery.ajax({
                method: "POST",
                url: sUrl,
                data: oObject ? oObject : null,
                headers: oHeaders,
                success: function (res, textStatus, jqXHR) {
                    successCallback(res, textStatus, jqXHR);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        },
        get: (sUrl, oHeaders, successCallback, errorCallback) => {

            var that = this;

            if (typeof oHeaders === "function") {
                errorCallback = successCallback;
                successCallback = oHeaders;
                oHeaders = {};
            }

            jQuery.ajax({
                method: "GET",
                url: sUrl,
                headers: oHeaders,
                success: function (res, textStatus, jqXHR) {
                    successCallback(res, textStatus, jqXHR);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        },
        delete: (sUrl, oHeaders, successCallback, errorCallback) => {

            var that = this;

            if (typeof oHeaders === "function") {
                errorCallback = successCallback;
                successCallback = oHeaders;
                oHeaders = {};
            }

            jQuery.ajax({
                method: "DELETE",
                url: sUrl,
                headers: oHeaders,
                success: function (res, textStatus, jqXHR) {
                    successCallback(res, textStatus, jqXHR);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }
    });
});