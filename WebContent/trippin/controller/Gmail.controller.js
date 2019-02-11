sap.ui.define([
    'sapui5/demo/trippin/controller/BaseController',
    "sapui5/demo/trippin/service/GmailService",
    "sapui5/demo/trippin/models/AppModel",
    "sapui5/demo/trippin/models/formatters",
    "sapui5/demo/trippin/models/textTools",
    "sap/m/MessageToast"
], function (BaseController, GmailService, AppModel, formatters, textTools, MessageToast) {
    'use strict';

    return BaseController.extend("sapui5.demo.trippin.controller.Gmail", {

        _getEmptyHtmlTemplate: function () {
            return [
                '<!DOCTYPE html>',
                '<html>',
                '   <head></head>',
                '   <body>{content}</body>',
                '</html>'
            ].join('');
        },
        _loadByLabel: function (labelId) {

            this._selectedLabel = labelId;

            var that = this;

            var threads = new Array();
            GmailService.loadThreads(labelId, res => {

                var resThreads = res.threads.sort((a, b) => {
                    return a.id > b.id ? -1 : 1;
                });
                resThreads.forEach(el => {

                    GmailService.loadThread(el.id, res2 => {
                        let thread = {
                            id: res2.id,

                            messages: []
                        };

                        res2.messages.forEach(msg => {

                            let from = msg.payload.headers.find(o => {
                                return o.name === "From";
                            });

                            let to = msg.payload.headers.find(o => {
                                return o.name === "To";
                            });

                            let subject = msg.payload.headers.find(o => {
                                return o.name === "Subject";
                            });

                            let date = new Date(msg.payload.headers.find(o => {
                                return o.name === "Date";
                            }).value);

                            let cuttedSnippet = msg.snippet.length > 80 ? msg.snippet.substring(0, 77) + "..." : msg.snippet;

                            let fromOrTo = labelId === "SENT" ? to.value : from.value;

                            thread.messages.push({
                                id: msg.id,
                                snippet: msg.snippet,
                                cuttedSnippet: cuttedSnippet,
                                from: from.value,
                                to: to.value,
                                fromOrTo: fromOrTo,
                                subject: subject.value,
                                date: formatters.formatDate(date, false, true),
                                rawDate: date
                            });
                        });
                        threads.push(thread);

                        threads.sort((a, b) => {
                            let aLastMessage = a.messages.sort((mA, mB) => {
                                return mA.rawDate > mB.rawDate ? -1 : 1;
                            })[0];

                            let bLastMessage = b.messages.sort((mA, mB) => {
                                return mA.rawDate > mB.rawDate ? -1 : 1;
                            })[0];

                            return aLastMessage.rawDate > bLastMessage.rawDate ? -1 : 1;
                        });

                        that.getView().getModel().refresh(true);
                    });
                });
            });

            this.getView().getModel().setProperty("/threads", threads);
        },
        onInit: function () {

            var that = this;

            jQuery.getScript("/trippin//js/jquery.base64.js", () => {
                $.base64.utf8encode = true;
            });

            jQuery.getScript("/trippin//js/FileSaver.js");

            GmailService.setController(this);
            this.getView().setModel(new AppModel({ signedIn: false }), "signInStatus");

            document.addEventListener("gmail_signedIn", () => {
                let oView = that.getView();

                oView.setModel(new AppModel({ signedIn: true }), "signInStatus");
                let gmailModel = new AppModel();
                oView.setModel(gmailModel);

                oView.byId("labelsList").addEventDelegate({
                    "onAfterRendering": function () {
                        let labels = gmailModel.getProperty("/labels");

                        if (labels.length > 0) {
                            that._loadByLabel("INBOX");
                            let index = labels.indexOf(labels.find(el => { return el.id === "INBOX" }));
                            $("#__item0-mvcAppComponent---gmail--labelsList-" + index).addClass("selected-label");
                        }
                    }
                }, that);

                GmailService.loadLabels(res => {
                    gmailModel.setData({ labels: res });
                });
            });

            document.addEventListener("gmail_signedOut", () => {
                this.getView().setModel(new AppModel({ signedIn: false }), "signInStatus");
                this.getView().setModel(new AppModel());
                this.getView().setModel(new AppModel(), "selectedThread");
            });
        },
        onExit: function () {

        },
        onAfterRendering: function (oEvent) {
            $($("#__xmlview0").find("div")[0]).css("background-image", "linear-gradient(to bottom, #fff 0, #fff 50%, #fff 100%)");

            $("#__toolbar0").css("background-color", "#fff");

            $("#__page0-intHeader-BarLeft")
                .append($("<img>", {
                    "src": "https://upload.wikimedia.org/wikipedia/commons/4/45/New_Logo_Gmail.svg",
                    "height": "50",
                }).css("margin-left", "20px"));
        },
        onNavPress: function () {
            GmailService.signOut();
            window.location.href = window.location.protocol + "//" + window.location.host;
        },
        onSignInClick: function () {
            GmailService.signIn();
        },
        onSignOutClick: function () {
            GmailService.signOut();
        },
        onLabelClick: function (oEvent) {
            let oLabel = this.getView().getModel()
                .getProperty(oEvent.getSource()
                    .getBindingContext().sPath);

            this._loadByLabel(oLabel.id);
            this.getView().setModel(new AppModel(), "selectedThread");

            let $domObj = $("#" + oEvent.getParameters().id);
            $domObj.parent().children().each((i, el) => {
                $(el).removeClass('selected-label');
            });

            $domObj.addClass('selected-label');
        },
        onThreadClick: function (oEvent) {

            if (this._threadSwiped) {
                this._threadSwiped = false;
                oEvent.preventDefault();
                return;
            }
            let sPath = oEvent.getSource()
                .getBindingContext().sPath;
            let thread = this.getView().getModel()
                .getProperty(sPath);

            this.getView().setModel(new AppModel(thread), "selectedThread");
        },
        _decodeContent: function (obj) {
            var content = "";
            var that = this;

            if (obj.mimeType.indexOf("multipart") > -1) {
                obj.parts.forEach(part => {
                    content += that._decodeContent(part);
                });
            } else if (obj.mimeType === "text/html") {
                content += $.base64.atob(obj.body.data, true);
            } else if (obj.mimeType === "text/plain") {
                content += that._getEmptyHtmlTemplate().replace("{content}",
                    $.base64.atob(obj.body.data, true)
                        .split(/\r\n|\r|\n/g)
                        .join("<br/>"));
            }
            return content;
        },
        _getPdfAttachments: function (obj) {
            var atts = [];
            var that = this;

            if (obj.mimeType.indexOf("multipart") > -1) {
                obj.parts.forEach(part => {
                    let tempAtts = that._getPdfAttachments(part);
                    if (tempAtts && tempAtts.length > 0) {
                        atts = atts.concat(tempAtts);
                    }
                });
            } else if (obj.mimeType === "application/pdf") {
                atts.push({
                    id: obj.body.attachmentId,
                    name: obj.filename
                });
            }

            return atts;
        },
        onMessageClick: function (oEvent) {

            if (this._messageSwiped) {
                this._messageSwiped = false;
                oEvent.preventDefault();
                return;
            }

            let oModel = this.getView().getModel("selectedThread");
            let message = oModel.getProperty(oEvent.getSource()
                .getBindingContext("selectedThread").sPath);

            var that = this;
            GmailService.loadMessage(message.id, res => {

                let content = that._decodeContent(res.payload).replace("<<", "<").replace(">>", ">");
                let attachments = that._getPdfAttachments(res.payload);

                let messageModel = {
                    id: message.id,
                    content: content,
                    atts: attachments
                };

                oModel.setProperty("/selectedMessage", messageModel);
                oModel.refresh(true);

                if (that.oEmailViewer === undefined) {
                    that.oEmailViewer = sap.ui.xmlfragment("emailViewer",
                        "sapui5.demo.trippin.view.fragments.EmailViewer", that);
                    that.getView().addDependent(that.oEmailViewer);
                }
                that.oEmailViewer.open();
            });
        },
        onAttachmentDownload: function (oEvent) {

            let oModel = this.getView().getModel("selectedThread");
            let oAtt = oModel.getProperty(oEvent.getSource().getBindingContext("selectedThread").sPath);
            let oMsgId = oModel.getProperty("/selectedMessage/id");

            GmailService.getAttachment(oAtt.id, oMsgId, res => {

                let b64Data = res.data.replace(/_/g, '/').replace(/-/g, '+');
                let binary = atob(b64Data);

                let buffer = new ArrayBuffer(binary.length);
                let view = new Uint8Array(buffer);

                for (var i = 0; i < binary.length; i++)
                    view[i] = binary.charCodeAt(i);

                let blob = new Blob([view], { type: 'text/plain' });

                saveAs(blob, oAtt.name);
            });
        },
        onReplyClick: function () {
            this.oEmailViewer.close();

            if (this.oNewEmail === undefined) {
                this.oNewEmail = sap.ui.xmlfragment("newEmail",
                    "sapui5.demo.trippin.view.fragments.NewEmail", this);
                this.getView().addDependent(this.oNewEmail);
            }
            this.oNewEmail.open();

            let selectedThread = this.getView().getModel("selectedThread");
            sap.ui.core.Fragment.byId("newEmail", "to").setValue(selectedThread
                .getProperty("/messages/0/from"));
            sap.ui.core.Fragment.byId("newEmail", "subject").setValue(selectedThread
                .getProperty("/messages/0/subject"));
        },
        onEmailClose: function () {
            this.oEmailViewer.close();
        },
        onNewEmailClick: function () {
            if (this.oNewEmail === undefined) {
                this.oNewEmail = sap.ui.xmlfragment("newEmail",
                    "sapui5.demo.trippin.view.fragments.NewEmail", this);
                this.getView().addDependent(this.oNewEmail);
            }
            this.oNewEmail.open();
        },
        onNewEmailClose: function () {
            this.oNewEmail.close();
        },
        onSendNewEmail: function () {
            let to = sap.ui.core.Fragment.byId("newEmail", "to").getValue();
            let cc = sap.ui.core.Fragment.byId("newEmail", "cc").getValue();
            let bcc = sap.ui.core.Fragment.byId("newEmail", "bcc").getValue();
            let subject = sap.ui.core.Fragment.byId("newEmail", "subject").getValue();
            let mailContent = sap.ui.core.Fragment.byId("newEmail", "mailContent").getValue();

            if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
                MessageToast.show("Type any value to TO, CC or BCC field");
                return;
            }

            if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
                MessageToast.show("Type any value to TO, CC or BCC field");
                return;
            }

            this.sendMessage(to, cc, bcc, subject, mailContent);

            this.oNewEmail.close();
        },
        sendMessage: function (to, cc, bcc, subject, content) {

            var recipients = [];
            if (to) recipients.push('To: <' + to + '>');
            if (cc) recipients.push('Cc: <' + cc + '>');
            if (bcc) recipients.push('Bcc: <' + bcc + '>');

            GmailService.getProfile(res => {
                let newLine = "\n";

                let msg = [
                    'MIME-Version: 1.0',
                    'From: <' + res + '>',
                    ...recipients,
                    'Subject: =?utf-8?B?' + $.base64.btoa(subject) + '?=',
                    'Message-ID: <1234@local.machine>',
                    'Content-Type: text/plain; charset=UTF-8',
                    'Content-Transfer-Encoding: base64',
                    newLine,
                    $.base64.btoa(content)
                ];

                let raw = $.base64.btoa(msg.join(newLine));

                GmailService.send(raw, res => {
                    MessageToast.show("Sent");
                });
            });
        },
        onRefreshClick: function () {
            let label = this._selectedLabel;
            if (!label) label = "INBOX";

            this._loadByLabel(label);
            this.getView().setModel(new AppModel(), "selectedThread");
        },
        onThreadsSwipe: function (oEvent) {
            var oList = oEvent.getSource();

            jQuery.sap.delayedCall(5000, this, () => {
                oList.swipeOut();
            });

            this._threadSwiped = true;
        },
        onMessagesSwipe: function (oEvent) {
            var oList = oEvent.getSource();

            jQuery.sap.delayedCall(5000, this, () => {
                oList.swipeOut();
            });

            this._messageSwiped = true;
        },
        onThreadDelete: function (oEvent) {
            var that = this;
            let sPath = oEvent.getSource().getParent().getSwipedItem()
                .getBindingContext().sPath;

            let thread = this.getView().getModel().getProperty(sPath);

            GmailService.threadToTrash(thread.id, res => {
                MessageToast.show("Thread moved to trash");
                that.onRefreshClick();
            });
        },
        onMessageDelete: function (oEvent) {
            var that = this;
            let sPath = oEvent.getSource().getParent().getSwipedItem()
                .getBindingContext("selectedThread").sPath;

            let message = this.getView().getModel("selectedThread").getProperty(sPath);

            GmailService.messageToTrash(message.id, res => {
                MessageToast.show("Message moved to trash");
                that.onRefreshClick();
            });
        }
    });
});