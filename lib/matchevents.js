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

    this.getDescription = function() {
        var ret = from.getName() + ' passes to ' + to.getName() + ' (';
        ret += 'Pass: ' + from.getRealPassing() +'/'+to.getRealPassing() + '; ';
        ret += 'Duel: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealDueling') + '; ';
        ret += 'Block: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealBlocking');
        ret += ')';
        return ret;
    };
};

rsR.match.event.PassAssist = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' assists to ' + to.getName() + ' (';
        ret += 'P/S: ' + from.getRealPassing() +'/'+to.getRealScoring() + '; ';
        ret += 'Pass: ' + from.getRealPassing() +'/'+to.getRealPassing() + '; ';
        ret += 'Duel: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealDueling') + '; ';
        ret += 'Block: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealBlocking');
        ret += ')';
        return ret;
    };
};

rsR.match.event.PassBlock = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' passes but ' + to.getName() + ' blocks (';
        ret += 'Pass: ' + from.getRealPassing() + '; ';
        ret += 'Duel: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealDueling') + '; ';
        ret += 'Block: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealBlocking');
        ret += ')';
        return ret;
    };
};

rsR.match.event.ShotIntercept = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' shoots but ' + to.getName() + ' intercepts (';
        ret += 'Pass: ' + from.getRealPassing() + '; ';
        ret += 'Duel: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealDueling') + '; ';
        ret += 'Block: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealBlocking');
        ret += ')';
        return ret;
    };
};

rsR.match.event.Foul = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = game.getBallPlayerID(tick);
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' fouls ' + to.getName() + ' (';
        ret += 'Duel: ' + from.getRealDueling() + '/' + to.getRealDueling() + '; ';
        ret += 'Duel: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealDueling') + '; ';
        ret += 'Block: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealBlocking');
        ret += ')';
        return ret;
    };
};

rsR.match.event.Tackle = function(game, tick, params) {
    var fromId = params[1];
    var from = game.getPlayer(fromId);
    var toId = params[2];
    var to = game.getPlayer(toId);

    this.getDescription = function() {
        var ret = from.getName() + ' tackles ' + to.getName() + ' (';
        ret += 'Duel: ' + from.getRealDueling() + '/' + to.getRealDueling() + '; ';
        ret += 'Duel: ' + rsR.match.event.getPositionStats2(game, tick, fromId, toId, 'getRealDueling');
        ret += ')';
        return ret;
    };
};

