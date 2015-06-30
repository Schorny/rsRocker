(function(root, baseUrl, undefined) {


    function initDependencies(baseUrl) {
        var dfd = new $.Deferred();
        function loadCss(url) {
            $('<link rel="stylesheet" type="text/css" href="'+url+'" />').appendTo($('head'));
        }

        $('<span id="rsr"></span>').appendTo($('body'));
        $('<img src="'+baseUrl+'img/spinner.gif'+'" style="position:absolute;top:0;left:47%;" id="rsrspinner"/>').appendTo($('body'));
        loadCss(baseUrl+'css/default.css');
        loadCss(baseUrl+'css/ui.css');
        loadCss('https://code.jquery.com/ui/1.11.3/themes/smoothness/jquery-ui.css');
        //loadCss('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css');
        $.when(
            $.getScript('https://cdn.jsdelivr.net/i18next/1.7.7/i18next.min.js'),
            $.getScript('https://code.jquery.com/ui/1.11.3/jquery-ui.min.js'),
            $.getScript('https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js'),
            $.getScript('http://underscorejs.org/underscore-min.js'),
            $.getScript(baseUrl+'config.js'),
            $.getScript(baseUrl+'lib/ui.js'),
            $.getScript(baseUrl+'lib/util.js'),
            $.getScript(baseUrl+'lib/loader.js'),
            $.getScript(baseUrl+'lib/player.js'),
            $.getScript(baseUrl+'lib/match.js'),
            $.getScript(baseUrl+'lib/matchevents.js')
        ).done(function() {
            $.when($.getScript('https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min.js')).done(function() {
                rsR.config.baseUrl = baseUrl;
                $.when(rsR.ui.init()).done(function() {

                    Handlebars.registerHelper('t', function(text) {
                        return i18n.t(text);
                    });

                    i18n.init({
                        resGetPath: baseUrl+'locale/__lng__/__ns__.json',
                        defaultNs: 'rsr',
                        ns: 'rsr',
                        lng: 'en',
                        debug: false,
                        fallbackLng: false,
                        namespaces: ['rsr', 'skills', 'ui']
                    }, function() {
                        i18n.loadNamespaces(['skills', 'error', 'ui'], function() {
                            $('#rsrspinner').remove();
                            dfd.resolve();
                        });
                    });
                });
            });
        });

        return dfd.promise();
    }


    function handlePlayerInfo(playerid) {
        $.when(rsR.loadPlayer(playerid)).done(function(player) {

            var frame = new rsR.ui.Frame({name: i18n.t("ui:playerinfo"), content: new rsR.ui.PlayerInfo({
                player: player
            })});
        });
    }


    $.when(initDependencies(baseUrl)).done(function() {

        var menu = new rsR.ui.MainMenu();

        if($('#regions').length) {
            rsR.match.handleMatch();
        } else if($('.money-positive').length) {
            var parts=location.href.split("-");
            if(parts.length!=2) {
                console.log("parts is not 2");
                return;
            }

            var playerid = parts[1];
            handlePlayerInfo(playerid);
        }

        return;
    });



//})(document, "http://rawgit.com/Schorny/rsRocker/master/");
})(document, "http://localhost/code/rsRocker/");


//bookmarklet code:
//javascript:(function(){var e=document.createElement('script');e.src='http://localhost/code/rsRocker/rsrocker.js';document.body.appendChild(e);})();