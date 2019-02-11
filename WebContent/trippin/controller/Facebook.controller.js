sap.ui.define([
    'sapui5/demo/trippin/controller/BaseController',
    "sapui5/demo/trippin/service/FacebookService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/formatters",
    "sap/m/MessageToast"
], function (BaseController, FacebookService, AppModel, formatters, MessageToast) {
    'use strict';

    return BaseController.extend("sapui5.demo.trippin.controller.Facebook", {
        formatters: formatters,

        onInit: function () {
            const that = this;
            const oCarousel = this.byId("carousel");

            oCarousel.destroyPages();

            this.photos = {};

            document.addEventListener("facebook-ready", () => {
                FacebookService.photos(photos => {
                    photos.forEach(photo => {

                        that.photos["img_" + photo.id.toString()] = photo;

                        oCarousel.addPage(new sap.m.Image("img_" + photo.id.toString(), {
                            src: photo.images[0].source,
                            alt: photo.name,
                            densityAware: false,
                            decorative: false
                        }));
                    });
                });
            }, true);
        },
        onAfterRendering: function () {
            const that = this;
            const oCarousel = this.byId("carousel");

            oCarousel.addEventDelegate({
                "onAfterRendering": function () {
                    that._loadComments(oCarousel.getActivePage());
                }
            });

            $($("#__xmlview0").find("div")[0]).css("background-image", "linear-gradient(to bottom, #fff 0, #fff 50%, #fff 100%)");
            $("#__toolbar0").css("background-color", "#fff");
            $("#__page0-intHeader").css({
                "background-color": "#4267b2"
            });
            $("#__page0-intHeader span").css("color", "#fff");
            $("#__page0-intHeader-BarLeft")
                .append($("<img>", {
                    "src": "https://www.freeiconspng.com/uploads/facebook-f-logo-white-background-21.jpg",
                    "height": "40"
                }).css({
                    "margin-left": "20px",
                    "margin-top": "5px",
                }));
        },
        onNavPress: function () {
            window.location.href = window.location.protocol + "//" + window.location.host;
        },
        onSignOutClick: function () {
            FacebookService.logout();

            const oCarousel = this.byId("carousel");
            oCarousel.destroyPages();
        },
        onPageChanged: function (oEvent) {
            this._loadComments(oEvent.getParameters().newActivePageId);
        },
        _loadComments: function (id) {
            let photo = this.photos[id];
            let oView = this.getView();

            const oLabel = this.byId("carouselLabel");
            oLabel.setText(photo.name);

            FacebookService.objectComments(photo.id, comments => {
                oView.setModel(new AppModel({ comments: comments }));
            });
        },
        sendMessage: function () {
            FacebookService.sendMessage();
        }
    });
});
