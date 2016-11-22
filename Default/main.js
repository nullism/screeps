var roleGeneric = require('role.generic');

var BODIES = {
    "worker": [WORK, CARRY, MOVE, WORK, CARRY, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, TOUGH, MOVE, WORK],
    "melee": [ATTACK, ATTACK, MOVE, TOUGH, ATTACK, MOVE, TOUGH, TOUGH, ATTACK, MOVE, TOUGH, TOUGH, ATTACK, TOUGH],
};

var ROLES = [
    {
        name: "harvester",
        tasks: ["harvest", "store", "build", "upgrade"],
        count: 5,
        body: BODIES.worker,
    },
    {   
        name: "builder",
        tasks: ["harvest", "build", "repair", "store", "upgrade"],
        count: 2,
        body: BODIES.worker,
    },
    {
        name: "upgrader",
        tasks: ["harvest", "upgrade"],
        count: 1,
        body: BODIES.worker,
    },
    {
        name: "fighter",
        tasks: ["melee", "rally"],
        count: 2,
        body: BODIES.melee
    }
];

var createBestCreep = function(spawn, role) {
    var cBody = role.body.slice(0);
    var extra = { role: role };
    var newName = spawn.createCreep(cBody, undefined, extra);
    while(newName == ERR_NOT_ENOUGH_ENERGY) {
        cBody.pop();
        if (cBody.length < 3) {
            console.log("Cannot build any " + role.name + "s!");
            break;
        }
        newName = spawn.createCreep(cBody, undefined, extra);
    }
    return newName;
}

var doTick = function(spawn) {
    var room = spawn.room;

    room.memory.rallyPoint = { x: 18, y: 33 };
    room.memory.buildTargets = room.find(FIND_CONSTRUCTION_SITES); 
    room.memory.storeTargets = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                structure.structureType == STRUCTURE_EXTENSION
                || structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
        }
    });
    room.memory.repairTargets = room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });
    room.memory.sources = room.find(FIND_SOURCES);

    // Create any new creeps
    for(var ri in ROLES) {
        var role = ROLES[ri];
        var existing = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        if (existing.length < role.count) {
            var newName = createBestCreep(spawn, role);
            if (_.isString(newName)) {
                console.log("Spawning new " + role.name + ": " + newName);
            }
            break;
        }
        
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleGeneric.run(creep);
    }
}

module.exports.loop = function () {

    for(var spawnName in Game.spawns) {
        doTick(Game.spawns[spawnName]);
    } 

    // Clear all dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}
