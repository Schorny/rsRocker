(function(root, baseUrl, undefined) {


    function initDependencies(baseUrl) {
        var dfd = new $.Deferred();
        $.when(
            $.getScript(baseUrl+'config.js'),
            $.getScript(baseUrl+'lib/loader.js'),
            $.getScript(baseUrl+'lib/player.js')
        ).done(function() {
            dfd.resolve();
        });

        return dfd.promise();
    }


    $.when(initDependencies(baseUrl)).done(function() {

        var parts=location.href.split("-");
        if(parts.length!=2) {
            console.log("parts is not 2");
            return;
        }

        var playerid = parts[1];

        $.when(rsR.loadPlayer(playerid)).done(function(player) {
            var html =
                "<span style='position:absolute;top:0;margin:auto;left:0;right:0;background-color:#ccc;width:180px'>" +
                    "<center><table border='0'>" +
                        "<caption>" + player.getName() + "</caption>" +
                        "<tr><th align='left'>Scoring:</th><td align='right'>" + player.getRealScoring() + "</td></tr>" +
                        "<tr><th align='left'>Passing:</th><td align='right'>" + player.getRealPassing() + "</td></tr>" +
                        "<tr><th align='left'>Dueling:</th><td align='right'>" + player.getRealDueling() + "</td></tr>" +
                        "<tr><th align='left'>Blocking:</th><td align='right'>" + player.getRealBlocking() + "</td></tr>" +
                    "</table></center>" +
                "</span>"
            ;

            $('body').append(html);
        });
    });



})(document, "https://raw.githubusercontent.com/Schorny/rsRocker/master/");

//bookmarklet code:
//javascript:(function(){var e=document.createElement('script');e.src='http://localhost/code/rsRocker/rsrocker.js';document.body.appendChild(e);})();