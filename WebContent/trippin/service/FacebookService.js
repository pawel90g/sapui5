sap.ui.define([
    "sapui5/demo/trippin/models/AppModel"
], function (AppModel) {
    'use strict';

    var FacebookService = class {
        constructor() {
            this.config = {
                appId: '1972794896364634',
                cookie: true,  // enable cookies to allow the server to access 
                // the session
                xfbml: true,  // parse social plugins on this page
                version: 'v3.0' // use graph api version 2.8
            }
        }

        init() {
            const that = this;
            window.fbAsyncInit = function () {
                FB.init(that.config);
                document.dispatchEvent(new Event("facebook-initialized"));
            };

            document.addEventListener("facebook-initialized", () => {
                document.removeEventListener("facebook-initialized", () => { }, true);

                that.loginStatus();
            }, true);

            let id = 'facebook-jssdk';
            let s = 'script';
            let js, fjs = document.getElementsByTagName(s)[0];
            if (document.getElementById(id)) { return; }
            js = document.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }

        login() {
            let that = this;
            FB.login(response => {
                if (response.authResponse) {
                    sessionStorage.setItem("fb-accessToken", response.authResponse.accessToken);
                    that.fbAccessToken = response.authResponse.accessToken;
                    that.fbUserID = response.authResponse.userID;
                    that.me();
                }
            }, {
                    scope: [
                        'public_profile',
                        'email',
                        'user_friends',
                        'user_likes',
                        'user_posts',
                        'user_photos',
                        'pages_messaging'
                    ].join(',')
                });
        }

        logout() {
            FB.logout();
        }

        loginStatus() {
            let that = this;
            FB.getLoginStatus(response => {
                if (response.status === 'connected') {
                    that.me();
                } else {
                    that.login();
                }
            });
        }

        me() {
            FB.api('/me', resp => {
                console.log('Successful login for: ' + resp.name);
                sessionStorage.setItem("fb-myId", resp.id);
                document.dispatchEvent(new Event("facebook-ready"));
            });
        }

        feed(user) {
            if (!user) {
                user = "me";
            }
            FB.api('/' + user + '/feed', resp => {
                console.log(resp);
            });
        }

        uploadedPhotos(user, callback) {
            if (!user) {
                user = "me";
            }
            let filter = { fields: "images,name,created_time", type: "uploaded" };

            FB.api('/' + user + '/photos', 'GET', filter, resp => {
                callback(resp);
            });
        }

        taggedPhotos(user, callback) {
            if (!user) {
                user = "me";
            }
            let filter = { fields: "images,name,created_time" };

            FB.api('/' + user + '/photos', 'GET', filter, resp => {
                callback(resp);
            });
        }

        photos(user, callback) {

            if (typeof user === "function" && !callback) {
                callback = user;
                user = undefined;
            }

            let that = this;
            this.uploadedPhotos(user, resp => {
                that.taggedPhotos(user, resp2 => {
                    let photos = resp.data.concat(resp2.data);
                    photos.sort((a, b) => {
                        if (new Date(a.created_time) > new Date(b.created_time)) {
                            return 1;
                        }

                        return -1;
                    });

                    callback(photos)
                });
            });
        }

        objectComments(objectId, callback) {
            FB.api("/" + objectId + "/comments", { fields: "created_time,from,message,like_count,user_likes" }, resp => {
                callback(resp.data.sort((a, b) => {
                    if (new Date(a.created_time) > new Date(b.created_time)) {
                        return 1;
                    }

                    return -1;
                }));
            });
        }
    }

    let fbSrv = new FacebookService();
    fbSrv.init();
    return fbSrv;
});