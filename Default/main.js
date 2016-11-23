var roleGeneric = require('role.generic');

var SYNC_ROLE_TASKS = false;

var BODIES = {
    "worker": [WORK, CARRY, MOVE, MOVE, WORK, WORK, MOVE, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, TOUGH, MOVE, WORK],
    "fixedWorker": [WORK, CARRY, CARRY, MOVE, WORK, CARRY, CARRY, MOVE, WORK, CARRY, CARRY, CARRY, MOVE],
    "melee": [TOUGH, ATTACK, MOVE, MOVE, ATTACK, MOVE, TOUGH, MOVE, ATTACK, MOVE, MOVE, TOUGH, TOUGH, MOVE, ATTACK, MOVE, TOUGH, TOUGH, ATTACK, TOUGH, MOVE],
    "ranged": [TOUGH, MOVE, RANGED_ATTACK, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH],
    "hauler": [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
};

var ROLES = [
    {
        name: "harvester",
        tasks: ["harvest", "store", "build", "upgrade"],
        count: { early: 4, mid: 1, late: 0 },
        body: BODIES.worker,
    },
    {
        name: "fixedHarvester",
        tasks: ["fixedHarvest", "store"],
        count: { early: 1, mid: 3, late: 4 },
        body: BODIES.fixedWorker,
    },
    {
        name: "hauler",
        tasks: ["haul", "store"],
        count: { early: 1, mid: 2, late: 3 },
        body: BODIES.hauler,
    },
    {
        name: "upgrader",
        tasks: ["pull", "harvest", "upgrade"],
        count: { early: 1, mid: 2, late: 3 },
        body: BODIES.worker,
    },
    {
        name: "builder",
        tasks: ["pull", "harvest", "build", "upgrade"],
        count: { early: 0, mid: 3, late: 4 },
        body: BODIES.worker,
    },
    {
        name: "repairer",
        tasks: ["pull", "harvest", "repair", "upgrade"],
        count: { early: 1, mid: 1, late: 2 },
        body: BODIES.worker,
    },
    {
        name: "archer",
        tasks: ["ranged", "rally"],
        count: { early: 0, mid: 2, late: 3 },
        body: BODIES.ranged
    },
    {
        name: "fighter",
        tasks: ["melee", "rally"],
        count: { early: 0, mid: 1, late: 2 },
        body: BODIES.melee
    },
];

// Tries to create the best creep for role that we can afford
var createBestCreep = function (spawn, role) {
    var cBody = role.body.slice(0);
    var extra = { role: role };
    var newName = spawn.createCreep(cBody, undefined, extra);
    while (newName == ERR_NOT_ENOUGH_ENERGY) {
        cBody.pop();
        if (cBody.length < 4) {
            console.log("Cannot build any " + role.name + "s!");
            break;
        }
        newName = spawn.createCreep(cBody, undefined, extra);
    }
    return newName;
}

// Returns a role object or null
var getRole = function (roleName) {
    for (var i = 0; i < ROLES.length; i++) {
        if (ROLES[i].name == roleName)
            return ROLES[i];
    }
    return null;
}

// Main loop function
var doTick = function (spawn) {
    var room = spawn.room;

    if (!room.memory.ticks)
        room.memory.ticks = 0;
    room.memory.ticks += 1;


    if (room.memory.ticks < 1000) {
        room.memory.age = "early";
    }
    else if (room.memory.ticks < 10000) {
        room.memory.age = "mid";
    }
    else {
        room.memory.age = "late";
    }

    room.memory.rallyPoint = { x: spawn.pos.x, y: spawn.pos.y + 5 };
    room.memory.buildTargets = room.find(FIND_CONSTRUCTION_SITES);
    var storeExts = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION
                 || structure.structureType == STRUCTURE_SPAWN)
                 && structure.energy < structure.energyCapacity;
        }
    });
    var storeContainers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
        }
    });
    room.memory.storeTargets = storeExts.concat(storeContainers);

    room.memory.repairTargets = room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax && object.hits < 15000
    });
    room.memory.sources = room.find(FIND_SOURCES);
    room.memory.sources.sort((a, b) => b.energy - a.energy);

    var pullContainers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY] > 0);
        }
    });
    var pullExtensions = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION
                || structure.structureType == STRUCTURE_SPAWN)
                && structure.energy > 0;
        }
    });
    pullExtensions.sort((a, b) => a.energy - b.energy);
    //room.memory.pullTargets = pullContainers.concat(pullExtensions);
    room.memory.pullTargets = pullContainers; // Only pull from storage containers

    room.memory.haulTargets = room.find(FIND_CREEPS, {
        filter: (creep) => {
            return (
                creep.my &&
                creep.memory.role.name == "fixedHarvester" &&
                creep.carry.energy > 0
            )
        }
    });
    room.memory.haulTargets.sort((a, b) => b.carry.energy - a.carry.energy);

    // Create any new creeps
    for (var ri in ROLES) {
        var role = ROLES[ri];
        var existing = _.filter(Game.creeps, (creep) => creep.memory.role.name == role.name);
        //console.log(existing.length + "/" + role.count[room.memory.age] + " " + role.name + "s");
        if (existing.length < role.count[room.memory.age]) {
            var newName = createBestCreep(spawn, role);
            if (_.isString(newName)) {
                console.log("Spawning new " + role.name + ": " + newName);
            }
            break;
        }

    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleGeneric.run(creep);
    }
}

module.exports.loop = function () {

    for (var spawnName in Game.spawns) {
        doTick(Game.spawns[spawnName]);
    }

    // Clear or sync all creeps
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
            continue;
        }

        var creep = Game.creeps[name];
        if (!creep.my)
            continue;
        if (SYNC_ROLE_TASKS) {
            var role = getRole(creep.memory.role.name);
            if (role)
                creep.memory.role.tasks = role.tasks;
        }

    }
}
