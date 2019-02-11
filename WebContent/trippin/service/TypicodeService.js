sap.ui.define([
    "sapui5/demo/trippin/models/AppModel"
], function(AppModel) {
    var TypicodeService = class {
        constructor() {
            this._serviceUrl = "https://jsonplaceholder.typicode.com/";
        }

        getUsers(successCallback, errorCallback) {
            var url = this._serviceUrl + "users";

            var usersModel = new AppModel();

            usersModel.get(url, (res) => {

                usersModel.setData(res);

                if(successCallback) {
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

            return usersModel;
        }

        getUser(id, successCallback, errorCallback) {
            var url = this._serviceUrl + "users/" + id;

            var userModel = new AppModel();

            userModel.get(url, (res) => {

                userModel.setData(res);

                if(successCallback) {
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

            return userModel;
        }

        getPosts(successCallback, errorCallback) {
            var url = this._serviceUrl + "posts";

            var postsModel = new AppModel();

            postsModel.get(url, (res) => {

                postsModel.setData(res);

                if(successCallback) {
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

            return postsModel;
        }

        getPost(id, successCallback, errorCallback) {
            var url = this._serviceUrl + "posts/" + id;

            var postModel = new AppModel();

            postModel.get(url, (res) => {

                postModel.setData(res);

                if(successCallback) {
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

            return postModel;
        }

        getUserPosts(userId, successCallback, errorCallback) {
            var url = this._serviceUrl + "users/" + userId + "/posts";

            var postsModel = new AppModel();

            postsModel.get(url, (res) => {

                postsModel.setData(res);

                if(successCallback) {
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

            return postsModel;
        }

        getUserTodos(userId, successCallback, errorCallback) {
            var url = this._serviceUrl + "users/" + userId + "/todos";

            var todosModel = new AppModel();

            todosModel.get(url, (res) => {

                todosModel.setData(res);

                if(successCallback) {
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

            return todosModel;
        }

        getComments(postId, successCallback, errorCallback) {
            var url = this._serviceUrl + "posts/" + postId + "/comments";

            var commentsModel = new AppModel();

            commentsModel.get(url, (res) => {

                commentsModel.setData(res);

                if(successCallback) {
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

            return commentsModel;
        }
    };

    return new TypicodeService();
});