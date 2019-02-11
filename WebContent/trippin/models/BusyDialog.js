sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Fragment"
], function (Object, Fragment) {
    "use strict";

    return Object.extend("sapui5.demo.trippin.models.BusyDialog", {
        constructor: function (controller) {
            this._controller = controller;
        },
        create: function (light) {
            var oView = this._controller.getView();

            if (light) {
                if (this.__lightBusyDialog === undefined) {
                    let id = sap.ui.core.Fragment.createId("lightBusyDialog", oView.getId());
                    this.__lightBusyDialog = sap.ui.xmlfragment(id, "sapui5.demo.trippin.view.fragments.LightBusyDialog", this._controller);
                    oView.addDependent(this.__lightBusyDialog);
                }
            } else {
                if (this.__busyDialog === undefined) {
                    let id = sap.ui.core.Fragment.createId("busyDialog", oView.getId());
                    this.__busyDialog = sap.ui.xmlfragment(id, "sapui5.demo.trippin.view.fragments.BusyDialog", this._controller);
                    oView.addDependent(this.__busyDialog);
                }
            }
        },
        open: function (light) {

            this.create(light);

            if (light) {
                this.__lightBusyDialog.open();
            } else {
                this.__busyDialog.open();
            }
        },
        close: function (light) {
            if (light) {
                if (this.__lightBusyDialog)
                    this.__lightBusyDialog.close();
            } else {
                if (this.__busyDialog)
                    this.__busyDialog.close();
            }
        },
        destroy: function () {
            if (this.__lightBusyDialog) {
                this.__lightBusyDialog.destroy(true);
            }

            if (this.__busyDialog) {
                this.__busyDialog.destroy(true);
            }
        }
    });
});