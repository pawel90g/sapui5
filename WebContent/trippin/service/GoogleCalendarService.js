sap.ui.define([
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/formatters"
], function (AppModel, formatters) {
    'use strict';

    const GoogleCalendarService = class {
        constructor() {
            var that = this;

            this.displayType = {
                HOUR: 0,
                DAY: 1,
                WEEK: 2,
                MONTH: 3,
                ONE_MONTH: 4
            };

            this.dayOfWeek = {
                SU: 0,
                MO: 1,
                TU: 2,
                WE: 3,
                TH: 4,
                FR: 5,
                SA: 6
            };

            this.dayOfWeek2 = {
                0: "SU",
                1: "MO",
                2: "TU",
                3: "WE",
                4: "TH",
                5: "FR",
                6: "SA"
            };

            this.CLIENT_ID = '563896066067-4n84flpr75m7h5jqdq7pbdg38lpj6pfk.apps.googleusercontent.com';
            this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
            this.SCOPES = 'https://www.googleapis.com/auth/calendar';

            jQuery.getScript("https://apis.google.com/js/api.js",
                function () {
                    gapi.load('client:auth2', () => {
                        that.onload = function () { };
                        that.initClient(that);
                    })
                });
        }

        setController(controller) {
            this.controller = controller;
        }

        initClient(that) {
            gapi.client.init({
                discoveryDocs: that.DISCOVERY_DOCS,
                clientId: that.CLIENT_ID,
                scope: that.SCOPES
            }).then(function () {
                gapi.auth2.getAuthInstance().isSignedIn.listen(that.updateSigninStatus);
                that.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                that.loadColors();
            });
        }

        signIn() {
            gapi.auth2.getAuthInstance().signIn();
        }

        signOut() {
            gapi.auth2.getAuthInstance().signOut();
        }

        updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
                document.dispatchEvent(new Event("gmail_signedIn"));
            } else {
                document.dispatchEvent(new Event("gmail_signedOut"));
            }
        }

        loadColors() {
            var that = this;
            gapi.client.calendar.colors.get().then(res => {
                that.colors = res.result;
            });
        }

        loadCalendars(successCallback) {
            var calendarsModel = new AppModel();
            var that = this;
            gapi.client.calendar.calendarList.list().then(res => {

                calendarsModel.setData(res.result.items);

                if (successCallback)
                    successCallback(res.result.items);
            });

            return calendarsModel;
        }

        _parseRecurrence(event) {
            if (!event.recurrence) {
                return;
            }

            let rrule = event.recurrence.find(r => {
                return r.indexOf("RRULE") === 0;
            });

            if (!rrule) {
                return;
            }

            rrule = rrule.toString().split(":")[1];

            let rulesObj = {};

            let rules = rrule.split(";");
            rules.forEach(r => {
                rulesObj[r.split("=")[0]] = r.split("=")[1];
            });

            let rdateObj = {};
            let rdate = event.recurrence.find(r => {
                return r.indexOf("RDATE") === 0;
            });

            if (rdate) {
                rdate = rdate.split(";")[1];
                rdateObj.type = rdate.split('=')[0];
                let val = rdate.split('=')[1];
                rdateObj[val.split(":")[0]] = val.split(":")[1].split(',');
            }

            let exdateObj = {};
            let exdate = event.recurrence.find(r => {
                return r.indexOf("EXDATE") === 0;
            });

            if (exdate) {
                exdate = exdate.split(";")[1];
                exdateObj.type = exdate.split('=')[0];
                let val = exdate.split('=')[1];
                exdateObj[val.split(":")[0]] = val.split(":")[1].split(',');
            }

            return {
                rrule: rulesObj,
                exdate: Object.keys(exdateObj).length > 0 ? exdateObj : undefined,
                rdate: Object.keys(rdateObj).length > 0 ? rdateObj : undefined
            };
        }

        getCalendarEvents(calendarId, displayType, startDate, successCallback) {

            if (successCallback === undefined && typeof startDate === "function") {
                successCallback = startDate;
                startDate = undefined;
            }

            let calendarModel = new AppModel();
            var that = this;

            let timeMax;
            let timeMin = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : undefined;
            if (displayType === this.displayType.HOUR) {
                if (!timeMin) {
                    timeMin = new Date();
                }
                timeMax = new Date();
                timeMax.setTime(timeMin.getTime());
                timeMax.setHours(timeMax.getHours() + 12);
            } else if (displayType === this.displayType.DAY) {
                if (!timeMin) {
                    timeMin = new Date();
                    timeMin.setHours(0);
                    timeMin.setMinutes(0);
                    timeMin.setSeconds(0);
                }
                timeMax = new Date();
                timeMax.setTime(timeMin.getTime());
                timeMax.setDate(timeMax.getDate() + 1);
            } else if (displayType === this.displayType.WEEK) {
                if (!timeMin) {
                    let today = new Date();
                    timeMin = new Date();
                    timeMin.setDate(today.getDate() - today.getDay());
                    timeMin.setHours(0);
                    timeMin.setMinutes(0);
                    timeMin.setSeconds(0);
                }
                timeMax = new Date();
                timeMax.setTime(timeMin.getTime());
                timeMax.setDate(timeMin.getDate() + 8);
            } else if (displayType === this.displayType.MONTH) {
                if (!timeMin) {
                    timeMin = new Date();
                    timeMin.setHours(0);
                    timeMin.setMinutes(0);
                    timeMin.setSeconds(0);
                    timeMin.setDate(1);
                }
                timeMax = new Date();
                timeMax.setTime(timeMin.getTime());
                timeMax.setDate(1);
                timeMax.setMonth(timeMax.getMonth() + 12);
                timeMax.setDate(timeMax.getDate() - 1);
            }

            else if (displayType === this.displayType.ONE_MONTH) {
                if (!timeMin) {
                    timeMin = new Date();
                    timeMin.setHours(0);
                    timeMin.setMinutes(0);
                    timeMin.setSeconds(0);
                    timeMin.setDate(1);
                }
                timeMax = new Date();
                timeMax.setTime(timeMin.getTime());
                timeMax.setDate(1);
                timeMax.setMonth(timeMax.getMonth() + 1);
                timeMax.setDate(timeMax.getDate() - 1);
            }

            gapi.client.calendar.events.list({
                calendarId: calendarId,
                timeMin: timeMin.toJSON(),
                timeMax: timeMax.toJSON()
            }).then(res => {
                let items = res.result.items;

                let events = [];

                items.forEach(i => {

                    if (i.status === "cancelled") {
                        return;
                    }

                    let rec = this._parseRecurrence(i);

                    if (rec) {
                        let start, end, allDay;
                        if (i.start.dateTime && i.end.dateTime) {
                            allDay = false;
                            start = new Date(i.start.dateTime);
                            end = new Date(i.end.dateTime);
                        } else {
                            allDay = true;
                            let startDate = new Date(i.start.date);
                            let endDate = new Date(i.end.date);
                            start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
                            end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
                        }
                        let startH = start.getHours();
                        let startM = start.getMinutes();
                        let endH = end.getHours();
                        let endM = end.getMinutes();

                        let currentDate = new Date(start.getTime());

                        if (rec.rrule.UNTIL) {
                            let until = new Date(rec.rrule.UNTIL);
                            if (until < timeMax) {
                                timeMax = until;
                            }
                        }

                        while (currentDate <= timeMax) {

                            let eventStart = new Date(currentDate.getTime());
                            eventStart.setHours(startH);
                            eventStart.setMinutes(startM);

                            let eventEnd = new Date(currentDate.getTime());
                            eventEnd.setHours(endH);
                            eventEnd.setMinutes(endM);

                            let e = {};
                            e.start = eventStart;
                            e.end = eventEnd;
                            e.summary = i.summary;
                            e.id = i.id;
                            e.colorId = i.colorId;
                            e.htmlLink = i.htmlLink;
                            e.recurrence = i.recurrence;

                            let exdateType = rec.exdate ? rec.exdate.type : undefined;
                            let dateValueArr = rec.exdate ? Object.values(rec.exdate)[1] : [];

                            switch (rec.rrule.FREQ) {
                                case "DAILY":

                                    if (!exdateType ||
                                        (exdateType === "VALUE" &&
                                            dateValueArr.indexOf(formatters.formatDateTime2(e.start, "yyyyMMdd")) === -1) ||
                                        (exdateType === "TZID" &&
                                            dateValueArr.indexOf(formatters.formatDateTime2(e.start, "yyyyMMddTHHmmss")) === -1)) {

                                        events.push(e);
                                    }

                                    currentDate.setDate(currentDate.getDate() + (rec.rrule.INTERVAL ? parseInt(rec.rrule.INTERVAL) : 1));
                                    break;
                                case "WEEKLY":
                                    if (rec.rrule.BYDAY) {
                                        let days = rec.rrule.BYDAY.split(",");
                                        days.every(d => {
                                            let eClone = JSON.parse(JSON.stringify(e));
                                            let tempDate = new Date(currentDate.getTime());
                                            let dayNumber = that.dayOfWeek[d];
                                            tempDate.setDate(tempDate.getDate() - tempDate.getDay() + dayNumber);
                                            eClone.start = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), startH, startM, 0);
                                            eClone.end = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), endH, endM, 0);

                                            if (!exdateType ||
                                                (exdateType === "VALUE" &&
                                                    dateValueArr.indexOf(formatters.formatDateTime2(eClone.start, "yyyyMMdd")) === -1) ||
                                                (exdateType === "TZID" &&
                                                    dateValueArr.indexOf(formatters.formatDateTime2(eClone.start, "yyyyMMddTHHmmss")) === -1)) {

                                                events.push(eClone);
                                            }

                                            if (rec.rrule.COUNT) {
                                                rec.rrule.COUNT--;
                
                                                if (rec.rrule.COUNT === 1) {
                                                    return false;
                                                }
                                            }

                                            return true;
                                        });
                                    }

                                    currentDate.setDate(currentDate.getDate() + (rec.rrule.INTERVAL ? parseInt(rec.rrule.INTERVAL) : 1) * 7);
                                    break;

                                case "MONTHLY":
                                    if (rec.rrule.BYMONTHDAY) {

                                        let eClone = JSON.parse(JSON.stringify(e));
                                        eClone.start = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(rec.rrule.BYMONTHDAY), startH, startM, 0);
                                        eClone.end = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(rec.rrule.BYMONTHDAY), endH, endM, 0);

                                        if (startH === 0 && endH === 0 && startM === 0 && endM === 0) {
                                            eClone.end.setDate(eClone.end.getDate() + 1);
                                        }

                                        if (!exdateType ||
                                            (exdateType === "VALUE" &&
                                                dateValueArr.indexOf(formatters.formatDateTime2(eClone.start, "yyyyMMdd")) === -1) ||
                                            (exdateType === "TZID" &&
                                                dateValueArr.indexOf(formatters.formatDateTime2(eClone.start, "yyyyMMddTHHmmss")) === -1)) {

                                            events.push(eClone);
                                        }
                                    }

                                    currentDate.setMonth(currentDate.getMonth() + (rec.rrule.INTERVAL ? parseInt(rec.rrule.INTERVAL) : 1));
                                    break;

                                case "YEARLY":
                                    let eClone = JSON.parse(JSON.stringify(e));
                                    eClone.start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), startH, startM, 0);
                                    eClone.end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), endH, endM, 0);

                                    if (startH === 0 && endH === 0 && startM === 0 && endM === 0) {
                                        eClone.end.setDate(eClone.end.getDate() + 1);
                                    }

                                    if (!exdateType ||
                                        (exdateType === "VALUE" &&
                                            dateValueArr.indexOf(formatters.formatDateTime2(eClone.start, "yyyyMMdd")) === -1) ||
                                        (exdateType === "TZID" &&
                                            dateValueArr.indexOf(formatters.formatDateTime2(eClone.start, "yyyyMMddTHHmmss")) === -1)) {

                                        events.push(eClone);
                                    }
                                    currentDate.setFullYear(currentDate.getFullYear() + (rec.rrule.INTERVAL ? parseInt(rec.rrule.INTERVAL) : 1));
                                    break;
                            }

                            if (rec.rrule.COUNT) {
                                rec.rrule.COUNT--;

                                if (rec.rrule.COUNT === 0) {
                                    break;
                                }
                            }
                        }

                        if (rec.rdate) {
                            let rdateType = rec.rdate.type;
                            let rdateValueArr = Object.values(rec.rdate)[1];

                            let hDelta = endH - startH;
                            let mDelta = endM - startM;

                            let e = {};
                            e.summary = i.summary;
                            e.id = i.id;
                            e.colorId = i.colorId;
                            e.htmlLink = i.htmlLink;
                            e.recurrence = i.recurrence;

                            rdateValueArr.forEach(dEl => {
                                let eClone = JSON.parse(JSON.stringify(e));
                                eClone.end = new Date();
                                if (rdateType === "VALUE") {
                                    eClone.start = formatters.parseExactDateTime(dEl, "yyyyMMdd");
                                    eClone.end.setTime(eClone.start.getTime());
                                    eClone.end.setDate(eClone.end.getDate() + 1);
                                    eClone.allDay = true;
                                } else if (rdateType === "TZID") {
                                    eClone.start = formatters.parseExactDateTime(dEl, "yyyyMMddTHHmmss");
                                    eClone.end.setTime(eClone.start.getTime());
                                    eClone.end.setMinutes(eClone.end.getMinutes() + mDelta);
                                    eClone.end.setHours(eClone.end.getHours() + hDelta);
                                    eClone.allDay = false;
                                }

                                events.push(eClone);
                            });
                        }
                    } else {
                        let e = {};
                        if (i.start.dateTime && i.end.dateTime) {
                            e.allDay = false;
                            e.start = new Date(i.start.dateTime);
                            e.end = new Date(i.end.dateTime);
                        } else {
                            e.allDay = true;
                            let startDate = new Date(i.start.date);
                            let endDate = new Date(i.end.date);
                            e.start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
                            e.end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
                        }
                        e.summary = i.summary;
                        e.id = i.id;
                        e.htmlLink = i.htmlLink;
                        e.colorId = i.colorId;

                        events.push(e);
                    }
                });

                events.sort((a, b) => {
                    if (a.start > b.start)
                        return 1;
                    return -1;
                });

                calendarModel.setData(events);

                if (successCallback) {
                    successCallback(events);
                }
            });

            return calendarModel;
        }

        _createRule(data) {
            if (!data.recurrence) {
                return undefined;
            }

            let rrule = "";
            switch (data.repeatInterval) {
                case 0:
                    rrule = "RRULE:FREQ=DAILY";
                    break;
                case 1:
                    rrule = "RRULE:FREQ=WEEKLY";
                    break;
                case 2:
                    rrule = "RRULE:FREQ=MONTHLY";
                    break;
                case 3:
                    rrule = "RRULE:FREQ=YEARLY";
                    break;
            }

            switch (data.repeatInterval) {
                case 1:
                    rrule += ";BYDAY=" + data.daysOfWeek.join(",");
                    break;
                case 2:
                    switch (data.repeatMonthly) {
                        case 1:
                            rrule += ";BYDAY=" + data.weekOfMonth + this.dayOfWeek2[data.dayOfWeek];
                            break;
                    }
                    break;
            }

            if(data.repeatEvery) {
                rrule += ";INTERVAL=" + data.repeatEvery;
            }

            switch (data.endsOption) {
                case 0: //never
                    break;
                case 1: // until date
                    rrule += ";UNTIL=" + formatters.formatDateTime2(formatters.parseExactDateTime(data.endsOnDate, "dd.MM.yyyy"), "yyyyMMdd");
                    break;
                case 2: // count
                    rrule += ";COUNT=" + data.afterTimes;
                    break;
            }

            return rrule;
        }

        addEvent(calendarId, data, successCallback) {

            if ((data.end - data.start) / (1000 * 60 * 60 * 24) === 1) {
                data.allDay = true;
            }

            let start = data.allDay ? formatters.formatDateTime2(data.start, "yyyy-MM-dd") : formatters.formatDateTime2(data.start, "yyyy-MM-ddTHH:mm:ssGMT");
            let end = data.allDay ? formatters.formatDateTime2(data.end, "yyyy-MM-dd") : formatters.formatDateTime2(data.end, "yyyy-MM-ddTHH:mm:ssGMT");
            let resource = {
                "start": data.allDay ? { date: start } : { dateTime: start },
                "end": data.allDay ? { date: end } : { dateTime: end }
            };

            if (data.summary) {
                resource.summary = data.summary;
            }
            if (data.description) {
                resource.description = data.description;
            }

            if (data.recurrence) {
                resource.recurrence = [this._createRule(data)];
            }

            gapi.client.calendar.events.insert({
                "calendarId": calendarId,
                "resource": resource
            }).then(res => {
                if (successCallback) {
                    successCallback(res);
                } else {
                    console.log(res);
                }
            }, err => {
                console.log(err);
            });
        }

        updateEvent(calendarId, eventId, all, data, successCallback) {

            var that = this;

            gapi.client.calendar.events.get({
                'calendarId': calendarId,
                'eventId': eventId
            }).then(res => {

                let gEvent = res.result;

                if (!all && gEvent.recurrence) {
                    let timeZone = gEvent.start.timeZone;

                    let exDateRule = gEvent.recurrence.find(el => { return el.indexOf("EXDATE") === 0; });
                    let exDateRuleIndex = gEvent.recurrence.indexOf(exDateRule);
                    var exType, exDateRules, exDateStr;
                    if (exDateRule) {
                        exDateRule = exDateRule.split(";")[1];
                        exType = exDateRule.split("=")[0];
                        exDateRules = exDateRule.split(":")[1].split(",");
                    }

                    let rDateRule = gEvent.recurrence.find(el => { return el.indexOf("RDATE") === 0; });
                    let rDateRuleIndex = gEvent.recurrence.indexOf(rDateRule);
                    var rType, rDateRules, rDateStr;
                    if (rDateRule) {
                        rDateRule = rDateRule.split(";")[1];
                        rType = rDateRule.split("=")[0];
                        rDateRules = rDateRule.split(":")[1].split(",");
                    }

                    if (data.old.allDay) {
                        exDateStr = formatters.formatDateTime2(data.old.start, "yyyyMMdd");
                        rDateStr = formatters.formatDateTime2(data.new.start, "yyyyMMdd");
                    } else {
                        exDateStr = formatters.formatDateTime2(data.old.start, "yyyyMMddTHHmm00");
                        rDateStr = formatters.formatDateTime2(data.new.start, "yyyyMMddTHHmm00");
                    }

                    if (rDateRules && rDateRules.indexOf(exDateStr) > -1) {
                        rDateRules = rDateRules.length === 1 ? [] : rDateRules.splice(rDateRules.indexOf(exDateStr), 1);
                    } else {
                        if (exDateRules) {
                            exDateRules.push(exDateStr);
                        } else {
                            exDateRules = [exDateStr]
                        }
                    }

                    if (exDateRules && exDateRules.indexOf(rDateStr) > -1) {
                        exDateRules = exDateRules.length === 1 ? [] : exDateRules.splice(exDateRules.indexOf(rDateStr), 1);
                    } else {
                        if (rDateRules) {
                            rDateRules.push(rDateStr);
                        } else {
                            rDateRules = [rDateStr];
                        }
                    }

                    exDateRule = "EXDATE;" + (data.old.allDay ? "VALUE=DATE:" : ("TZID=" + timeZone + ":")) + exDateRules.join(",");
                    rDateRule = "RDATE;" + (data.old.allDay ? "VALUE=DATE:" : ("TZID=" + timeZone + ":")) + rDateRules.join(",");

                    if (rDateRuleIndex === -1) {
                        gEvent.recurrence.push(rDateRule);
                    } else {
                        if (rDateRules.length === 0) {
                            gEvent.recurrence.splice(rDateRuleIndex, 1);
                            if (exDateRuleIndex > rDateRuleIndex) exDateRuleIndex--;
                        } else {
                            gEvent.recurrence[rDateRuleIndex] = rDateRule;
                        }
                    }

                    if (exDateRuleIndex === -1) {
                        gEvent.recurrence.push(exDateRule);
                    } else {
                        if (exDateRules.length === 0) {
                            gEvent.recurrence.splice(exDateRuleIndex, 1);
                        } else {
                            gEvent.recurrence[exDateRuleIndex] = exDateRule;
                        }
                    }

                    gapi.client.calendar.events.patch({
                        'calendarId': calendarId,
                        'eventId': eventId,
                        'resource': {
                            "recurrence": gEvent.recurrence
                        }
                    }).then(res => {
                        if (successCallback) {
                            successCallback(res);
                        } else {
                            console.log(res);
                        }
                    }, err => {
                        console.log(err);
                    });

                } else if (!all && !gEvent.recurrence) {

                    if (gEvent.start.date) {
                        gEvent.start.date = formatters.formatDateTime2(data.new.start, "yyyy-MM-dd");
                    } else if (gEvent.start.dateTime) {
                        gEvent.start.dateTime = formatters.formatDateTime2(data.new.start, "yyyy-MM-ddTHH:mm:ssGMT");
                    }

                    if (gEvent.end.date) {
                        gEvent.end.date = formatters.formatDateTime2(data.new.end, "yyyy-MM-dd");
                    } else if (gEvent.end.dateTime) {
                        gEvent.end.dateTime = formatters.formatDateTime2(data.new.end, "yyyy-MM-ddTHH:mm:ssGMT");
                    }

                    gapi.client.calendar.events.patch({
                        'calendarId': calendarId,
                        'eventId': eventId,
                        'resource': {
                            "start": gEvent.start,
                            "end": gEvent.end
                        }
                    }).then(res => {
                        if (successCallback) {
                            successCallback(res);
                        } else {
                            console.log(res);
                        }
                    }, err => {
                        console.log(err);
                    });
                } else if (all && gEvent.recurrence) {

                    let newStart = data.new.start;
                    let oldStart = data.old.start;

                    if (data.old.allDay) {
                        let eventDate = formatters.parseExactDateTime(gEvent.start.date, "yyyy-MM-dd");
                        let deltaDays = Math.floor((newStart - eventDate) / (1000 * 60 * 60 * 24));
                        gEvent.start.date = formatters.formatDateTime2((eventDate.getDate() + deltaDays), "yyyy-MM-dd");
                        gEvent.end.date = formatters.formatDateTime2((eventDate.getDate() + deltaDays + 1), "yyyy-MM-dd");

                        gapi.client.calendar.events.patch({
                            'calendarId': calendarId,
                            'eventId': eventId,
                            'resource': {
                                "start": gEvent.start,
                                "end": gEvent.end
                            }
                        }).then(res => {
                            if (successCallback) {
                                successCallback(res);
                            } else {
                                console.log(res);
                            }
                        }, err => {
                            console.log(err);
                        });

                    } else {

                        let eventDate = formatters.parseExactDateTime(gEvent.start.dateTime, "yyyy-MM-ddTHH:mm:ssGMT");
                        let newEvStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), data.new.start.getHours(), data.new.start.getMinutes(), 0);
                        let newEvEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), data.new.end.getHours(), data.new.end.getMinutes(), 0);
                        gEvent.start.dateTime = formatters.formatDateTime2(newEvStart, "yyyy-MM-ddTHH:mm:ssGMT");
                        gEvent.end.dateTime = formatters.formatDateTime2(newEvEnd, "yyyy-MM-ddTHH:mm:ssGMT");

                        if (newStart.getDay() !== oldStart.getDay()) {

                            let oldDayOfWeek = that.dayOfWeek2[oldStart.getDay()];
                            let newDayOfWeek = that.dayOfWeek2[newStart.getDay()];

                            let rrule = gEvent.recurrence.find(el => { return el.indexOf("RRULE") === 0; });
                            if (!rrule) {
                                return;
                            }
                            let rruleIndex = gEvent.recurrence.indexOf(rrule);

                            rrule = rrule.toString().split(":")[1];

                            let rulesObj = {};

                            let rules = rrule.split(";");
                            rules.forEach(r => {
                                rulesObj[r.split("=")[0]] = r.split("=")[1];
                            });

                            let oldRule, newRule;
                            if (rulesObj.BYDAY) {
                                oldRule = "BYDAY=" + rulesObj.BYDAY;
                                newRule = "BYDAY=" + rulesObj.BYDAY.replace(oldDayOfWeek, newDayOfWeek);
                            }

                            if (rulesObj.BYMONTHDAY) {
                                oldRule = "BYMONTHDAY=" + rulesObj.BYMONTHDAY;
                                newRule = "BYMONTHDAY=" + rulesObj.BYMONTHDAY.replace(oldDayOfWeek, newDayOfWeek);
                            }

                            gEvent.recurrence[rruleIndex] = "RRULE:" + rrule.replace(oldRule, newRule);
                        }

                        gapi.client.calendar.events.patch({
                            'calendarId': calendarId,
                            'eventId': eventId,
                            'resource': {
                                "start": gEvent.start,
                                "end": gEvent.end,
                                "recurrence": gEvent.recurrence
                            }
                        }).then(res => {
                            if (successCallback) {
                                successCallback(res);
                            } else {
                                console.log(res);
                            }
                        }, err => {
                            console.log(err);
                        });
                    }
                }
            });
        }

        updateEvent2(calendarId, eventId, data, successCallback) {
            if ((data.end - data.start) / (1000 * 60 * 60 * 24) === 1) {
                data.allDay = true;
            }

            let start = data.allDay ? formatters.formatDateTime2(data.start, "yyyy-MM-dd") : formatters.formatDateTime2(data.start, "yyyy-MM-ddTHH:mm:ssGMT");
            let end = data.allDay ? formatters.formatDateTime2(data.end, "yyyy-MM-dd") : formatters.formatDateTime2(data.end, "yyyy-MM-ddTHH:mm:ssGMT");
            let resource = {
                "start": data.allDay ? { date: start } : { dateTime: start },
                "end": data.allDay ? { date: end } : { dateTime: end }
            };

            if (!data.allDay) {
                resource.start.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                resource.end.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            }

            if (data.summary) {
                resource.summary = data.summary;
            }
            if (data.description) {
                resource.description = data.description;
            }

            if (data.recurrence) {
                resource.recurrence = [this._createRule(data)];
            }

            gapi.client.calendar.events.patch({
                "calendarId": calendarId,
                "eventId": eventId,
                "resource": resource
            }).then(res => {
                if (successCallback) {
                    successCallback(res);
                } else {
                    console.log(res);
                }
            }, err => {
                console.log(err);
            });
        }

        deleteEvent(calendarId, eventId, successCallback) {
            var that = this;
            gapi.client.calendar.events.delete({
                'calendarId': calendarId,
                'eventId': eventId
            }).then(res => {
                if (successCallback) {
                    successCallback(res);
                } else {
                    console.log(res);
                }
            }, err => {
                console.log(err);
            });
        }
    }

    return new GoogleCalendarService();
});