sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/ODataService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog"
], function (BaseController, ODataService, AppModel, BusyDialog) {
    "use strict";

    return BaseController.extend("sapui5.demo.trippin.controller.Airports", {
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

            var oAirportsModel = new AppModel();
            
            ODataService.airports(res => {
                oAirportsModel.setData(res);
                that._oBusyDialog.close(true);
            });

            this.getView().setModel(oAirportsModel, "airports");
        },
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this._configMap();
            this._loadData();
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onNavPress: function () {
            this.getRouter().navTo("master");
        },
        onSpotClick: function (oEvent) {
            var oSpot = oEvent.getSource();
            var oContext = oSpot.getBindingContext("airports");
            var sPath = oContext.getPath();

            var oAirport = this.getView().getModel("airports").getProperty(sPath);

            this.getRouter().navTo("airport", {
                IcaoCode: oAirport.IcaoCode
            })
        }
    });
});