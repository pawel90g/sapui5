sap.ui.define([
    "sapui5/demo/trippin/models/AppModel",
	"sapui5/demo/trippin/models/formatters"
], function (AppModel, formatters) {
    var WeatherService = class {
        constructor() {
            this._owm = {
                apiKey: "ba273f66965a19ce9cd320bda8e78f29",
                serviceUrl: "https://api.openweathermap.org/data/2.5/",
                icon: {
                    url: "http://openweathermap.org/img/w/",
                    extension: ".png"
                }
            };

            this._wind = {
                N: { from: 348.75, to: 11.25 },
                NNE: { from: 11.25, to: 33.75 },
                NE: { from: 33.75, to: 56.25 },
                ENE: { from: 56.25, to: 78.75 },
                E: { from: 78.75, to: 101.25 },
                ESE: { from: 101.25, to: 123.75 },
                SE: { from: 123.75, to: 146.25 },
                SSE: { from: 146.25, to: 168.75 },
                S: { from: 168.75, to: 191.25 },
                SSW: { from: 191.25, to: 213.75 },
                SW: { from: 213.75, to: 236.25 },
                WSW: { from: 236.25, to: 258.75 },
                W: { from: 258.75, to: 281.25 },
                WNW: { from: 281.25, to: 303.75 },
                NW: { from: 303.75, to: 326.25 },
                NNW: { from: 326.25, to: 348.75 },

                getDirection: function (deg) {

                    var direction = "N";
                    if (deg <= 11.25 || deg >= 348.75) {
                        return direction;
                    }

                    var directions = Object.keys(this);
                    directions.forEach(k => {
                        if (this[k].from <= deg && this[k].to > deg) {
                            direction = k.toString();
                            return;
                        }
                    });

                    return direction;
                }
            };

            this._iF2CDegrees = -272.15,
                this._ocg = {
                    apiKey: "29b662cdf5864e2298675e055aec15c4",
                    serviceUrl: "https://api.opencagedata.com/geocode/v1/json"
                };
        }

        getWeather(coords, successCallback, errorCallback) {

            var that = this;

            let url = this._owm.serviceUrl + "weather?lat=" + coords.latitude + "&lon=" + coords.longitude + "&appid=" + this._owm.apiKey;

            let weatherModel = new AppModel();
            weatherModel.get(url, (res) => {
                res.datetime = new Date(res.dt * 1000);
                res.main.tempC = (res.main.temp + that._iF2CDegrees).toFixed(2);
                res.main.tempC_min = (res.main.temp_min + that._iF2CDegrees).toFixed(2);
                res.main.tempC_max = (res.main.temp_max + that._iF2CDegrees).toFixed(2);

                res.weather.forEach(w => {
                    w.iconUrl = that._owm.icon.url + w.icon + that._owm.icon.extension;
                });

                res.wind.direction = that._wind.getDirection(res.wind.deg);
                weatherModel.setData(res);

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

            return weatherModel;
        }

        getForecast(coords, successCallback, errorCallback) {
            var that = this;

            let url = this._owm.serviceUrl + "forecast?lat=" + coords.latitude + "&lon=" + coords.longitude + "&appid=" + this._owm.apiKey;

            let forecastModel = new AppModel();
            forecastModel.get(url, (res) => {

                res.chartsData = [];
                res.list.forEach(el => {
                    el.main.tempC = el.main.temp + that._iF2CDegrees;
                    el.main.tempC_min = el.main.temp_min + that._iF2CDegrees;
                    el.main.tempC_max = el.main.temp_max + that._iF2CDegrees;

                    let date = new Date(el.dt * 1000);
                    let formattedDate = formatters.formatDate(date, false, true, true);
                    let icon_url = that._owm.icon.url + el.weather[0].icon + that._owm.icon.extension;

                    res.chartsData.push({
                        date: formattedDate,
                        temperature: el.main.tempC,
                        temperature_min: el.main.tempC_min,
                        temperature_max: el.main.tempC_max,
                        pressure: el.main.pressure,
                        humidity: el.main.humidity,
                        weather_icon_url: icon_url
                    });
                });

                forecastModel.setData(res);

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

            return forecastModel;
        }
    };

    return new WeatherService();
});