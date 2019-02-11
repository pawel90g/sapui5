sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/models/AppModel"
], function (BaseController, AppModel) {
    return BaseController.extend("sapui5.demo.trippin.controller.SapUi5", {
        onInit: function () {
            var pdfManualUrl = "https://help.sap.com/SAPUI5_PDF/SAPUI5.pdf";
            var fileName = pdfManualUrl.split("/").pop();

            var path = pdfManualUrl.indexOf("http") > -1 ? pdfManualUrl : jQuery.sap.getModulePath("sapui5.demo.trippin.view.SapUi5", pdfManualUrl);

            var oModel = new AppModel({
                Source: path,
                Title: fileName,
                Height: "800px"
            });

            this.getView().setModel(oModel);
        },
        onNavPress: function () {
            this.getRouter().navTo("master");
        }
    });
});