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
        getPosition: getPosition,
        getSkills: getSkills,
        getName: getName
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
            flank: getValue($skills[17])
        };

        return skills;

    }


};