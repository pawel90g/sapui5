sap.ui.define([
    "sapui5/demo/trippin/models/AppModel"
], function(AppModel) {
    var GeocoderService = class {
        constructor() {
            this._ocg = {
                apiKey: "29b662cdf5864e2298675e055aec15c4",
                serviceUrl: "https://api.opencagedata.com/geocode/v1/json"
            };
        }

        getLatLngByName(name, successCallback, errorCallback) {
            var url = this._ocg.serviceUrl + "?q=" + name + "&key=" + this._ocg.apiKey;

            var locationModel = new AppModel();

            locationModel.get(url, (res) => {

                locationModel.setData(res);

                if (successCallback) {
                    successCallback(res);
                }    

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback) {
                    errorCallback();
                }
            });

            return locationModel;
        }
    };

    return new GeocoderService();
});