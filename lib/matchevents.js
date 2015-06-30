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
        'shot-miss': rsR.match.event.ShotMiss,
        'goal': rsR.match.event.Goal,
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

    this.getAsTable = function() {
        var ret='<center><table class="compareregionstats" border="0">';
        if(this.name) {
            ret+='<caption>'+this.name+'</caption>';
        }

        var statA = a.getStats();
        var statB = b.getStats();

        for(var key in statA) {
            ret+='<tr><th>';
            ret+=key[0];
            ret+=':</th><td>';
            ret+=statA[key]+"/"+statB[key];
            ret+='</td></tr>';
        }

        ret+='</table></center>';
        return ret;
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

rsR.match.event.getAllRegionStats = function(game, tick) {
    var regions=["1","2","3","4","5","6","7","8","9","a","b","c","d","e"];
    //ignore 0 and f, they are gk regions

    var stats={};

    regions.forEach(function(region) {
        stats[region] = rsR.match.event.getRegionStats(game, tick, region);
    });

    return stats;
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

rsR.match.event.getExhaustiveStats1 = function(game, tick, player, name) {
    var region = game.getPlayerRegion(player, tick);

    var s = rsR.match.event.getRegionStats(game, tick, region);
    s.setName(name);
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

    if(!game.isSameTeam(fromId, toId)) {
        return new rsR.match.event.PassIntercept(game, tick, params);
    }

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

    if(game.isSameTeam(fromId, toId)) {
        return new rsR.match.event.PassFail(game, tick, params);
    }

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

rsR.match.event.PassFail = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' passes but ' + to.getName() + ' can\'t control the ball (';
        ret += 'Pass: ' + from.getRealPassing() +'/'+to.getRealPassing() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, fromId, toId, ["From", "To"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.PassIntercept = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' passes but ' + to.getName() + ' intercepts (';
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

rsR.match.event.ShotMiss = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);

    this.getDescription = function() {
        var ret = from.getName() + ' shoots but misses (';
        ret += 'Score: ' + from.getRealScoring() + '; ';

        var s = rsR.match.event.getExhaustiveStats1(game, tick, fromId, "Shooter");
        ret+='\n\t('+ s.getAsString()+')';

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.Goal = function(game, tick, params) {
    var team = params[1];
    var shooterId = params[2];
    var shooter = game.getPlayer(shooterId);
    var assisterId = params[3];

    var side = shooterId > 100 ? 1:0;
    if(team!=side) {
        return new rsR.match.event.OwnGoal(game, tick, params);
    }

    if(assisterId) {
        return new rsR.match.event.AssistGoal(game, tick, params);
    }

    this.getDescription = function() {
        var ret = shooter.getName() + ' scores (';
        ret += 'Score: ' + shooter.getRealScoring() + '; ';

        var s = rsR.match.event.getExhaustiveStats1(game, tick, shooterId, "Scorer");
        ret+='\n\t('+ s.getAsString()+')';

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.OwnGoal = function(game, tick, params) {
    var team = params[1];
    var shooterId = params[2];
    var shooter = game.getPlayer(shooterId);
    var assisterId = params[3];
    var assister = game.getPlayer(assisterId);

    this.getDescription = function() {
        var ret = shooter.getName() + ' scores an own goal after a shot from ' + assister.getName() + ' (';

        rsR.match.event.getExhaustiveStats(game, tick, assisterId, shooterId, ["Shooter", "OwnGoaler"]).forEach(function(s) {
            ret+='\n\t('+ s.getAsString()+')';
        });

        ret+="\n)";
        return ret;
    };

    return this;
};

rsR.match.event.AssistGoal = function(game, tick, params) {
    var team = params[1];
    var shooterId = params[2];
    var shooter = game.getPlayer(shooterId);
    var assisterId = params[3];
    var assister = game.getPlayer(assisterId);

    this.getDescription = function() {
        var ret = shooter.getName() + ' scores with an assist from ' + assister.getName() + ' (';
        ret += 'P/S: ' + assister.getRealPassing() +'/'+shooter.getRealScoring() + '; ';
        ret += 'Pass: ' + assister.getRealPassing() +'/'+shooter.getRealPassing() + '; ';

        rsR.match.event.getExhaustiveStats(game, tick, assisterId, shooterId, ["Assister", "Scorer"]).forEach(function(s) {
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

