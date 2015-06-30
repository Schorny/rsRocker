var rsR = rsR || {};

rsR.createGUID = function() {
    //see http://guid.us/GUID/JavaScript
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    // then to call it, plus stitch in '4' in the third group
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
};

rsR.sum = function(arr, func) {
    var res = 0;
    arr.forEach(function(o) {
        res += o[func]();
    });
    return res;
};