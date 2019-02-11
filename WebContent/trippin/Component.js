sap.ui.define([
    "sap/ui/core/UIComponent",
], function (UIComponent) {
    'use strict';

    return UIComponent.extend("sapui5.demo.trippin.Component", {
        metadata: {
            manifest: "json"
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        },
        createContent: function () {
            return UIComponent.prototype.createContent.apply(this, arguments);
        }
    });
});