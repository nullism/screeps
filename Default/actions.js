_getNewTarget = function(current, newList) {
    for(var i=0; i<newList.length; i++) {
        var tgt = newList[i];
        if (current == null || tgt.id != current.id) {
            return tgt;
        }
    }
    return null;
}

_setNewTarget = function (creep, target, targetList) {
    var tgt = _getNewTarget(target, targetList);
    if (tgt != null)
        creep.memory.targetId = tgt.id;
    else {
        _clearTask(creep);
    }
}

_clearTask = function (creep) {
    creep.memory.targetId = null;
    creep.memory.task = null;
}

var actions = {

    doTask: function(creep) {
        var taskMap = {
            "build": this.doBuild,
            "fixedHarvest": this.doFixedHarvest,
            "harvest": this.doHarvest,
            "haul": this.doHaul,
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

    doBuild: function(creep, target) {
        var out = creep.build(target);
         
        if(out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        else if (out == ERR_INVALID_TARGET) {
            console.log("ERROR: Invalid build target: " + target);
            _setNewTarget(creep, target, creep.room.memory.buildTargets);
        }
    },

    doFixedHarvest: function(creep, target) {
        var out = creep.harvest(target);

        if(out == ERR_NOT_IN_RANGE) {
            var moveOK = creep.moveTo(target);
            if (moveOK == ERR_NO_PATH) {
                console.log("ERROR: No path to harvest source: " + target);
                _setNewTarget(creep, target, creep.room.memory.sources);
            }
        } else if (creep.carry.energy >= creep.carryCapacity && creep.memory.fullTicks > 100) {
            _clearTask(creep);
        }
    },    

    doHarvest: function(creep, target) {
        var out = creep.harvest(target);

        if(out == ERR_NOT_IN_RANGE) {
            var moveOK = creep.moveTo(target);
            if (moveOK == ERR_NO_PATH) {
                console.log("ERROR: No path to harvest source: " + target);
                _setNewTarget(creep, target, creep.room.memory.sources);
            }
        } else if (creep.memory.fullTicks > 0) {
            _clearTask(creep);
        }
    },

    doHaul: function (creep, target) {
        if (!target) {
            _setNewTarget(creep, target, creep.room.memory.haulTargets);
        }
        var out = target.transfer(creep, RESOURCE_ENERGY);
        if (out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (out == ERR_FULL) {
            _clearTask(creep); // hauler is full
        }
    },

    doMelee: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
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
        var out = creep.repair(target);

        if(out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (out == ERR_INVALID_TARGET || !target || target.hits == target.hitsMax) {
            console.log("ERROR: Invalid repair target");
            _setNewTarget(creep, target, creep.room.memory.repairTargets);
        }
    },

    doStore: function(creep, target) {
        var out = creep.transfer(target, RESOURCE_ENERGY);

        if(out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (out == ERR_FULL || out == ERR_INVALID_TARGET) {
            console.log("ERROR: Full or invalid store target: " + target);
            _setNewTarget(creep, target, creep.room.memory.storeTargets);
        }
    },

    doUpgrade: function(creep, target) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    

}

module.exports = actions;
