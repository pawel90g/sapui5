sap.ui.define([
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/formatters"
], function (AppModel, formatters) {
    'use strict';

    var ODataService = class {
        constructor() {
            this._serviceUrl = "http://services.odata.org/TripPinRESTierService/";
            this._identifier = "(S(5ozslsgdz2is0dpddpf5htdn))";
        }

        people(filter, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People";

            if (typeof filter === "function") {
                errorCallback = successCallback;
                successCallback = filter;
                filter = undefined;
            }

            if (filter) {
                url += "?$filter=FirstName eq '" + filter + "' or LastName eq '" + filter + "'";
            }

            let peopleModel = new AppModel();

            peopleModel.get(url, (res) => {
                peopleModel.setData(res);

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
            return peopleModel;
        }

        person(name, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + name + "')";

            let personModel = new AppModel();

            personModel.get(url, (res) => {
                personModel.setData(res);

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
            return personModel;
        }

        updatePerson(name, personObj, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + name + "')";

            let personModel = new AppModel();

            personModel.patchForce(personObj, url, (res) => {
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
        }

        trips(username, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + username + "')/Trips";

            let tripsModel = new AppModel();

            tripsModel.get(url, (res) => {

                res.trips = [];
                var firstDate = new Date();

                res.value.forEach(trip => {
                    var startsAt = trip.StartsAt;
                    var endsAt = trip.EndsAt;
                    var startDate = new Date(startsAt);
                    var endDate = new Date(endsAt);
                    endDate.setDate(endDate.getDate() + 1);

                    if (firstDate > startDate) {
                        firstDate = startDate;
                    }

                    res.trips.push(
                        {
                            appointments: [{
                                start: startDate,
                                end: endDate,
                                title: trip.Name,
                                description: trip.Description,
                                tags: trip.Tags,
                                from: formatters.formatDate(startDate, true),
                                to: formatters.formatDate(endDate, true)
                            }]
                        }
                    );
                });

                res.startDate = firstDate;

                tripsModel.setData(res);

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
            return tripsModel;
        }

        trip(username, tripId, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + username + "')/Trips(" + tripId + ")";

            let tripModel = new AppModel();

            tripModel.get(url, (res) => {

                var startDate = new Date(res.StartsAt);
                var endDate = new Date(res.EndsAt);
                endDate.setDate(endDate.getDate() + 1);
                res.StartDate = startDate;
                res.EndDate = endDate;

                var rows = [{
                    appointments: [{
                        start: startDate,
                        end: endDate,
                        title: res.Name
                    }]
                }];

                res.Rows = rows;

                tripModel.setData(res);

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
            return tripModel;
        }


        tripInvolvedPeople(username, tripId, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + username + "')/Trips(" + tripId + ")/Microsoft.OData.Service.Sample.TrippinInMemory.Models.GetInvolvedPeople";

            let involvedPeopleModel = new AppModel();

            involvedPeopleModel.get(url, (res) => {

                involvedPeopleModel.setData(res);

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
            return involvedPeopleModel;
        }

        shareTrip(tripId, username, peopleToInvolve, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + username + "')/Microsoft.OData.Service.Sample.TrippinInMemory.Models.ShareTrip";

            var shareTripModel = new AppModel();

            if (Array.isArray(peopleToInvolve)) {
                var requests = [];

                peopleToInvolve.forEach(p => {
                    requests.push(shareTripModel.postForce({ userName: p, tripId: tripId }, url));
                });

                jQuery.when(...requests).then(() => {
                    if (successCallback)
                        successCallback();
                }, () => {
                    if (errorCallback)
                        errorCallback();
                });

            } else {
                shareTripModel.postForce({ userName: peopleToInvolve, tripId: tripId }, url, (res) => {
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
            }
        }

        friends(username, successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/People('" + username + "')/Friends";

            let friendsModel = new AppModel();

            friendsModel.get(url, (res) => {
                friendsModel.setData(res);

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
            return friendsModel;
        }

        airports(successCallback, errorCallback) {
            let url = this._serviceUrl + this._identifier + "/Airports";

            let airportsModel = new AppModel();

            airportsModel.get(url, (res) => {

                res.value.forEach(el => {
                    var coords = el.Location.Loc.coordinates;
                    var sapUi5Coords = coords[0] + ";" + coords[1] + ";0";
                    el.Location.Loc.sapUi5Coords = sapUi5Coords;
                });

                airportsModel.setData(res);

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
            return airportsModel;
        }

        airport(code, successCallback, errorCallback) {

            let url = this._serviceUrl + this._identifier + "/Airports('" + code + "')";

            let airportModel = new AppModel();

            airportModel.get(url, (res) => {

                let coords = res.Location.Loc.coordinates;
                res.Location.Loc.sapUi5Coords = coords[0] + ";" + coords[1] + ";0";

                airportModel.setData(res);

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
            return airportModel;
        }
    };

    return new ODataService();
});