sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/service/ImageService",
    "sapui5/demo/trippin/service/WikiService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/ui/core/routing/History"
], function (BaseController, ODataService, ImageService, WikiService, AppModel, BusyDialog, History) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Airport", {
        _configMap: function () {
            let oGeoMap = this.getView().byId("map");
            let oMapConfig = {
                "MapProvider": [{
                    "name": "MAPQUEST_OSM",
                    "type": "",
                    "description": "",
                    "tileX": "256",
                    "tileY": "256",
                    "minLOD": "3",
                    "maxLOD": "18",
                    "copyright": "Tiles Courtesy of MapQuest © OpenStreetMap under ODbL v1.0",
                    "Source": [{
                        "id": "s1",
                        "url": "https://a.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
                    }, {
                        "id": "s2",
                        "url": "https://b.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
                    }, {
                        "id": "s3",
                        "url": "https://c.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
                    }]
                }],
                "MapLayerStacks": [{
                    "name": "DEFAULT",
                    "MapLayer": {
                        "name": "layer1",
                        "refMapProvider": "MAPQUEST_OSM",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                    }
                }]
            };

            oGeoMap.setMapConfiguration(oMapConfig);
            oGeoMap.setRefMapLayerStack("DEFAULT");
        },
        _loadData: function () {
            this._oBusyDialog.open(true);
            var that = this;

            var oAirportModel = new AppModel();

            ODataService.airport(this.sIcaoCode, res => {
                oAirportModel.setData(res);

                that.sAirportName = res.Name;
                ImageService.get(res.Name, function (img) {
                    res.Url = img;
                    oAirportModel.refresh(true);
                });

                that._oBusyDialog.close(true);
            });

            this.getView().setModel(oAirportModel);
        },
        _onDetailMatched: function (oEvent) {

            this.sIcaoCode = oEvent.getParameter("arguments").IcaoCode;

            this._loadData();
        },
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this._configMap();
            this.getRouter().getRoute("airport").attachPatternMatched(this._onDetailMatched, this);
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onNavPress: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("airports");
            }
        },
        onAirportEdit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("editAirport", {
                IcaoCode: this.sIcaoCode
            });
        },
        onSpotClick: function () {
            let oMap = this.getView().byId("map");

            let coords = this.getView().getModel().getProperty("/Location/Loc");
            oMap.setCenterPosition(coords.coordinates[0] + ";" + coords.coordinates[1]);

            oMap.setZoomlevel(14);
        },
        onWikiClick: function () {
            let sAirportName = this.sAirportName;
            var that = this;

            WikiService.search(sAirportName, (res) => {

                that.getView().setModel(new AppModel({
                    title: sAirportName,
                    url: res
                }), "html");

                if (that.oHtmlViewer === undefined) {
                    that.oHtmlViewer = sap.ui.xmlfragment("sapui5.demo.trippin.view.fragments.HtmlViewer", this);
                    that.getView().addDependent(that.oHtmlViewer);
                }

                this.oHtmlViewer.open();
            });
        },
        onWikiClose: function () {
            this.oHtmlViewer.close();
        },
        onIframeBack: function () {
            window.top.history.go(-1);
        }
    });
});