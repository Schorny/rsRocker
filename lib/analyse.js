var rsR = rsR || {};

rsR.analyse = rsR.analyse || {};

rsR.analyse.createTeam = function($e, clazz, name) {
    var dfd = new $.Deferred();
    var $players = $e.find(clazz).find('ul').first().find('li');
    var players = [];
    var promises = [];
    for(var i= 0,c=$players.length; i<c; ++i) {
        var o = $players[i];
        var url = $($(o).find('a')[1]).attr("href");
        var parts=url.split("-");
        var promise = rsR.loadPlayer(parts[1]);
        //TODO: improve this brainfuck
        (function(pos) {
            $.when(promise).done(function(player) {
                player.getPosition = (function(pos) {
                    return function() { return pos; }
                })(pos);
                player.getTeam = (function(team) {
                    return function() { return team; }
                })(name);

                players.push(player);
            });
        })($(o).find('strong').text());
        promises.push(promise);
    }

    $.when.apply(null, promises).done(function() {
        dfd.resolve(new rsR.match.Team(name, players));
    });

    return dfd;
};

rsR.analyse.createAwayTeam = function($e) {
    return rsR.analyse.createTeam($e, '.away_lineup', $e.find('h2 span').last().text());
};

rsR.analyse.createHomeTeam = function($e) {
    return rsR.analyse.createTeam($e, '.home_lineup', $e.find('h2 span').first().text());
};

rsR.analyse.getAllPositions = function() {
    return ["GK", "SW", "DCB", "CB", "LB", "RB", "LWB", "RWB", "DM", "LM", "RM","CM","AM","LAM","RAM","LW","RW","SS","LF","RF","S"]
};

rsR.analyse.getAllRegions = function() {
    return ["GK", "CB", "LB", "RB", "CM", "LM", "RM", "S", "LF", "RF"];
};

rsR.analyse.getPositionsForRegionForHomeTeam = function(region) {
    var ret=[];
    rsR.analyse.getAllPositions().forEach(function(pos) {
        if(rsR.analyse.getRegionFromPositionForHomeTeam(pos) == region) {
            ret.push(pos);
        }
    });
    return ret;
};

rsR.analyse.getPositionsForRegionForAwayTeam = function(region) {
    var ret=[];
    rsR.analyse.getAllPositions().forEach(function(pos) {
        if(rsR.analyse.getRegionFromPositionForAwayTeam(pos) == region) {
            ret.push(pos);
        }
    });
    return ret;
};

rsR.analyse.getExtendedPositionsForRegionForHomeTeam = function(region) {
    var ret=[];
    rsR.analyse.getAllPositions().forEach(function(pos) {
        if(rsR.analyse.getExtendedRegionsFromPositionForHomeTeam(pos).indexOf(region)!==-1) {
            ret.push(pos);
        }
    });
    return ret;
};

rsR.analyse.getExtendedPositionsForRegionForAwayTeam = function(region) {
    var ret=[];
    rsR.analyse.getAllPositions().forEach(function(pos) {
        if(rsR.analyse.getExtendedRegionsFromPositionForAwayTeam(pos).indexOf(region)!==-1) {
            ret.push(pos);
        }
    });
    return ret;
};

rsR.analyse.getRegionFromPositionForHomeTeam = function(pos) {
    var positions = {
        "GK": "GK",
        "SW": "CB",
        "DCB": "CB",
        "CB": "CB",
        "LB": "LB",
        "RB": "RB",
        "LWB": "LB",
        "RWB": "RB",
        "DM": "CM",
        "LM": "LM",
        "RM": "RM",
        "CM": "CM",
        "LAM": "LM",
        "RAM": "RM",
        "AM": "CM",
        "RW": "RM",
        "LW": "LM",
        "SS": "CM",
        "LF": "LF",
        "RF": "RF",
        "S": "S"
    };
    return positions[pos];
};
rsR.analyse.getRegionFromPositionForAwayTeam = function(pos) {
    var positions = {
        "GK": "GK",
        "SW": "S",
        "DCB": "S",
        "CB": "S",
        "LB": "RF",
        "RB": "LF",
        "LWB": "RF",
        "RWB": "LF",
        "DM": "CM",
        "LM": "RM",
        "RM": "LM",
        "CM": "CM",
        "LAM": "RM",
        "RAM": "LM",
        "AM": "CM",
        "RW": "LM",
        "LW": "RM",
        "SS": "CM",
        "LF": "RB",
        "RF": "LB",
        "S": "CB"
    };
    return positions[pos];
};
rsR.analyse.getExtendedRegionsFromPositionForHomeTeam = function(pos) {
    var positions = {
        "GK": ["GK"],
        "SW": ["CB","CM"],
        "DCB": ["CB", "CM"],
        "CB": ["CB", "CM"],
        "LB": ["LB", "LM"],
        "RB": ["RB", "RM"],
        "LWB": ["LB","LM"],
        "RWB": ["RB","RM"],
        "DM": ["CM"],
        "LM": ["LM","LF"],
        "RM": ["RM","RF"],
        "CM": ["CM","S"],
        "LAM": ["LM","LF","S"],
        "RAM": ["RM","RF","S"],
        "AM": ["CM","LF","S","RF"],
        "RW": ["RM","RF","S"],
        "LW": ["LM","LF","S"],
        "SS": ["CM","LF","S","RF"],
        "LF": ["LF","S"],
        "RF": ["RF","S"],
        "S": ["S"]
    };
    return positions[pos];
};
rsR.analyse.getExtendedRegionsFromPositionForAwayTeam = function(pos) {
    var positions = {
        "GK": ["GK"],
        "SW": ["S","CM"],
        "DCB": ["S", "CM"],
        "CB": ["S", "CM"],
        "LB": ["RF", "RM"],
        "RB": ["LF", "LM"],
        "LWB": ["RF","RM"],
        "RWB": ["LF","LM"],
        "DM": ["CM"],
        "LM": ["RM","RB"],
        "RM": ["LM","LB"],
        "CM": ["CM","CB"],
        "LAM": ["RM","RB","CB"],
        "RAM": ["LM","LB","CB"],
        "AM": ["CM","RB","CB","LB"],
        "RW": ["LM","LB","CB"],
        "LW": ["RM","RB","CB"],
        "SS": ["CM","RB","CB","LB"],
        "LF": ["RB","CB"],
        "RF": ["LB","CB"],
        "S": ["CB"]
    };
    return positions[pos];
};

rsR.analyse.Team = function(name, players) {

    this.getName = function() {
        return name;
    };

    this.getAllPlayers = function() {
        return players;
    };

    this.getPlayersInPosition = function(posistions) {
        if(!$.isArray(posistions)) { posistions=[posistions]; }

        var res=[];
        players.forEach(function(player) {
            for(var pos in posistions) {
                if(pos === player.getPosition()) {
                    res.push(player);
                    return;
                }
            }
        });

        return res;
    };

    return this;
};

rsR.analyse.handleAnalyse = function() {
    var $e = $('#content');

    $.when(rsR.analyse.createHomeTeam($e), rsR.analyse.createAwayTeam($e)).done(function(home, away) {
        new rsR.ui.Frame({name: i18n.t("ui:analysetactic"), content: new rsR.ui.AnalyseTactic({
            teams: {
                home: home,
                away: away
            }
        })});

    });
};

