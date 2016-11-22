
var actions = {

    doTask: function(creep) {
        var taskMap = {
            "build": this.doBuild,
            "harvest": this.doHarvest,
            "melee": this.doMelee,
            "ranged": this.doRanged,
            "repair": this.doRepair,
            "store": this.doStore,
            "upgrade": this.doUpgrade
        };

        var target = null;
        if (creep.memory.targetId)
            target = Game.getObjectById(creep.memory.targetId);
        taskMap[creep.memory.task](creep, target);
    },

    doMelee: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
        }
    },

    doBuild: function(creep, target) {
        var out = creep.build(target);
         
        if(out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        else if (out == ERR_INVALID_TARGET) {
            console.log("ERROR: Invalid build target: " + target);
            creep.memory.task = null;
        }
    },


    doHarvest: function(creep, target) {
        var out = creep.harvest(target);

        if(out == ERR_NOT_IN_RANGE) {
            var moveOK = creep.moveTo(target);
            if (moveOK == ERR_NO_PATH) {
                console.log("ERROR: No path to harvest source: " + target);
                for(var i=0; i<creep.room.memory.sources.length; i++) {
                    var src = creep.room.memory.sources[i];
                    if (src.id != target.id) {
                        creep.memory.targetId = src.id;
                        break;
                    }
                }
            }
        }
    },


    doRanged: function(creep, target) {
        if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
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
