var utils = require("utils");

var _getNewTarget = function(current, newList) {
    for(var i=0; i<newList.length; i++) {
        var tgt = newList[i];
        if (current == null || tgt.id != current.id) {
            return tgt;
        }
    }
    return null;
}

var _setNewTarget = function (creep, target, targetList) {
    var tgt = _getNewTarget(target, targetList);
    if (tgt != null)
        utils.setCreepTarget(creep, tgt);
    else {
        _clearTask(creep);
    }
}

var _clearTask = function (creep) {
    utils.clearCreepTarget(creep);
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
            "pull": this.doPull,
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
        } else if (out == ERR_NOT_ENOUGH_RESOURCES
                || creep.room.memory.buildTargets.length < 1) {
            _clearTask(creep);
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
        if (!target || target.carry.energy < 10) {
            _setNewTarget(creep, target, creep.room.memory.haulTargets);
        }
        if (!target)
            return;
        var out = target.transfer(creep, RESOURCE_ENERGY);
        if (out == ERR_NOT_IN_RANGE) {
            if(creep.carry.energy > creep.carryCapacity / 2)
                _clearTask(creep);
            else
                creep.moveTo(target);
        } else if (out == ERR_FULL || creep.carry.energy >= creep.carryCapacity) {
            _clearTask(creep); // hauler is full
        }

    },

    doMelee: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
        }
    },

    doPull: function (creep, target) {
        var out = creep.withdraw(target, RESOURCE_ENERGY);
        //console.log(creep.name + " is PULLING! : " + out);
        if (out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (out == ERR_FULL) {
            _clearTask(creep);
        } else if (out == ERR_NOT_ENOUGH_RESOURCES
                || out == ERR_INVALID_TARGET) {
            _setNewTarget(creep, target, creep.room.memory.pullTargets);
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
        } else if (out == ERR_INVALID_TARGET
                || !target || target.hits == target.hitsMax) {
            console.log("ERROR: Invalid repair target");
            _setNewTarget(creep, target, creep.room.memory.repairTargets);
        } else if (out == ERR_NOT_ENOUGH_RESOURCES) {
            _clearTask(creep);
        }
    },

    doStore: function(creep, target) {
        var out = creep.transfer(target, RESOURCE_ENERGY);
        if(out == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (out == ERR_FULL || out == ERR_INVALID_TARGET) {
            console.log("ERROR: Full or invalid store target: " + target);
            _setNewTarget(creep, target, creep.room.memory.storeTargets);
        } else if (out == ERR_NOT_ENOUGH_RESOURCES
                || creep.room.memory.storeTargets.length < 1) {
            _clearTask(creep);
        }

        if (creep.room.memory.ticks % 3 == 0) {
            var e = utils.getEnergy(target);
            var eMax = utils.getEnergyCapacity(target);
            if (!target || e >= eMax)
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
