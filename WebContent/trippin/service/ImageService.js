sap.ui.define([
    "sapui5/demo/trippin/models/AppModel"
], function (AppModel) {
    var ImageService = class {
        constructor() {
            this._serviceUrl = "http://www.splashbase.co/api/v1/images/search";
        }

        get(q, successCallback, errorCallback) {
            var imageModel = new AppModel();
            var url = this._serviceUrl + "?query=" + q;
            imageModel.get(url, (res) => {
                var result = res.images && res.images.length > 0 ? res.images[0].url : null;

                imageModel.setData(result);
                successCallback(result);

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback();
                }
            });

            return imageModel;
        }
    };

    return new ImageService();
});