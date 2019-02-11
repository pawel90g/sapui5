sap.ui.define([
    "sapui5/demo/trippin/controller/BaseController",
    "sapui5/demo/trippin/service/TypicodeService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/BusyDialog",
    "sap/m/MessageToast"
], function (BaseController, TypicodeService, AppModel, BusyDialog, MessageToast) {
    return BaseController.extend("sapui5.demo.trippin.controller.Posts", {
        _loadData: function () {
            this._oBusyDialog.open(true);
            var that = this;

            var postsModel = new AppModel();
            TypicodeService.getPosts((res) => {

                postsModel.setData(res);

                res.forEach((post) => {
                    TypicodeService.getUser(post.userId, (userRes) => {
                        post.user = userRes;
                        postsModel.refresh(true);
                    });
    
                    TypicodeService.getComments(post.id, (commentsRes) => {
                        post.comments = commentsRes;
                        postsModel.refresh(true);
                    });
                });

                that._oBusyDialog.close(true);
            });

            this.getView().setModel(postsModel);
        },
        onInit: function () {
            this._oBusyDialog = new BusyDialog(this);
            this._loadData();
        },
        onExit: function () {
            this._oBusyDialog.destroy();
        },
        onNavPress: function () {
            var oModel = this.getView().getModel();
            var oData = oModel.getProperty("/0/user");

            this.getRouter().navTo("master");
        }
    });
});