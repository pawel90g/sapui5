sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/GoogleCalendarService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/formatters",
    "sap/m/MessageToast"
], function (BaseController, GoogleCalendarService, AppModel, formatters, MessageToast) {
    'use strict';

    return BaseController.extend("sapui5.demo.trippin.controller.GoogleCalendar", {
        formatters: formatters,
        onInit: function () {
            var that = this;

            jQuery.getScript("/trippin/js/jquery.base64.js", () => {
                $.base64.utf8encode = true;
            });

            GoogleCalendarService.setController(this);
            this.getView().setModel(new AppModel({ signedIn: false }), "signInStatus");

            document.addEventListener("gmail_signedIn", () => {
                let oView = that.getView();

                oView.setModel(new AppModel({ signedIn: true }), "signInStatus");
                let googleCalendarModel = new AppModel();
                oView.setModel(googleCalendarModel);

                var oCalendarsList = oView.byId("calendarsList");
                oCalendarsList.addEventDelegate({
                    "onAfterRendering": function () {

                        let calendars = googleCalendarModel.getProperty("/calendars");
                        calendars.forEach(c => {
                            let index = calendars.indexOf(c);

                            let $calDom = $("#__item0-mvcAppComponent---googleCalendar--calendarsList-" + index);
                            $calDom.css({
                                "background-color": c.backgroundColor,
                                "foreground-color": c.foregroundColor,
                                "padding": 0,
                                "margin": "15px 2px 15px 2px"
                            });

                            let $calCbDom = $("#__item0-mvcAppComponent---googleCalendar--calendarsList-" + index + " .sapMCb");
                            $calCbDom.css({
                                "margin-left": 0
                            });
                        });

                        oCalendarsList.getItems().forEach(oItem => {
                            oItem.setSelected(true);
                        });
                        oCalendarsList.fireSelectionChange();
                    }
                }, that);

                oView.byId("calendar").addEventDelegate({
                    "onAfterRendering": function (oEvent) {
                        let calendars = oView.getModel("events").getProperty("/");

                        calendars.forEach(cal => {
                            let index = calendars.indexOf(cal);

                            cal.events.forEach(ev => {
                                let evIndex = cal.events.indexOf(ev);

                                let $calDom = $("[id^='__appointment0-__row0-mvcAppComponent---googleCalendar--calendar-" + index + "-" + evIndex + "'] .sapUiCalendarAppCont");
                                $calDom.css({
                                    "background-color": ev.colorId ? GoogleCalendarService.colors.event[ev.colorId].background : cal.bg,
                                    "color": ev.colorId ? GoogleCalendarService.colors.event[ev.colorId].foreground : cal.fg
                                });
                            });
                        });
                    }
                }, that);

                GoogleCalendarService.loadCalendars(res => {
                    googleCalendarModel.setData({ calendars: res });
                });
            });
        },
        onExit: function () {

        },
        onAfterRendering: function () {
            $($("#__xmlview0").find("div")[0]).css("background-image", "linear-gradient(to bottom, #fff 0, #fff 50%, #fff 100%)");
            $("#__toolbar0").css("background-color", "#fff");
            $("#__page0-intHeader-BarLeft")
                .append($("<img>", {
                    "src": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Google_Calendar.png",
                    "height": "50"
                }).css("margin-left", "20px"));
        },
        onNavPress: function () {
            GoogleCalendarService.signOut();
            window.location.href = window.location.protocol + "//" + window.location.host;
        },
        onSignInClick: function () {
            GoogleCalendarService.signIn();
        },
        onSignOutClick: function () {
            GoogleCalendarService.signOut();
        },
        onRefreshClick: function () {
            let googleCalendarModel = new AppModel();
            this.getView().setModel(googleCalendarModel);

            GoogleCalendarService.loadCalendars(res => {
                googleCalendarModel.setData({ calendars: res });
            });
        },
        onMiniCalendarSelect: function (oEvent) {
            let oSelectedDates = oEvent.getSource().getSelectedDates();
            if (oSelectedDates && oSelectedDates.length > 0) {
                let startDate = oSelectedDates[0].getStartDate();
                this.getView().byId("calendar").setStartDate(startDate);
                this._renderCalendar();
            }
        },
        _renderCalendar: function (reload) {
            let oView = this.getView();
            let oCalendar = oView.byId("calendar");

            if (reload) {
                let calendarsList = oView.byId("calendarsList").getSelectedItems();

                var allEvents = [];
                var eventsModel = new AppModel(allEvents);
                oView.setModel(eventsModel, "events");

                let displayType = GoogleCalendarService.displayType[oCalendar.getViewKey().toString().toUpperCase().replace(" ", "_")];

                calendarsList.forEach(el => {

                    let index = calendarsList.indexOf(el);
                    let context = el.getBindingContext();
                    let calendar = context.getProperty(context.getPath());

                    GoogleCalendarService.getCalendarEvents(calendar.id, displayType, oCalendar.getStartDate(), events => {

                        let c = {
                            id: calendar.id,
                            name: calendar.summary,
                            bg: calendar.backgroundColor,
                            fg: calendar.foregroundColor,
                            events: events
                        };

                        allEvents.splice(index, 0, c);
                        eventsModel.refresh(true);
                        oCalendar.rerender();
                    });
                });
            } else {
                oCalendar.rerender();
            }
        },
        onCalendarStartDateChange: function () {
            this._renderCalendar(true);
        },
        onCalendarAppointmentSelect: function (oEvent) {
            this._renderCalendar();
            let oView = this.getView();

            let oAppointment = oEvent.getParameter("appointment");
            if (!oAppointment) return;

            let eventBindingPath = oAppointment.getBindingContext("events").getPath();
            this._selectedAppointment = oView.getModel("events").getProperty(eventBindingPath);

            let calendarBindingPath = oAppointment.getParent().getBindingContext("events").getPath();
            this._selectedCalendar = oView.getModel("events").getProperty(calendarBindingPath);

            this._showGoogleEventPopover(oEvent, oAppointment);
        },
        onCalendarViewChange: function () {
            this._renderCalendar(true);
        },
        onCalendarSelectionChange: function () {
            this._renderCalendar(true);
        },
        onGoogleEventPopoverClose: function () {
            if (this._selectedAppointment)
                delete this._selectedAppointment;

            if (this._selectedCalendar)
                delete this._selectedCalendar;

            if (this._oGoogleEventPopover) {
                this._oGoogleEventPopover.close();
            }
        },
        _showGoogleEventPopover: function (oEvent, oAppointment) {
            let oView = this.getView();
            if (!this._oGoogleEventPopover) {
                this._oGoogleEventPopover = sap.ui.xmlfragment("sapui5.demo.trippin.view.fragments.GoogleEvent", this);
                oView.addDependent(this._oGoogleEventPopover);
            }

            let bindingPath = oAppointment.getBindingContext("events").getPath();

            this._oGoogleEventPopover.bindElement({ path: bindingPath, model: "events" });
            this._oGoogleEventPopover.openBy(oEvent.getSource());
        },
        onAppointmentDrop: function (oEvent) {
            let oAppointment = oEvent.getParameter("appointment");

            let newStartDate = oEvent.getParameter("startDate");
            let newEndDate = oEvent.getParameter("endDate");

            this._objectToUpdate = {
                oAppointment: oAppointment,
                newStartDate: newStartDate,
                newEndDate: newEndDate
            };

            let appointmentModel = oAppointment.getBindingContext("events").getModel()
                .getProperty(oAppointment.getBindingContext("events").getPath());

            if (appointmentModel.recurrence) {
                if (!this._oOneOrAllDialog) {
                    this._oOneOrAllDialog = sap.ui.xmlfragment("gcalendarOneOrAll", "sapui5.demo.trippin.view.fragments.GoogleCalendarOneOrAll", this);
                    this.getView().addDependent(this._oOneOrAllDialog);
                }

                this._oOneOrAllDialog.open();
            }
            else {
                this._updateEvent();
            }
        },
        onOneOrAllOk: function () {
            let oFragment = sap.ui.core.Fragment;
            let rbAll = oFragment.byId("gcalendarOneOrAll", "rbAll").getSelected();

            this._updateEvent(rbAll);
            this._oOneOrAllDialog.close();
        },
        onOneOrAllCancel: function () {
            this._oOneOrAllDialog.close();
        },

        _updateEvent: function (all) {

            let oAppointmentParentBindingContext = this._objectToUpdate.oAppointment.getParent().getBindingContext("events");
            let calendarModel = oAppointmentParentBindingContext.getModel().getProperty(oAppointmentParentBindingContext.getPath());

            let oAppointmentBindingContext = this._objectToUpdate.oAppointment.getBindingContext("events");
            let appointmentModel = oAppointmentBindingContext.getModel().getProperty(oAppointmentBindingContext.getPath());

            var that = this;

            GoogleCalendarService.updateEvent(calendarModel.id, appointmentModel.id, all,
                {
                    old: {
                        start: appointmentModel.start,
                        allDay: appointmentModel.allDay
                    },
                    new: {
                        start: that._objectToUpdate.newStartDate,
                        end: that._objectToUpdate.newEndDate
                    }
                }, () => {
                    that._objectToUpdate.oAppointment.setStartDate(that._objectToUpdate.newStartDate).setEndDate(that._objectToUpdate.newEndDate);
                    that._renderCalendar();
                    delete this._objectToUpdate;
                    MessageToast.show("Event successfully updated");
                });
        },

        onIntervalSelect: function (oEvent) {

            let oView = this.getView();

            if (!this._oAddGoogleEvent) {
                this._oAddGoogleEvent = sap.ui.xmlfragment("addGoogleEvent", "sapui5.demo.trippin.view.fragments.AddGoogleEvent", this);
                oView.addDependent(this._oAddGoogleEvent);
                sap.ui.getCore().getMessageManager().registerObject(oView, true);
            }

            let startDate = oEvent.getParameter("startDate");
            let endDate = oEvent.getParameter("endDate");
            endDate.setMilliseconds(endDate.getMilliseconds() + 1);

            let calendarId = oView.getModel("events").getProperty(oEvent.getParameters().row.getBindingContext("events").getPath()).id;
            sap.ui.core.Fragment.byId("addGoogleEvent", "selectedCalendar").setSelectedKey(calendarId);

            let model = {
                "calendarId": calendarId,
            };
            Object.assign(model, this._prepareJsonModel(startDate, endDate));

            oView.setModel(new AppModel(model), "newEvent");

            sap.ui.core.Fragment.byId("addGoogleEvent", "repeatIntervalComboBox").setSelectedKey(0);

            this._oAddGoogleEvent.open();
        },

        _prepareJsonModel: function (startDate, endDate) {

            let dayOfWeekName;
            switch (startDate.getDay()) {
                case 0:
                    dayOfWeekName = "Niedzielę";
                    break;
                case 1:
                    dayOfWeekName = "Poniedziałek";
                    break;
                case 2:
                    dayOfWeekName = "Wtorek";
                    break;
                case 3:
                    dayOfWeekName = "Środę";
                    break;
                case 4:
                    dayOfWeekName = "Czwartek";
                    break;
                case 5:
                    dayOfWeekName = "Piątek";
                    break;
                case 6:
                    dayOfWeekName = "Sobotę";
                    break;
            }

            let weekOfMonth = Math.floor(startDate.getDate() / 7) + 1;

            return {
                "start": startDate,
                "end": endDate,
                "dayOfMonth": startDate.getDate(),
                "weekOfMonth": weekOfMonth,
                "dayOfWeek": startDate.getDay(),
                "dayOfWeekName": dayOfWeekName,
                "recurrence": false,
                "repeatEvery": 1,
                "repeatMonthly": 0,
            }
        },
        onAddEventCalendarSelect: function (oEvent) {
            this.getView().getModel("newEvent").setProperty("/calendarId", oEvent.getSource().getSelectedKey());
        },
        onNewEventClick: function () {
            let oView = this.getView();

            if (!this._oAddGoogleEvent) {
                this._oAddGoogleEvent = sap.ui.xmlfragment("addGoogleEvent", "sapui5.demo.trippin.view.fragments.AddGoogleEvent", this);
                oView.addDependent(this._oAddGoogleEvent);
                sap.ui.getCore().getMessageManager().registerObject(oView, true);
            }

            let currentDate = new Date();
            let minutes = currentDate.getMinutes();
            currentDate.setMinutes(minutes - (minutes % 15) + 15);
            let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), 0);
            let endDate = new Date(startDate.getTime());
            endDate.setMinutes(endDate.getMinutes() + 30);

            oView.setModel(new AppModel(this._prepareJsonModel(startDate, endDate)), "newEvent");
            sap.ui.core.Fragment.byId("addGoogleEvent", "repeatIntervalComboBox").setSelectedKey(0);

            this._oAddGoogleEvent.open();
        },
        onAddGoogleEvent: function (oEvent) {
            let model = this.getView().getModel("newEvent").getProperty("/");

            if(!model.calendarId) {
                MessageToast.show("Wybierz kalendarz, w którym ma by utworzone wydarzenie");
                return;
            }

            let that = this;

            if (model.recurrence) {

                model.endsOption = sap.ui.core.Fragment.byId("addGoogleEvent", "onWhenEndsSelected").getSelectedIndex();
                model.repeatInterval = parseInt(sap.ui.core.Fragment.byId("addGoogleEvent", "repeatIntervalComboBox").getSelectedKey());

                switch (model.repeatInterval) {
                    case 1:
                        let checked = $(".dayOfWeek input:checked");
                        let daysOfWeek = [];
                        checked.each((index, chObj) => {
                            daysOfWeek.push(chObj.name);
                        });
                        model.daysOfWeek = daysOfWeek;
                        break;
                    case 2:
                        model.repeatMonthly = parseInt(sap.ui.core.Fragment.byId("addGoogleEvent", "repeatMonthly").getSelectedKey());
                        break;
                }
            }

            GoogleCalendarService.addEvent(model.calendarId, model, () => {

                that._renderCalendar(true);
                MessageToast.show("Event successfully added");
            });

            this._oAddGoogleEvent.close();
        },
        onAddGoogleEventClose: function () {
            this._oAddGoogleEvent.close();
        },
        onRepeatIntervalChanged: function (oEvent) {
            let id = oEvent.getParameters().id;
            let modelName, propertyPath;

            if (id.indexOf("add") === 0) {
                modelName = "newEvent";
                propertyPath = "/repeatInterval";
            } else if (id.indexOf("edit") === 0) {
                modelName = "events";
                propertyPath = this._oEditGoogleEvent.getBindingContext("events").getPath() + "/repeatInterval";
            }

            if (!modelName) return;

            this.getView().getModel(modelName).setProperty(propertyPath, parseInt(oEvent.getSource().getSelectedKey()));
        },
        onWhenEndsSelected: function (oEvent) {
            let id = oEvent.getParameters().id;
            let modelName, propertyPath;

            if (id.indexOf("add") === 0) {
                modelName = "newEvent";
                propertyPath = "/endsType";
            } else if (id.indexOf("edit") === 0) {
                modelName = "events";
                propertyPath = this._oEditGoogleEvent.getBindingContext("events").getPath() + "/endsType";
            }

            if (!modelName) return;

            this.getView().getModel(modelName).setProperty(propertyPath, oEvent.getParameters().selectedIndex);
        },
        onStartDateTimeChange: function (oEvent) {
            let source = oEvent.getSource();
            let id = oEvent.getParameters().id;
            let endDateTimePicker;

            if (id.indexOf("add") === 0) {
                endDateTimePicker = sap.ui.core.Fragment.byId("addGoogleEvent", "endDateTimePicker");
            } else if (id.indexOf("edit") === 0) {
                endDateTimePicker = sap.ui.core.Fragment.byId("editGoogleEvent", "endDateTimePicker");
            }

            if (source.getDateValue() >= endDateTimePicker.getDateValue()) {
                let tempDate = new Date(source.getDateValue().getTime());
                tempDate.setMinutes(tempDate.getMinutes() + 30);
                endDateTimePicker.setDateValue(tempDate);
            }
        },
        onEndDateTimeChange: function (oEvent) {
            let source = oEvent.getSource();
            let id = oEvent.getParameters().id;
            let startDateTimePicker;

            if (id.indexOf("add") === 0) {
                startDateTimePicker = sap.ui.core.Fragment.byId("addGoogleEvent", "startDateTimePicker");
            } else if (id.indexOf("edit") === 0) {
                startDateTimePicker = sap.ui.core.Fragment.byId("editGoogleEvent", "startDateTimePicker");
            }

            if (source.getDateValue() <= startDateTimePicker.getDateValue()) {
                let tempDate = new Date(source.getDateValue().getTime());
                tempDate.setMinutes(tempDate.getMinutes() - 30);
                startDateTimePicker.setDateValue(tempDate);
            }
        },
        onEventDelete: function () {
            let eventId = this._selectedAppointment.id;
            let calendarId = this._selectedCalendar.id;

            var that = this;

            GoogleCalendarService.deleteEvent(calendarId, eventId, () => {
                this.onGoogleEventPopoverClose();
                that._renderCalendar(true);
                MessageToast.show("Event successfully deleted");
            });
        },
        onEventEdit: function (oEvent) {

            let oView = this.getView();

            //let eventId = this._selectedAppointment.id;
            //let calendarId = this._selectedCalendar.id;

            if (!this._oEditGoogleEvent) {
                this._oEditGoogleEvent = sap.ui.xmlfragment("editGoogleEvent", "sapui5.demo.trippin.view.fragments.EditGoogleEvent", this);
                oView.addDependent(this._oEditGoogleEvent);
                sap.ui.getCore().getMessageManager().registerObject(oView, true);
            }

            let oBindingContext = oEvent.getSource().getBindingContext("events");

            let jsonModel = oView.getModel("events").getProperty(oBindingContext.getPath());
            Object.assign(jsonModel, this._prepareJsonModel(jsonModel.start, jsonModel.end));
            oView.getModel("events").setProperty(oBindingContext.getPath(), jsonModel);

            this._oEditGoogleEvent.setBindingContext(oBindingContext, "events");
            this._oEditGoogleEvent.open();
        },
        onSaveEditedEvent: function () {

            let oView = this.getView();
            let sContextPath = this._oEditGoogleEvent.getBindingContext("events").getPath();

            let jsonModel = oView.getModel("events").getProperty(sContextPath);
            let calendarId = this._selectedCalendar.id;

            if (jsonModel.recurrence) {

                jsonModel.endsOption = sap.ui.core.Fragment.byId("editGoogleEvent", "onWhenEndsSelected").getSelectedIndex();
                jsonModel.repeatInterval = parseInt(sap.ui.core.Fragment.byId("editGoogleEvent", "repeatIntervalComboBox").getSelectedKey());

                switch (jsonModel.repeatInterval) {
                    case 1:
                        let checked = $(".dayOfWeek input:checked");
                        let daysOfWeek = [];
                        checked.each((index, chObj) => {
                            daysOfWeek.push(chObj.name);
                        });
                        jsonModel.daysOfWeek = daysOfWeek;
                        break;
                    case 2:
                        jsonModel.repeatMonthly = parseInt(sap.ui.core.Fragment.byId("editGoogleEvent", "repeatMonthly").getSelectedKey());
                        break;
                }
            }

            let that = this;

            GoogleCalendarService.updateEvent2(calendarId, jsonModel.id, jsonModel, res => {

                MessageToast.show("Event successfully updated");

                that._renderCalendar(true);
                that.onGoogleEventPopoverClose();
                if (that._oEditGoogleEvent)
                    that._oEditGoogleEvent.close();
            });
        },
        onEditGoogleEventClose: function () {
            if (this._oEditGoogleEvent)
                this._oEditGoogleEvent.close();
        }
    });
});