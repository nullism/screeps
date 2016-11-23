
var actions = {

    doTask: function(creep) {
        var taskMap = {
            "build": this.doBuild,
            "harvest": this.doHarvest,
            "melee": this.doMelee,
            "rally": this.doRally,
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


    doRally: function(creep, target) {
        var pos = creep.room.memory.rallyPoint;
        creep.moveTo(pos.x, pos.y);
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
        var out = creep.transfer(target, RESOURCE_ENERGY);

        if(out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (out == ERR_FULL) {
            if (creep.room.memory.storeTargets.length > 0)
                creep.memory.targetId = creep.room.memory.storeTargets[0];
            else
                creep.memory.task = null;
        }
    },

    doUpgrade: function(creep, target) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    

}

module.exports = actions;
