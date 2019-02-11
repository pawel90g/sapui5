sap.ui.define([
    "sapui5/demo/trippin/models/textTools"
], function (textTools) {
    "use strict";

    const twoDigits = (number) => {
        var i = parseInt(number);
        if (isNaN(i)) {
            return number;
        }

        if (i < 10) {
            return "0" + i.toString();
        }

        return i.toString();
    };

    const formatDate = (sDate, onlyDate, shortDate, withoutYear) => {
        let timeStamp = Date.parse(sDate);
        if (isNaN(timeStamp)) {
            return sDate;
        }

        let date = new Date(timeStamp);
        let dateStr = twoDigits(date.getDate()) + "-" + twoDigits(date.getMonth() + 1);

        if (!withoutYear) {
            dateStr += "-";
            dateStr += shortDate ? date.getFullYear().toString().substring(2, 4) : date.getFullYear().toString();
        }

        if (onlyDate) {
            return dateStr;
        }

        var fullDateTime = dateStr + " " + date.getHours() + ":" + twoDigits(date.getMinutes());

        return fullDateTime;
    }

    const formatDateTimeFirst = (sDate) => {
        return formatDateTime(sDate, "HH:mm dd-MM-yyyy");
    }

    const formatDateTime = (sDate, format) => {
        let timeStamp = Date.parse(sDate);

        if (isNaN(timeStamp)) {
            return sDate;
        }

        let date = new Date(timeStamp);
        let formatParts = format.split(/[\s-:]+/);

        let dateStr = "";

        for (var i = 0; i < formatParts.length; i++) {
            let currentPart = formatParts[i];
            let nextPart = i < formatParts.length - 1 ? formatParts[i + 1] : null;

            switch (currentPart) {
                case "yyyy":
                    dateStr += date.getFullYear();
                    break;
                case "yy":
                    dateStr += date.getFullYear().toString().substring(2, 4);
                    break;
                case "MM":
                    dateStr += twoDigits(date.getMonth() + 1);
                    break;
                case "dd":
                    dateStr += twoDigits(date.getDate());
                    break;
                case "HH":
                    dateStr += twoDigits(date.getHours());
                    break;
                case "mm":
                    dateStr += twoDigits(date.getMinutes());
                    break;
                case "ss":
                    dateStr += twoDigits(date.getSeconds());
                    break;
            }

            switch (nextPart) {
                case null:
                    break;
                case "yyyy":
                case "yy":
                    if (currentPart === "dd" ||
                        currentPart === "MM") {
                        dateStr += "-";
                    } else if (currentPart === "HH" ||
                        currentPart === "mm" ||
                        currentPart === "ss") {
                        dateStr += " ";
                    }
                    break;
                case "MM":
                    if (currentPart === "yyyy" ||
                        currentPart === "yy" ||
                        currentPart === "dd") {
                        dateStr += "-";
                    } else if (currentPart === "HH" ||
                        currentPart === "mm" ||
                        currentPart === "ss") {
                        dateStr += " ";
                    }
                    break;
                case "dd":
                    if (currentPart === "yyyy" ||
                        currentPart === "yy" ||
                        currentPart === "MM") {
                        dateStr += "-";
                    } else if (currentPart === "HH" ||
                        currentPart === "mm" ||
                        currentPart === "ss") {
                        dateStr += " ";
                    }
                    break;
                case "HH":
                    dateStr += " ";
                    break;
                case "mm":
                case "ss":
                    dateStr += ":";
                    break;
            }
        }

        return dateStr;
    }

    const formatDateTime2 = (sDate, format) => {
        let timeStamp = Date.parse(sDate);

        if (isNaN(timeStamp)) {
            return sDate;
        }

        let date = new Date(timeStamp);

        let dateStr = format.toString();
        dateStr = dateStr.replace("yyyy", date.getFullYear());
        dateStr = dateStr.replace("yy", date.getFullYear().toString().substring(2, 4));
        dateStr = dateStr.replace("MM", twoDigits(date.getMonth() + 1));
        dateStr = dateStr.replace("dd", twoDigits(date.getDate()));
        dateStr = dateStr.replace("HH", twoDigits(date.getHours()));
        dateStr = dateStr.replace("mm", twoDigits(date.getMinutes()));
        dateStr = dateStr.replace("ss", twoDigits(date.getSeconds()));

        let offset = date.getTimezoneOffset() / 60;
        let offsetSign = offset < 0 ? "+" : "-";
        let offsetStr = offsetSign + twoDigits(Math.abs(offset)) + "00";
        dateStr = dateStr.replace("GMT", offsetStr);

        return dateStr;
    }

    const parseExactDateTime = (sDate, format) => {
        let dateStr = format.toString();
        let year, month, day, hours, minutes, seconds;

        let index = format.indexOf("yyyy");
        if (index > -1) {
            year = parseInt(sDate.substring(index, index + 4));
        }

        index = format.indexOf("yy");
        if (index > -1 && !year) {
            year = parseInt(sDate.substring(index, index + 2));
        }

        index = format.indexOf("MM");
        if (index > -1) {
            month = parseInt(sDate.substring(index, index + 2));
        }

        index = format.indexOf("dd");
        if (index > -1) {
            day = parseInt(sDate.substring(index, index + 2));
        }

        index = format.indexOf("HH");
        if (index > -1) {
            hours = parseInt(sDate.substring(index, index + 2));
        }

        index = format.indexOf("mm");
        if (index > -1) {
            minutes = parseInt(sDate.substring(index, index + 2));
        }

        index = format.indexOf("ss");
        if (index > -1) {
            seconds = parseInt(sDate.substring(index, index + 2));
        }

        if (!year || !month || !day) {
            return undefined;
        }

        if (hours === undefined || minutes === undefined) {
            return new Date(year, month - 1, day);
        }

        if (seconds === undefined) {
            return new Date(year, month - 1, day, hours, minutes, 0);
        }

        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    const dateTimeWithOffset = (sDate) => {
        let timeStamp = Date.parse(sDate);

        if (isNaN(timeStamp)) {
            return sDate;
        }

        let date = new Date(timeStamp);
        let offset = date.getTimezoneOffset() / 60;
        let offsetSign = offset < 0 ? "+" : "-";
        let offsetStr = offsetSign + twoDigits(Math.abs(offset)) + "00";

        return formatDateTime(sDate, "yyyy-MM-dd") + "T" + formatDateTime(sDate, "HH:mm:ss") + " GMT" + offsetStr;
    }

    const onlyDate = (sDate) => {
        return formatDate(sDate, true, false, false);
    }

    const onlyDateYearFirst = (sDate) => {
        return formatDateTime(sDate, "yyyy-MM-dd");
    }

    return {
        textTools: textTools,
        formatDate: formatDate,
        onlyDate: onlyDate,
        onlyDateYearFirst: onlyDateYearFirst,
        dateTimeWithOffset: dateTimeWithOffset,
        twoDigits: twoDigits,
        formatDateTime2: formatDateTime2,
        parseExactDateTime: parseExactDateTime,
        formatDateTimeFirst: formatDateTimeFirst
    };
});