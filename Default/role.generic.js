var actions = require("actions");

var setNewTask = function(creep) { 
    for(var i=0; i<creep.memory.role.tasks.length; i++) {
        var role = creep.memory.role.tasks.length[i];

        if (role == "harvest") {
            if(creep.carry.energy < creep.carryCapacity) {
                creep.memory.task = "harvest";
                break;
            }
        } 
        else if (role == "store") {
            if (storeTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "store";
                creep.memory.target = storeTargets[0];
                break;
            }
        }

        else if (role == "build") {
            if(buildTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "build";
                creep.memory.target = buildTargets[0];
                break;
            }
        }
        else if (role == "melee") {
            var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (attTarget) {
                creep.memory.task = "melee";
                creep.memory.target = attTarget;
                break;
            }
        }
        else if (role == "repair") { 
            if(repairTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "repair";
                creep.memory.target = repairTargets[0];
                break;
            }
        }
        else if (role == "upgrade" && creep.carry.energy > 0) {
            creep.memory.task = "upgrade";
            break;
        }
    }
}

var roleGeneric = {

    run: function(creep) {
        
        var storeTargets = creep.room.memory.storeTargets;
        var buildTargets = creep.room.memory.buildTargets;
        var repairTargets = creep.room.memory.repairTargets;
        var sources = creep.room.memory.sources;

        // Determine if the creep should clear its task
        var task = creep.memory.task
        var clear = false;
        if (task != null) {
            if (task == "harvest") {
                if (creep.carry.energy >= creep.carryCapacity)
                    clear = true;
            }
            else if (task == "store") {
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
            else if (task == "repair") {
                if (creep.carry.energy < 1 || repairTargets.length < 1)
                    clear = true;
            }
            else if (task == "upgrade") {
                if (creep.carry.energy < 1)
                    clear = true;
            }

            if (clear) { 
                creep.memory.task = null;
                creep.memory.target = null;
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
}

module.exports = roleGeneric;