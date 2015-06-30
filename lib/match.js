var rsR = rsR || {};

rsR.match = rsR.match || {};

rsR.match.createTeam = function($e, clazz, startid) {
    var dfd = new $.Deferred();
    var $players = $e.find(clazz).find('li').find('.player');
    var players = [];
    var promises = [];
    for(var i=0,c=$players.length; i<c; ++i) {
        var o = $players[i];
        var url = $($(o).find('a')[1]).attr("href");
        var parts=url.split("-");
        var promise = rsR.loadPlayer(parts[1]);
        //TODO: improve this brainfuck
        (function(idx) {
            $.when(promise).done(function (player) {
                player.getPlayerID = (function(id) {
                    return function() { return id; }
                })(startid+idx);
                players[idx] = player;
            });
        })(i+1);
        promises.push(promise);
    }

    var name = $($e.find(clazz +' > .team_name > a')[1]).text();

    $.when.apply(null, promises).done(function() {
        dfd.resolve(new rsR.match.Team(name, players));
    });

    return dfd;
};

rsR.match.createAwayTeam = function($e) {
    return rsR.match.createTeam($e, '.away-team', 100);
};

rsR.match.createHomeTeam = function($e) {
    return rsR.match.createTeam($e, '.home-team', 0);
};

rsR.match.Team = function(name, players) {

    this.getPlayer = function(id) {
        if(id>100) id-=100;

        return players[id];
    };

    this.getAllPlayers = function() {
        var res = [];
        //TODO improve this
        players.forEach(function(p) {
            res.push(p);
        });
        return res;
    };

    this.getName = function() {
        return name;
    };



    return this;
};

rsR.match.GameInfo = function(team1, team2, team1_pos, team2_pos, ball_player) {

    this.getPlayerRegion = function(playerid, tick) {
        var team_pos = team1_pos;
        if(playerid>100) {
            team_pos = team2_pos;
            playerid -= 100;
        }

        return team_pos[tick][playerid];
    };

    this.getAllPlayersFromTeamInRegion = function(team, region, tick) {
        var players = [];
        var that = this;
        team.getAllPlayers().forEach(function(p) {
            if (that.getPlayerRegion(p.getPlayerID(), tick) == region) {
                players.push(p);
            }

        });
        return players;
    };

    this.getTeamFromPlayerID = function(playerid) {
        if(playerid>100) {
            return team2;
        }
        return team1;
    };

    this.getBallPlayerID = function(tick) {
        return ball_player[tick];
    };

    this.getPlayer = function(playerid) {
        var team =  team1;
        if(playerid>100) {
            team=team2;
        }
        return team.getPlayer(playerid);
    };

    this.isSameTeam = function(playerIdA, playerIdB) {
        return this.getTeamFromPlayerID(playerIdA) == this.getTeamFromPlayerID(playerIdB);
    };

    this.getAllTeams = function() {
        return [team1, team2];
    };

    return this;
};

rsR.match.handleMatch = function() {
    var $e = $('#content');
    $.when(rsR.match.createHomeTeam($e), rsR.match.createAwayTeam($e)).done(function(home, away) {
        var game = new rsR.match.GameInfo(home, away, window.team1_pos, window.team2_pos, window.ball_player);
        var events = window.events;
        var original_do_event = window.player.do_event;
        window.player.do_event = function(minute) {

            if(events[minute]) {
                console.log("do event ("+events[minute][0]+")");
                var event = rsR.match.event.createEvent(game, minute, events[minute]);
                if (event) {
                    console.log(event.getDescription());
                } else {
                    console.log("unhandled event: " + events[minute][0]);
                }
            }
            original_do_event.apply(this, [minute]);
        };
        alert("Player Ready");
        /*
        for(var i=0,c=events.length; i<c; ++i) {
            if(!events[i]) continue;
            var event = rsR.match.event.createEvent(game, i, events[i]);
            if(event) {
                console.log(event.getDescription());
            } else {
                console.log("unhandled event: "+events[i][0]);
            }
        }*/
    });
};