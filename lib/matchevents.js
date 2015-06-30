var rsR = rsR || {};

rsR.match = rsR.match || {};

rsR.match.event = rsR.match.event || {};

rsR.match.event.createEvent = function(game, tick, params) {
    var events = {
        'pass': rsR.match.event.Pass,
        'pass-throwin': rsR.match.event.Pass,
        'throwin': rsR.match.event.PassBlock,
        'pass-assist' : rsR.match.event.PassAssist,
        'shot-kept': rsR.match.event.ShotIntercept,
        'shot-intercept': rsR.match.event.ShotIntercept,
        'yellow': rsR.match.event.Foul,
        'tackle': rsR.match.event.Tackle,
    };

    if(events[params[0]]) {
        return new events[params[0]](game, tick, params);
    }

    return new rsR.match.event.Dummy(game, tick, params);
};


rsR.match.event.CompareRegionStats = function(a, b) {
    this.name = "";

    this.setName = function(name) {
        this.name = name;
    };

    this.getName = function() {
        return this.name;
    };

    this.getAsString = function() {
        var res=[];
        var statA = a.getStats();
        var statB = b.getStats();

        for(var key in statA) {
            res.push(key+": "+statA[key]+"/"+statB[key]);
        }

        if(this.name) {
            return this.name + ": " + res.join("; ");
        } else {
            return res.join("; ");
        }
    };

    return this;
};

rsR.match.event.RegionStats = function(game, tick, region, stats) {

    this.getStats = function() {
        return stats;
    };

    return this;
};

rsR.match.event.getRegionStats =function(game, tick, region) {
    var result = [];
    game.getAllTeams().forEach(function(team) {
        result.push(new rsR.match.event.RegionStats(
            game, tick, region,
            rsR.match.event.getRegionStatsForTeam(game, tick, region, team)
        ));
    });

    return new rsR.match.event.CompareRegionStats(result[0], result[1]);
};

rsR.match.event.getRegionStatsForTeam = function(game, tick, region, team) {
    var stats = {
        'Block': 'getRealBlocking',
        'Duel': 'getRealDueling',
        'Pass': 'getRealPassing',
        'Score': 'getRealScoring'
    };

    var result = {};

    for(var stat in stats) {
        result[stat] = rsR.match.event.getRegionDetailsForTeam(game, tick, region, team, stats[stat]);
    }

    return result;
};

rsR.match.event.getExhaustiveStats = function(game, tick, playera, playerb, names) {
    var regionA = game.getPlayerRegion(playera, tick);
    var regionB = game.getPlayerRegion(playerb, tick);

    if(regionA == regionB) {
        var s = rsR.match.event.getRegionStats(game, tick, regionA);
        s.setName(names.join("/"));
        return [s];
    }

    var s = [
        rsR.match.event.getRegionStats(game, tick, regionA),
        rsR.match.event.getRegionStats(game, tick, regionB)
    ];
    s[0].setName(names[0]);
    s[1].setName(names[1]);
    return s;
};

rsR.match.event.getRegionDetailsForTeam = function(game, tick, region, team, func) {
    return parseFloat(rsR.sum(game.getAllPlayersFromTeamInRegion(team, region, tick), func)).toFixed(2);
};

rsR.match.event.getPositionStats = function(game, tick, playerid, func) {
    var team = game.getTeamFromPlayerID(playerid);
    var region = game.getPlayerRegion(playerid, tick);
    return parseFloat(rsR.sum(game.getAllPlayersFromTeamInRegion(team, region, tick), func)).toFixed(2);
};

rsR.match.event.getPositionStats2 = function(game, tick, playera, playerb, func) {
    return rsR.match.event.getPositionStats(game, tick, playera, func) + '/' + rsR.match.event.getPositionStats(game, tick, playerb, func);
};

rsR.match.event.Dummy = function(game, tick, params) {
    this.getDescription = function() {
        return "Event '"+params[0]+"' not yet implemented :(";
    }
}

rsR.match.event.Pass = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription =function() {
        var ret = from.getName() + ' passes to ' + to.getName() + ' (';
        ret += 'Pass: ' + from.getRealPassing() +'/'+to.getRealPassing() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.PassAssist = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    if(!game.isSameTeam(fromId, toId)) {
        return new rsR.match.event.PassBlock(game, tick, params);
    }

    this.getDescription = function() {
        var ret = from.getName() + ' assists to ' + to.getName() + ' (';
        ret += 'P/S: ' + from.getRealPassing() +'/'+to.getRealScoring() + '; ';
        ret += 'Pass: ' + from.getRealPassing() +'/'+to.getRealPassing() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.PassBlock = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' passes but ' + to.getName() + ' blocks (';
        ret += 'Pass: ' + from.getRealPassing() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.ShotIntercept = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' shoots but ' + to.getName() + ' intercepts (';
        ret += 'Score: ' + from.getRealScoring() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.Foul = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = game.getBallPlayerID(tick);
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' fouls ' + to.getName() + ' (';
        ret += 'Duel: ' + from.getRealDueling() + '/' + to.getRealDueling() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.Tackle = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' tackles ' + to.getName() + ' (';
        ret += 'Duel: ' + from.getRealDueling() + '/' + to.getRealDueling() + '; ';
        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

