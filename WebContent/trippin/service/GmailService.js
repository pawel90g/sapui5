sap.ui.define([
    "sapui5/demo/trippin/models/AppModel"
], function (AppModel) {
    'use strict';

    var GmailService = class {
        constructor() {

            this._labelsConfig = {
                "CATEGORY_PERSONAL": { icon: "sap-icon://private" },
                "CATEGORY_SOCIAL": { icon: "sap-icon://collaborate" },
                "CATEGORY_FORUMS": { icon: "sap-icon://citizen-connect" },
                "IMPORTANT": { icon: "sap-icon://flag" },
                "CATEGORY_UPDATES": { icon: "sap-icon://notification-2" },
                "CHAT": { icon: "sap-icon://comment" },
                "SENT": { icon: "sap-icon://paper-plane" },
                "INBOX": { icon: "sap-icon://inbox" },
                "TRASH": { icon: "sap-icon://delete" },
                "CATEGORY_PROMOTIONS": { icon: "sap-icon://blank-tag-2" },
                "DRAFT": { icon: "sap-icon://notes" },
                "SPAM": { icon: "sap-icon://warning" },
                "STARRED": { icon: "sap-icon://favorite" },
                "UNREAD": { icon: "sap-icon://email" },
            };

            var that = this;

            this.CLIENT_ID = '563896066067-4n84flpr75m7h5jqdq7pbdg38lpj6pfk.apps.googleusercontent.com';
            this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
            this.SCOPES = 'https://www.googleapis.com/auth/gmail.compose';

            jQuery.getScript("https://apis.google.com/js/api.js",
                function () {
                    gapi.load('client:auth2', () => {
                        that.onload = function () { };
                        that.initClient(that);
                    })
                });
        }

        initClient(that) {
            gapi.client.init({
                discoveryDocs: that.DISCOVERY_DOCS,
                clientId: that.CLIENT_ID,
                scope: that.SCOPES
            }).then(function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(that.updateSigninStatus);

                // Handle the initial sign-in state.
                that.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            });
        }

        setController(controller) {
            this.controller = controller;
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

        getProfile(successCallback) {
            gapi.client.gmail.users.getProfile({
                'userId': 'me'
            }).then(res => {
                if (successCallback)
                    successCallback(res.emailAddress);
            });
        }

        loadLabels(successCallback) {
            var labelsModel = new AppModel();
            var that = this;
            gapi.client.gmail.users.labels.list({
                'userId': 'me'
            }).then(res => {

                res.result.labels.forEach(l => {
                    l.icon = that._labelsConfig[l.id].icon;
                });
                
                if(that.controller) {
                    let bundle = that.controller.getResourceBundle();
                    res.result.labels.forEach(l => {
                        l.translated = bundle.getText(l.id);
                    });
                } else {
                    console.log('controller not defined');
                    res.result.labels.forEach(l => {
                        l.translated = l.id;
                    });
                }

                let labels = res.result.labels.sort((a, b) => {
                    if (a.id.indexOf("CATEGORY") === 0 && b.id.indexOf("CATEGORY") === -1) {
                        return 1;
                    } else if (a.id.indexOf("CATEGORY") === -1 && b.id.indexOf("CATEGORY") === 0) {
                        return -1;
                    } else if (a.id.indexOf("CATEGORY") === -1 && b.id.indexOf("CATEGORY") === -1) {
                        return;
                    } else if (a.id.indexOf("CATEGORY") === 0 && b.id.indexOf("CATEGORY") === 0) {
                        return a.id > b.id ? 1 : -1;
                    }
                });

                labelsModel.setData(labels);

                if (successCallback)
                    successCallback(labels);
            });

            return labelsModel;
        }

        loadMessages(labelId, successCallback) {
            var messagesModel = new AppModel();

            gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'labelIds': [labelId]
            }).then(res => {
                messagesModel.setData(res.result);

                if (successCallback)
                    successCallback(res.result);
            });

            return messagesModel;
        }

        loadMessage(id, format, successCallback) {
            var messageModel = new AppModel();

            if (typeof format === 'function') {
                successCallback = format;
                format = "full";
            }

            gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': id,
                'format': format
            }).then(res => {
                messageModel.setData(res.result);

                if (successCallback)
                    successCallback(res.result);
            });

            return messageModel;
        }

        getAttachment(id, messageId, successCallback) {
            gapi.client.gmail.users.messages.attachments.get({
                'id': id,
                'messageId': messageId,
                'userId': 'me'
            }).then(res => {
                if(successCallback)
                successCallback(res.result);
            });
        }

        loadThreads(labelId, successCallback) {
            var threadsModel = new AppModel();

            gapi.client.gmail.users.threads.list({
                'userId': 'me',
                'labelIds': [labelId]
            }).then(res => {
                threadsModel.setData(res.result);

                if (successCallback)
                    successCallback(res.result);
            });

            return threadsModel;
        }

        loadThread(id, format, successCallback) {
            var threadModel = new AppModel();

            if (typeof format === 'function') {
                successCallback = format;
                format = "full";
            }

            gapi.client.gmail.users.threads.get({
                'userId': 'me',
                'id': id,
                'format': format
            }).then(res => {
                threadModel.setData(res.result);

                if (successCallback)
                    successCallback(res.result);
            });

            return threadModel;
        }

        threadToTrash(id, successCallback) {
            gapi.client.gmail.users.threads.trash({
                'userId': 'me',
                'id': id
            }).then(res => {
                if(successCallback) 
                successCallback(res);
            });
        }

        messageToTrash(id, successCallback) {
            gapi.client.gmail.users.messages.trash({
                'userId': 'me',
                'id': id
            }).then(res => {
                if(successCallback) 
                successCallback(res);
            });
        }

        send(raw, successCallback) {
            gapi.client.gmail.users.messages.send({
                'userId': 'me',
                'raw': raw
            }).then(res => {
                if (successCallback)
                    successCallback(res);
            });
        }
    }

    return new GmailService();
});