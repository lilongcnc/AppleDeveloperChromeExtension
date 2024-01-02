var JSUtils = {
    isValidString: function (str) {
        if (typeof str != 'string' || typeof str == "undefined" || str == null || str == "") {
            return false;
        } else {
            return true;
        }
    },

    pasteToClipboard: function (obj) {
        var w = document.createElement('input');
        w.value = obj;
        document.body.appendChild(w);
        w.select();
        document.execCommand("Copy");
        w.style.display = 'none';
    },

    clearEventId: function (originalEventId) {
        temp1 = originalEventId.split('(');
        if (temp1.length > 1) {
            temp2 = temp1[1].split(')');
            return temp2[0];
        }
        return originalEventId;
    },

    isNum: function (val) {
        if (val === "" || val == null) {
            return false;
        }
        if (!isNaN(val)) {
            return true;
        } else {
            return false;
        }
    }
}