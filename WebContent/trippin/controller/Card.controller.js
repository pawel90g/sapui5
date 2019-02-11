sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController"
], function (BaseController) {
    return BaseController.extend("sapui5.demo.trippin.controller.Card", {

        onNavPress: function () {
            this.getRouter().navTo("master");
        },
        onInClick: function () {
            window.open("https://www.linkedin.com/in/pawe%C5%82-garbacik-3872b6a8/", "_linkedIn");
        },
        onTwitterClick: function () {
            window.open("https://twitter.com/pawel90g", "_twitter");
        }
    });
});