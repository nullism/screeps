var actions = require("actions");

var setNewTask = function(creep) { 

    var storeTargets = creep.room.memory.storeTargets;
    var buildTargets = creep.room.memory.buildTargets;
    var repairTargets = creep.room.memory.repairTargets;
    var sources = creep.room.memory.sources;


    for(var i=0; i<creep.memory.role.tasks.length; i++) {
        var role = creep.memory.role.tasks[i];

        if (role == "fixedHarvest") {
            if (creep.carry.energy < creep.carryCapacity || creep.memory.fullTicks < 100) {
                creep.memory.task = "fixedHarvest";
                if (!creep.memory.targetId)
                    creep.memory.targetId = sources[0].id; 
            }
        }        
        else if (role == "harvest") {
            if(creep.carry.energy < creep.carryCapacity) {
                creep.memory.task = "harvest";
                creep.memory.targetId = sources[0].id;
                break;
            }
        } 
        else if (role == "store") {
            if (storeTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "store";
                creep.memory.targetId = storeTargets[0].id;
                break;
            }
        }

        else if (role == "build") {
            if(buildTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "build";
                creep.memory.targetId = buildTargets[0].id;
                break;
            }
        }
        else if (role == "melee") {
            var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (attTarget) {
                creep.memory.task = "melee";
                creep.memory.targetId = attTarget.id;
                break;
            }
        }
        else if (role == "ranged") {
            var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (attTarget) {
                creep.memory.task = "ranged";
                creep.memory.targetId = attTarget.id;
                break;
            }
        }
        else if (role == "repair") { 
            if(repairTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "repair";
                creep.memory.targetId = repairTargets[0].id;
                break;
            }
        }
        else if (role == "upgrade" && creep.carry.energy > 0) {
            creep.memory.task = "upgrade";
            break;
        }
        else if (role == "rally") {
            creep.memory.task = "rally";
            break;
        }
    }
};

var roleGeneric = {

    run: function (creep) {
        
        if (creep.carry.energy >= creep.carryCapacity)
            creep.memory.fullTicks += 1;
        else
            creep.memory.fullTicks = 0;
        
        var storeTargets = creep.room.memory.storeTargets;
        var buildTargets = creep.room.memory.buildTargets;
        var repairTargets = creep.room.memory.repairTargets;
        var sources = creep.room.memory.sources;

        // Determine if the creep should clear its task
        var task = creep.memory.task
        var clear = false;
        if (task != null) {

            if (task == "store") {
                if (creep.carry.energy < 1 || storeTargets.length < 1) 
                    clear = true;
            }
            else if (task == "build") {
                if (creep.carry.energy < 1 || buildTargets.length < 1)
                    clear = true;
            }
            else if (task == "melee") {
                var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (!attTarget)
                    clear = true;
            }
            else if (task == "ranged") {
                var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (!attTarget)
                    clear = true;
            }
            else if (task == "repair") {
                if (creep.carry.energy < 1 || repairTargets.length < 1)
                    clear = true;
            }
            else if (task == "upgrade") {
                if (creep.carry.energy < 1)
                    clear = true;
            }
            else if (task == "rally") { 
                var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (attTarget)
                    clear = true;

            }

            if (clear) { 
                creep.memory.task = null;
                creep.memory.targetId = null;
            }
        }

        if (creep.memory.task == null)
            setNewTask(creep);

        if (creep.memory.task) {
            actions.doTask(creep);
            creep.say(creep.memory.task);
        }
        else {
            creep.say("idle");
        }


    }
};

module.exports = roleGeneric;
