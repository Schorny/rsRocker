var rsR = rsR || {}

rsR.loadPage = function(path, callback) {
    var url = rsR.config.rsBaseUrl + path;
    var $e = $('<html />');
    $e.load(url, function() { callback($e); });
}
