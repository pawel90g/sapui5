sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sapui5/demo/trippin/service/TypicodeService",
], function (BaseController, AppModel, BusyDialog, TypicodeService) {
    'use strict';

    return BaseController.extend("sapui5.demo.trippin.controller.Todos", {
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            var that = this;

            this._oBusyDialog.open(true);
            var usersModel = TypicodeService.getUsers(() => {
                that._oBusyDialog.close(true);
            });

            this.getView().setModel(usersModel, "users");
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onUserSelect: function (oEvent) {
            var that = this;

            var id = oEvent.getParameters().item.getBindingContext("users").getProperty("id");
            this._oBusyDialog.open(true);

            var todosModel = TypicodeService.getUserTodos(id, (res) => {
                that._oBusyDialog.close(true);
            });

            this.getView().setModel(todosModel, "todos");
        },
        getSelectedRowContext: function (sTableId, fnCallback) {
            var oTable = this.getView().byId(sTableId);
            var iSelectedIndex = oTable.getSelectedIndex();

            if (iSelectedIndex === -1) {
                MessageToast.show("Please select a row!");
                return;
            }

            var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
            if (oSelectedContext && fnCallback) {
                fnCallback.call(this, oSelectedContext, iSelectedIndex, oTable);
            }

            return oSelectedContext;
        },
        moveToCompleted: function (oEvent) {
            this.getSelectedRowContext("todoTable", (oSelectedRowContext, iSelectedRowIndex, todoTable) => { 
                var oModel = this.getView().getModel("todos");
                oModel.setProperty("completed", true, oSelectedRowContext);
                oModel.refresh(true);
            });
        },
        moveToToDo: function (oEvent) {
            this.getSelectedRowContext("completedTable", (oSelectedRowContext, iSelectedRowIndex, completedTable) => { 
                var oModel = this.getView().getModel("todos");
                oModel.setProperty("completed", false, oSelectedRowContext);
                oModel.refresh(true);
            });
        },
        onDragStart: function (oEvent) {
            var oDraggedRow = oEvent.getParameter("target");
            var oDragSession = oEvent.getParameter("dragSession");

            oDragSession.setComplexData("draggedRowContext", oDraggedRow.getBindingContext("todos"));
        },
        onDropToDo: function (oEvent) {

            var oDragSession = oEvent.getParameter("dragSession");
            var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
            if (!oDraggedRowContext) {
                return;
            }
            var oModel = this.getView().getModel("todos");
            oModel.setProperty("completed", false, oDraggedRowContext);
            oModel.refresh(true);
        },
        onDropCompleted: function (oEvent) {
            var oDragSession = oEvent.getParameter("dragSession");
            var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
            if (!oDraggedRowContext) {
                return;
            }
            var oModel = this.getView().getModel("todos");
            oModel.setProperty("completed", true, oDraggedRowContext);
            oModel.refresh(true);
        },
        onNavPress: function () {
            this.getRouter().navTo("master");
        }
    });
});