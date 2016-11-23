var roleGeneric = require('role.generic');

var BODIES = {
    "worker": [WORK, CARRY, MOVE, MOVE, WORK, WORK, MOVE, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, TOUGH, MOVE, WORK],
    "melee": [ATTACK, MOVE, MOVE, ATTACK, MOVE, TOUGH, MOVE, ATTACK, MOVE, MOVE, TOUGH, TOUGH, MOVE, ATTACK, MOVE, TOUGH, TOUGH, ATTACK, TOUGH, MOVE],
    "ranged": [RANGED_ATTACK, MOVE, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH],
};

var ROLES = [
    {
        name: "harvester",
        tasks: ["harvest", "store", "build", "upgrade"],
        count: 5,
        body: BODIES.worker,
    },
    {
        name: "upgrader",
        tasks: ["harvest", "upgrade"],
        count: 2,
        body: BODIES.worker,
    },
    {   
        name: "builder",
        tasks: ["harvest", "build", "repair", "store", "upgrade"],
        count: 3,
        body: BODIES.worker,
    },
    {
        name: "archer",
        tasks: ["ranged", "rally"],
        count: 3,
        body: BODIES.ranged
    },
    {
        name: "fighter",
        tasks: ["melee", "rally"],
        count: 2,
        body: BODIES.melee
    },
];

var createBestCreep = function(spawn, role) {
    var cBody = role.body.slice(0);
    var extra = { role: role };
    var newName = spawn.createCreep(cBody, undefined, extra);
    while(newName == ERR_NOT_ENOUGH_ENERGY) {
        cBody.pop();
        if (cBody.length < 4) {
            console.log("Cannot build any " + role.name + "s!");
            break;
        }
        newName = spawn.createCreep(cBody, undefined, extra);
    }
    return newName;
}

var doTick = function(spawn) {
    var room = spawn.room;

    room.memory.rallyPoint = { x: spawn.pos.x, y: spawn.pos.y + 5 };
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
    room.memory.sources.sort((a,b) => b.energy - a.energy);

    // Create any new creeps
    for(var ri in ROLES) {
        var role = ROLES[ri];
        var existing = _.filter(Game.creeps, (creep) => creep.memory.role.name == role.name);
        //console.log(existing.length + "/" + role.count + " " + role.name + "s");
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
