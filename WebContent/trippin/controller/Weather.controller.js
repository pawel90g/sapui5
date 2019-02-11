sap.ui.define([
	"sapui5/demo/trippin/controller/BaseController",
	"sapui5/demo/trippin/service/WeatherService",
	"sapui5/demo/trippin/service/GeocoderService",
	"sapui5/demo/trippin/service/WikiService",
	"sapui5/demo/trippin/models/BusyDialog",
	"sapui5/demo/trippin/models/AppModel",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/m/MessageToast",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
], function (BaseController, WeatherService, GeocoderService, WikiService, BusyDialog, AppModel, FlattenedDataset,
	FeedItem, MessageToast, ChartFormatter, Format) {

		return BaseController.extend("sapui5.demo.trippin.controller.Weather", {
			_runWeatherInterval: function () {
				if (this.currentCoords) {
					var that = this;
					jQuery.sap.delayedCall(1000 * 60 * 15, this, () => {
						that._loadWeather(that.currentCoords);
					});
				}
			},
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


			_loadLatLngByName: function (name) {
				var oView = this.getView();
				var that = this;

				var oLocationModel = GeocoderService.getLatLngByName(name, (res) => {
					if (res.results.length === 0) {
						that._busyDialog.close();
						MessageToast.show(this.getResourceBundle().getText("noResults"));
						return;
					}

					if (res.results.length === 1) {
						that.getView().setModel(new AppModel(res.results[0]), "searched");
						that._loadWeather({
							latitude: res.results[0].geometry.lat,
							longitude: res.results[0].geometry.lng
						});

						return;
					}

					this._busyDialog.close();

					if (that.locationsDialog === undefined) {
						that.locationsDialog = sap.ui.xmlfragment("selectLocationDialog", "sapui5.demo.trippin.view.fragments.LocationsList", that);
						oView.addDependent(that.locationsDialog);
					}

					that.locationsDialog.open();
				});

				oView.setModel(oLocationModel, "searchedLocations");
			},
			_loadWeather: function (coords) {
				var that = this;
				let oWeatherModel = new AppModel();
				WeatherService.getWeather(coords, (res) => {
					that._loadForecast(coords);

					var searchedModel = that.getView().getModel("searched");
					if (searchedModel) {
						let formatted = searchedModel.getProperty("/formatted");
						if (formatted) {
							res.name = formatted;
						}
					}

					oWeatherModel.setData(res);
				});

				this.getView().setModel(oWeatherModel);

				that._runWeatherInterval();
			},
			_prepareCharts: function () {

				this._busyDialog.open(true);

				var feedItems = {
					temperature: {
						'uid': "primaryValues",
						'type': "Measure",
						'values': ["temperature"]
					},
					humidity: {
						'uid': "primaryValues",
						'type': "Measure",
						'values': ["humidity"]
					},
					pressure: {
						'uid': "primaryValues",
						'type': "Measure",
						'values': ["pressure"]
					},
					date: {
						'uid': "axisLabels",
						'type': "Dimension",
						'values': ["date"]
					}
				};

				this.oTemperatureVizFrame = this.getView().byId("temperatureChartVizFrame");
				this.oTemperatureVizFrame.setDataset(new FlattenedDataset({
					dimensions: [{
						name: 'date',
						value: "{date}"
					}],
					measures: [{
						group: 1,
						name: 'temperature',
						value: '{temperature}'
					}],
					data: {
						path: "/Forecast"
					}
				}));
				this.oTemperatureVizFrame.addFeed(new FeedItem(feedItems.temperature));
				this.oTemperatureVizFrame.addFeed(new FeedItem(feedItems.date));
				this.oTemperatureVizFrame.setVizType("line");

				this.descriptionPopover = this.getView().byId("descriptionPopOver");
				var that = this;
				var oBundle = this.getResourceBundle();
				this.descriptionPopover.setCustomDataControl((obj) => {

					let index = obj.data.val[1].value;
					let forecast = that.oTemperatureVizFrame.getModel().getProperty("/Forecast/" + index);

					let oVLayout = new sap.ui.layout.VerticalLayout({
						content: [
							new sap.m.Label({ text: obj.data.val[0].value }),
							new sap.m.Label({ text: oBundle.getText("temperature") + ": " + forecast.temperature.toFixed(2) + " *C" }),
							new sap.m.Label({ text: oBundle.getText("pressure") + ": " + forecast.pressure + " hPa" }),
							new sap.m.Label({ text: oBundle.getText("humidity") + ": " + forecast.humidity + "%" })
						]
					});

					oVLayout.addStyleClass("sapUiTinyMarginBeginEnd");

					let oHLayout = new sap.ui.layout.HorizontalLayout({
						content: [
							new sap.m.Image({
								src: forecast.weather_icon_url,
								height: "60px"
							}),
							oVLayout
						]
					});

					oHLayout.addStyleClass("sapUiResponsiveMargin");

					return oHLayout
				});


				this.descriptionPopover.connect(this.oTemperatureVizFrame.getVizUid());

				this.oHumidityVizFrame = this.getView().byId("humidityChartVizFrame");
				this.oHumidityVizFrame.setDataset(new FlattenedDataset({
					dimensions: [{
						name: 'date',
						value: "{date}"
					}],
					measures: [{
						group: 1,
						name: 'humidity',
						value: '{humidity}'
					}],
					data: {
						path: "/Forecast"
					}
				}));

				this.oHumidityVizFrame.addFeed(new FeedItem(feedItems.humidity));
				this.oHumidityVizFrame.addFeed(new FeedItem(feedItems.date));
				this.oHumidityVizFrame.setVizType("line");

				this.oPressureVizFrame = this.getView().byId("pressureChartVizFrame");
				this.oPressureVizFrame.setDataset(new FlattenedDataset({
					dimensions: [{
						name: 'date',
						value: "{date}"
					}],
					measures: [{
						group: 1,
						name: 'pressure',
						value: '{pressure}'
					}],
					data: {
						path: "/Forecast"
					}
				}));

				this.oPressureVizFrame.addFeed(new FeedItem(feedItems.pressure));
				this.oPressureVizFrame.addFeed(new FeedItem(feedItems.date));
				this.oPressureVizFrame.setVizType("line");

				this._busyDialog.close(true);
			},
			_loadForecast: function (coords) {

				let currentLocation = new AppModel(coords);
				this.getView().setModel(currentLocation, "currentLocation");

				var that = this;

				WeatherService.getForecast(coords, (res) => {
					that.oTemperatureVizFrame.setModel(new AppModel({
						Forecast: res.chartsData
					}));

					that.oHumidityVizFrame.setModel(new AppModel({
						Forecast: res.chartsData
					}));

					that.oPressureVizFrame.setModel(new AppModel({
						Forecast: res.chartsData
					}));


					this._busyDialog.close();
				});
			},
			onInit: function () {
				this._busyDialog = new BusyDialog(this);
				this._prepareCharts();
				this._configMap();

				var that = this;
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function (position) {
						that.currentCoords = position.coords;
						that._busyDialog.open();
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
			onExit: function () {
				this._busyDialog.destroy();
			},
			onNavPress: function () {
				this.getRouter().navTo("master");
			},
			onLocationSearch: function (oEvent) {
				let sValue = oEvent.getSource().getValue();

				this._busyDialog.open();
				this._loadLatLngByName(sValue);
			},
			onLocationSelect: function (oEvent) {
				let oSelectedItem = oEvent.getSource().getSelectedItem();
				let index = oSelectedItem.getParent().indexOfItem(oSelectedItem);

				let selectedLocation = this.getView().getModel("searchedLocations").getProperty("/results/" + index);
				console.log(selectedLocation);

				this.getView().setModel(new AppModel(selectedLocation), "searched");
				this.onLocationDialogClose();

				this._loadWeather({
					latitude: selectedLocation.geometry.lat,
					longitude: selectedLocation.geometry.lng
				});
			},
			onLocationDialogClose: function () {
				this.locationsDialog.close();
			}, onWikiClick: function () {
				var that = this;


				let sName = this.getView().getModel().getProperty("/name");

				let oSearched = this.getView().getModel("searched");
				if (oSearched) {
					let oSearchedDataComponents = oSearched.getProperty("/").components;

					sName = oSearchedDataComponents.city ? oSearchedDataComponents.city : oSearchedDataComponents.town;
				}

				WikiService.search(sName, (res) => {

					that.getView().setModel(new AppModel({
						title: sName,
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