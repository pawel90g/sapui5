sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/WeatherService",
    "sapui5/demo/trippin/models/AppModel"
], function (BaseController, WeatherService, AppModel) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Master", {
        _runWeatherInterval: function () {
            if (this.currentCoords) {
                var that = this;
                jQuery.sap.delayedCall(1000 * 60, this, () => {
                    that._loadWeather(that.currentCoords);
                });
            }
        },
        _loadWeather: function (coords) {
            var that = this;

            WeatherService.getWeather(coords, (res) => {
                var info = res.main.humidity + "% / " + res.main.pressure + " hPa";
                that.getView().setModel(new AppModel({
                    icon: res.weather[0].iconUrl,
                    number: res.main.tempC,
                    numberUnit: "*C",
                    title: res.name,
                    info: info
                }), "weatherTile");

                that._runWeatherInterval();
            });
        },
        onInit: function (oEvent) {

            var bundle = this.getResourceBundle();
            var title = bundle.getText("weather");

            this.getView().setModel(new AppModel({
                icon: "sap-icon://weather-proofing",
                title: title
            }), "weatherTile");

            if (navigator.geolocation) {
                var that = this;
                navigator.geolocation.getCurrentPosition(function (position) {
                    that.currentCoords = position.coords;
                    that._loadWeather(position.coords);
                }, function (err) {
                    console.error(err);
                }, {
                        timeout: 30000,
                        enableHighAccuracy: true,
                        maximumAge: 75000
                    });
            }
        },
        onPeopleTileClick: function () {
            this.getRouter().navTo("people");
        },
        onAirportsTileClick: function () {
            this.getRouter().navTo("airports");
        },
        onSAPUI5Click: function () {
            this.getRouter().navTo("sapui5");
        },
        onWeatherClick: function () {
            this.getRouter().navTo("weather");
        },
        onTodosClick: function () {
            this.getRouter().navTo("todos");
        },
        onPostsClick: function () {
            this.getRouter().navTo("posts");
        },
        onPeopleTestClick: function () {
            window.open("trippin/test/People.html", "_blank");
        },
        onAppointmentsClick: function () {
            this.getRouter().navTo("appointments");
        },
        onPersonalCardClick: function () {
            this.getRouter().navTo("card");
        },
        onPlLangClick: function() {
            window.location = "?sap-ui-language=pl";
        },
        onEnLangClick: function() {
            window.location = "?sap-ui-language=en";
        },
        onDeLangClick: function() {
            window.location = "?sap-ui-language=de";
        },
        onGmailClick: function() {
            this.getRouter().navTo("gmail");
        },
        onGoogleCalendarClick: function() {
            this.getRouter().navTo("googleCalendar");
        },
        onFacebookClick: function() {
            this.getRouter().navTo("facebook");
        }
    });
});