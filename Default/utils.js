var utils = {

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