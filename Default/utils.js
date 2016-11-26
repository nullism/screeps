
var _clearCreepTarget = function(creep) {
    if (!creep) {
        console.log("!!! ERROR ERROR !!! _clearCreepTarget creep undef: " + creep);
        return;
    }
    if (creep.memory.targetId) {
        creep.memory.targetId = null;
    }
};

var _setCreepTarget = function(creep, target) {
    _clearCreepTarget(creep);
    creep.memory.targetId = target.id;
};

var _clearCreepTask = function(creep) {
    _clearCreepTarget(creep);
    creep.memory.task = null;
}

var utils = {

    setCreepTarget: function(creep, target) {
        _setCreepTarget(creep, target);
    },

    clearCreepTarget: function(creep) {
        _clearCreepTarget(creep);
    },

    clearCreepTask: function(creep) {
        _clearCreepTask(creep);
    },

    getEnergy: function(structure) {
        if (structure.energy)
            return structure.energy;

        if (structure.store)
            return structure.store[RESOURCE_ENERGY];
    },

    getEnergyCapacity: function(structure) {
        if (structure.energyCapacity)
            return structure.energyCapacity;
        if (structure.storageCapacity)
            return structure.storageCapacity;
    },

}

module.exports = utils;