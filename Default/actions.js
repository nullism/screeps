
var actions = {

    doTask = function(creep) {
        var taskMap = {
            "build": doBuild,
            "harvest": doHarvest,
            "melee": doMelee,
            "repair": doRepair,
            "store": doStore,
            "upgrade": doUpgrade
        };

        taskMap[creep.memory.task](creep, creep.memory.target);
    },

    doMelee: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
        }
    },

    doBuild: function(creep, target) { 
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },


    doHarvest: function(creep, target) {
        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },


    doRepair: function(creep, target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },

    doStore: function(creep, target) {
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },

    doUpgrade: function(creep, target) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    

}

module.exports = actions;
