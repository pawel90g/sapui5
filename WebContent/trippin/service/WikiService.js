sap.ui.define([
    'sapui5/demo/trippin/models/AppModel',
    "sapui5/demo/trippin/models/textTools"
], function (AppModel, textTools) {
    'use strict';

    var WikiService = class {
        constructor(lang) {
            if (lang.indexOf("-") > -1) {
                lang = lang.split("-")[0];
            }

            this._wikiLink = "https://" + lang + ".wikipedia.org/w/api.php";
        }

        search(query, successCallback, errorCallback) {

            console.log("oryginal q = " + query);
            query = textTools.replacePolishCharsInText(query);
            console.log("without polish chars q = " + query);

            let url = this._wikiLink + "?action=opensearch&search=" + query;

            let wikiResultsModel = new AppModel();
            wikiResultsModel.getForce({}, url, (res) => {

                let json = JSON.parse(res);
                let urlArr = JSON.parse(res)[3];
                if (urlArr.length > 0) {

                    if (successCallback)
                            successCallback(urlArr[0]);
                }

            }, (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);

                if (errorCallback)
                    errorCallback();
            });

            return wikiResultsModel;
        }
    };

    return new WikiService(sap.ui.getCore().getConfiguration().getLanguage());
});