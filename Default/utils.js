
var _clearCreepTarget = function(creep) {
    if (creep.memory.targetId) {
        if (!creep.room.memory.traffic[creep.memory.targetId])
            creep.room.memory.traffic[creep.memory.targetId] = 1;
        creep.room.memory.traffic[creep.memory.targetId] -= 1;
    }
};

var _setCreepTarget = function(creep, target) {
    _clearCreepTarget()
    if (!creep.room.memory.traffic[target.id])
        creep.room.memory.traffic[target.id] = 0;
    creep.room.memory.traffic[target.id] += 1;
};

var utils = {

    setCreepTarget: function(creep, target) {
        _setCreepTarget(creep, target);
    },

    clearCreepTarget: function(creep) {
        _clearCreepTarget(creep);
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