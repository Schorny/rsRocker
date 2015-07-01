var rsR = rsR || {};

rsR.loadTemplate = function(name) {
    var dfd = new $.Deferred();
    $.get(rsR.config.baseUrl+'templates/'+name+'.html', function(data) {
        dfd.resolve(data);
    });
    return dfd;
};

rsR.getTemplate = function(name) {
    var dfd = new $.Deferred();

    $.when(rsR.loadTemplate(name)).done(function(data) {
        dfd.resolve(Handlebars.compile(data));
    });
    return dfd;
};

rsR.ui = rsR.ui || {};

rsR.ui.init = function() {
    var dfd = new $.Deferred();

    $.when(
        rsR.getTemplate('frame'),
        rsR.getTemplate('playerinfo'),
        rsR.getTemplate('askforplayerid'),
        rsR.getTemplate('matchlog'),
        rsR.getTemplate('matchregioninfo'),
        rsR.getTemplate('analysetactic'),
        rsR.getTemplate('rsr')
    ).done(function(tplFrame, tplPlayerinfo, tplAskForPlayerID, tplMatchLog, tplMatchRegionInfo, tplAnalyseTactic, tplMainMenu) {

        var $rsr = $('#rsr');

        function handleMenu(action) {
            var actions = {
                "playerinfo": function() {
                    new rsR.ui.Frame({
                        content: new rsR.ui.AskForPlayerID(),
                        name: i18n.t("ui:enterplayerid")
                    });
                },

                "matchinfo": function() {
                    alert(i18n.t("error:notyetimplemented"));
                },

                "help": function() {
                    window.open("https://github.com/Schorny/rsRocker/tree/v2");
                }
            };

            if(!actions[action]) {
                alert(i18n.t("error:notyetimplemented"));
                return;
            }

            return actions[action]();
        }

        rsR.ui.Frame = Backbone.View.extend({
            el: $rsr,
            template: tplFrame,
            name: null,
            events: {
                'click .rsrframeclose': 'close',
                'dblclick .ui-resizable-handle': 'autoresize',
                'close': 'close' //TODO: change this to listenTo(this.content) and expose a decent api
            },
            initialize: function(options) {
                this.name = options.name;
                this.content = options.content;
                this.id = rsR.createGUID();

                this.render();
            },

            _getTemplate: function() {
                return this.template({
                    id: this.id,
                    name: this.name,
                });
            },

            render: function() {
                this.el = $(this._getTemplate()).appendTo($rsr);
                this.$el = $(this.el);
                this.$(".rsrframecontent").append(this.content.$el);
                this.$el.draggable({
                    handle: '.rsrframeheader'
                });
                this.$el.resizable();
                return this;
            },

            close: function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.$el.remove();
                this.content.remove();
                this.remove();
            },

            autoresize: function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.$el.css({
                    width: "auto",
                    height: "auto"
                });
            }
        });

        rsR.ui.PlayerInfo = Backbone.View.extend({
            template: tplPlayerinfo,

            initialize: function(options) {
                this.player = options.player;

                this.render();
            },

            _getTemplate: function() {
                return this.template({
                    name: this.player.getName(),
                    scoring: this.player.getRealScoring(),
                    passing: this.player.getRealPassing(),
                    dueling: this.player.getRealDueling(),
                    blocking: this.player.getRealBlocking(),
                    tactic: this.player.getTactic(),
                    youthbonus: this.player.getYouthBonus(),
                    specials: this.player.getSpecialAttributes()
                });
            },

            render: function() {
                this.$el = $(this._getTemplate());
                return this;
            }
        });

        rsR.ui.AskForPlayerID = Backbone.View.extend({
            template: tplAskForPlayerID,
            events: {
                'click .rsrsubmit': 'submit'
            },

            initialize: function() {
                this.render();
            },

            _getTemplate: function() {
                return this.template({});
            },

            render: function() {
                this.$el = $(this._getTemplate());
                return this;
            },

            submit: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var playerid=this.$("input").first().val();
                this.$el.trigger("close");
                $.when(rsR.loadPlayer(playerid)).done(function(player) {
                    new rsR.ui.Frame({name: i18n.t("ui:playerinfo"), content: new rsR.ui.PlayerInfo({
                        player: player
                    })});
                });
            }
        });


        rsR.ui.MatchLog = Backbone.View.extend({
            template: tplMatchLog,

            initialize: function(options) {
                this.render();
            },

            _getTemplate: function() {
                return this.template({});
            },

            render: function() {
                this.$el = $(this._getTemplate());
                return this;
            },

            //TODO: find better solution
            //we should use events for that
            addLog: function(str) {
                var $e = this.$('.logarea');
                str=str.replace(/\n/g, "<br>");
                $e.html(str+"<br>"+$e.html());
            }
        });


        rsR.ui.MatchRegionInfo = Backbone.View.extend({
            template: tplMatchRegionInfo,
            events: {
                'click a.fontcolor': 'updateFontcolor',
                'click a.rsrdisable': 'disable',
                'click a.rsrenable': 'enable'
            },

            initialize: function(options) {
                this.enabled=true;
                this.fontcolor='yellow';
                $('#regions').css({"color":this.fontcolor});
                this.render();
            },

            _getTemplate: function() {
                return this.template({"fontcolor":this.fontcolor});
            },

            render: function() {
                this.$el = $(this._getTemplate());
                return this;
            },

            disable: function(e) {
                e.preventDefault();
                e.stopPropagation();

                $('.compareregionstats').html('');
                this.enabled=false;
            },

            enable: function(e) {
                e.preventDefault();
                e.stopPropagation();

                this.enabled=true;
            },

            updateFontcolor: function(e) {
                e.preventDefault();
                e.stopPropagation();

                this.fontcolor=this.$('input.fontcolor').val();
                $('#regions').css({"color":this.fontcolor});
            },

            //TODO: find a better solution
            //this should be done using events
            update: function(stats) {
                if(!this.enabled)
                    return;
                rsR.match.doUpdateRegionInfo(stats);
            },
        });

        rsR.ui.AnalyseTactic = Backbone.View.extend({
            template: tplAnalyseTactic,
            events: {
                'click a.playerregion': 'updateRegion'
            },

            initialize: function(options) {
                this.teams = options.teams;
                var players = [];
                players=players.concat(this.teams.home.getAllPlayers());
                players=players.concat(this.teams.away.getAllPlayers());
                players.sort(function(a,b) {
                    return b.getTactic() - a.getTactic();
                });

                this.players = [];
                var that = this;
                players.forEach(function(p) {
                    that.players.push({
                        team: p.getTeam() == that.teams.home.getName() ? "home" : "away",
                        position: p.getPosition(),
                        name: p.getName(),
                        scoring: p.getRealScoring(),
                        passing: p.getRealPassing(),
                        dueling: p.getRealDueling(),
                        blocking: p.getRealBlocking(),
                        tactic: p.getTactic(),
                        youthbonus: p.getYouthBonus(),
                        specials: p.getSpecialAttributes()
                    });
                });

                this.regions = ["ALL"].concat(rsR.analyse.getAllRegions());
                this.render();
            },

            _getTemplate: function() {

                return this.template({
                    teams: {
                        home: {
                            name: this.teams.home.getName(),
                            players: this.teams.home.getAllPlayers()
                        },
                        away: {
                            name: this.teams.away.getName(),
                            players: this.teams.away.getAllPlayers()
                        }
                    },
                    players: this.players,
                    regions: this.regions
                });
            },

            updateRegion: function(e) {
                e.preventDefault();
                e.stopPropagation();

                var $sel = this.$('.rsrplayertable');
                var region = this.$('select.playerregion').val();
                if(region=="ALL") {
                    $sel.find('tr').css({display:'table-row'});
                    return;
                }
                if(this.$('input.playerregion').val()) {
                    var homePositions = rsR.analyse.getExtendedPositionsForRegionForHomeTeam(region);
                    var awayPositions = rsR.analyse.getExtendedPositionsForRegionForAwayTeam(region);
                } else {
                    var homePositions = rsR.analyse.getPositionsForRegionForHomeTeam(region);
                    var awayPositions = rsR.analyse.getPositionsForRegionForAwayTeam(region);
                }
                $sel.find('tr').css({display:'none'});

                $sel.find('.rsrfirst').css({display:'table-row'});
                homePositions.forEach(function(p) {
                    $sel.find('.rsrteam_home.position_'+p).css({display:'table-row'});
                });
                awayPositions.forEach(function(p) {
                    $sel.find('.rsrteam_away.position_'+p).css({display:'table-row'});
                });
            },

            render: function() {
                this.$el = $(this._getTemplate());
                return this;
            }
        });

        rsR.ui.MainMenu = Backbone.View.extend({
            template: tplMainMenu,
            events: {
                'click a': 'open'
            },

            initialize: function(options) {
                this.render();
            },

            _getTemplate: function() {
                return this.template({});
            },

            render: function() {
                this.$el = $(this._getTemplate()).appendTo($rsr);
                return this;
            },

            open: function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleMenu($(e.target).data("action"));
            }
        });

        dfd.resolve(true);
    });

    return dfd;
};
