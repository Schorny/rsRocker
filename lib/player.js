var rsR = rsR || {}


rsR.SkillPlayer = function(name, skills) {

    function getRealScoring() {
        return (parseFloat(skills.scoring) + skills.speed/10.0 + getAddedValueOfPositionXP()).toFixed(2);
    }
    function getRealPassing() {
        return (parseFloat(skills.passing) + skills.power/10.0 + getAddedValueOfPositionXP()).toFixed(2);
    }
    function getRealDueling() {
        return (parseFloat(skills.dueling) + skills.power/10.0 + getAddedValueOfPositionXP()).toFixed(2);
    }
    function getRealBlocking() {
        return (parseFloat(skills.blocking) + skills.speed/10.0 + getAddedValueOfPositionXP()).toFixed(2);
    }
    function hasYouthBonus() {
        return skills.youthbonus !== null;
    }
    function getYouthBonus() {
        return this.hasYouthBonus() ? skills.youthbonus : 0;
    }
    function getSpecialAttributes() {
        return skills.specials;
    }
    function getTactic() {
        return skills.tactics;
    }

    function getName() {
        return name;
    }

    function getSkills() {
        return skills;
    }

    function getPosition() {
        function isBiggest(val,array) {
            for(var i=0, c=array.length; i<c; ++i) {
                if(array[i]>val)
                    return false;
            }
            return true;
        }

        var allPositions = [skills.attackxp, skills.midfieldxp, skills.defensexp, skills.goalkeepingxp];

        if(isBiggest(skills.attackxp, allPositions)) {
            return 'Attack';
        } else if(isBiggest(skills.midfieldxp, allPositions)) {
            return 'Midfield';
        } else if(isBiggest(skills.defensexp, allPositions)) {
            return 'Defense';
        } else if(isBiggest(skills.goalkeepingxp, allPositions)) {
            return 'Goalkeeping';
        } else {
            return 'WTF?';
        }
    }

    function getAddedValueOfPositionXP() {
        var xp = getPositionXP();

        //maximum of 1000 xp, should never be more
        xp = Math.min(1000, xp);

        return 0.75 * (xp/1000);
    }

    function getPositionXP() {
        var allPositions = [skills.attackxp, skills.midfieldxp, skills.defensexp, skills.goalkeepingxp];

        return Math.max.apply(Math, allPositions);
    }


    return {
        getRealScoring: getRealScoring,
        getRealPassing: getRealPassing,
        getRealDueling: getRealDueling,
        getRealBlocking: getRealBlocking,
        getTactic: getTactic,
        getPosition: getPosition,
        getSkills: getSkills,
        getName: getName,
        getYouthBonus: getYouthBonus,
        hasYouthBonus: hasYouthBonus,
        getSpecialAttributes: getSpecialAttributes
    }
};

rsR.loadPlayer = function (playerid) {
    var dfd = new $.Deferred();

    rsR.loadPage('info/player-'+playerid, function($data) {
        var skills = loadSkills($data);

        var name = $data.find('h2').last().text();

        var player = rsR.SkillPlayer(name, skills);
        dfd.resolve(player);
    });

    return dfd.promise();

    function loadSkills($data) {
        function getValue(e) {
            var val = $(e).text();

            //skills as text
            if(val != "") {
                return val;
            }

            //skills as balls
            return $(e).find('span').attr('title');
        }



        var youthBonus = null;
        if($data.find("footnote")) {
            youthBonus = $data.find(".footnote").find("span").text();
            if(youthBonus == "") {
                youthBonus = $data.find(".footnote").find("span").attr('title');
            }
        }

        var $specials = $data.find('.vertical_table.vt_col1');
        //broken for u21 players without youth bonus (ie >22year olds)
        $specials = $($specials.find('tr')[youthBonus===undefined?7:8]);
        $specials = $specials.find('td').find("span");

        var specials = [];
        for(var i = 0, c=$specials.length; i<c; ++i) {
            specials.push($($specials[i]).text());
        }


        //console.log($data.find('h2').last().text());
        //console.log(specials);

        var $skillTable = $data.find('.vertical_table.vt_col3');
        var $skills = $skillTable.find('td');

        var skills = {
            talent: getValue($skills[3]),
            endurance: getValue($skills[6]),
            power: getValue($skills[9]),
            speed: getValue($skills[12]),
            scoring: getValue($skills[4]),
            passing: getValue($skills[7]),
            dueling: getValue($skills[10]),
            blocking: getValue($skills[13]),
            tactics: getValue($skills[16]),
            attackxp: getValue($skills[5]),
            midfieldxp: getValue($skills[8]),
            defensexp: getValue($skills[11]),
            goalkeepingxp: getValue($skills[14]),
            flank: getValue($skills[17]),
            specials: specials,
            youthbonus: youthBonus
        };

        return skills;

    }


};