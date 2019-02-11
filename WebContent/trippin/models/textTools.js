sap.ui.define([], function () {
    "use strict";

    return {

        polishChars: {
            "ą": { simple: "a", encoded: encodeURI("ą") },
            "ć": { simple: "c", encoded: encodeURI("ć") },
            "ę": { simple: "e", encoded: encodeURI("ę") },
            "ł": { simple: "l", encoded: encodeURI("ł") },
            "ń": { simple: "n", encoded: encodeURI("ń") },
            "ó": { simple: "o", encoded: encodeURI("ó") },
            "ś": { simple: "s", encoded: encodeURI("ś") },
            "ź": { simple: "z", encoded: encodeURI("ź") },
            "ż": { simple: "z", encoded: encodeURI("z") },
        },

        replacePolishChar: function (char, simple) {
            return this.polishChars[char] ? (simple ? this.polishChars[char].simple : this.polishChars[char].encoded) : char;
        },
        replacePolishChars: function (word) {
            var newWord = "";
            for (var c of [...word]) {
                newWord += this.replacePolishChar(c);
            }

            return newWord;
        },
        replacePolishCharsInText: function (text) {
            let splitted = text.split(" ");

            var newText = "";

            for (var index in splitted) {
                newText += this.replacePolishChars(splitted[index]);

                if (index < splitted.length - 1) {
                    newText += " ";
                }
            }

            return newText;
        },

        twoDigits: function (number) {
            var i = parseInt(number);
            if (isNaN(i)) {
                return number;
            }

            if (i < 10) {
                return "0" + i.toString();
            }

            return i.toString();
        },
    };
});