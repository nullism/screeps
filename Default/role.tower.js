var roleTower = {

    run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }

        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 50000
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }


    }
};

module.exports = roleTower;