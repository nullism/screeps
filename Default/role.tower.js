var roleTower = {

    run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
            return;
        }

        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 50000
        });
        if(closestDamagedStructure && tower.energy > 100) {
            tower.repair(closestDamagedStructure);
            return;
        }


    }
};

module.exports = roleTower;