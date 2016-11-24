var actions = require("actions");
var utils = require("utils");

var setNewTask = function(creep) {

    var storeTargets = creep.room.memory.storeTargets;
    var haulTargets = creep.room.memory.haulTargets;
    var pullTargets = creep.room.memory.pullTargets;
    var buildTargets = creep.room.memory.buildTargets;
    var repairTargets = creep.room.memory.repairTargets;
    var sources = creep.room.memory.sources;


    for(var i=0; i<creep.memory.role.tasks.length; i++) {
        var role = creep.memory.role.tasks[i];

        if (role == "fixedHarvest") {
            if (creep.carry.energy < creep.carryCapacity || creep.memory.fullTicks < 300) {
                creep.memory.task = "fixedHarvest";
                if (!creep.memory.targetId)
                    utils.setCreepTarget(creep, sources[0]);
                break;
            }
        }
        else if (role == "harvest") {
            if(creep.carry.energy < creep.carryCapacity) {
                creep.memory.task = "harvest";
                utils.setCreepTarget(creep, sources[0]);
                break;
            }
        }
        else if (role == "haul") {
            if (haulTargets.length > 0 && creep.carry.energy < creep.carryCapacity) {
                creep.memory.task = "haul";
                utils.setCreepTarget(creep, haulTargets[0]);
                break;
            }
        }
        else if (role == "pull") {
            if (pullTargets.length > 0 && creep.carry.energy < creep.carryCapacity) {
                creep.memory.task = "pull";
                utils.setCreepTarget(creep, pullTargets[0]);
                break;
            }
        }
        else if (role == "store") {
            if (storeTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "store";
                utils.setCreepTarget(creep, storeTargets[0]);
                break;
            }
        }

        else if (role == "build") {
            if(buildTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "build";
                utils.setCreepTarget(creep, buildTargets[0]);
                break;
            }
        }
        else if (role == "melee") {
            var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (attTarget) {
                creep.memory.task = "melee";
                utils.setCreepTarget(creep, attTarget);
                break;
            }
        }
        else if (role == "ranged") {
            var attTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (attTarget) {
                creep.memory.task = "ranged";
                utils.setCreepTarget(creep, attTarget);
                break;
            }
        }
        else if (role == "repair") {
            if(repairTargets.length > 0 && creep.carry.energy > 0) {
                creep.memory.task = "repair";
                utils.setCreepTarget(creep, repairTargets[0]);
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
        var haulTargets = creep.room.memory.haulTargets;
        var pullTargets = creep.room.memory.pullTargets;

        // Determine if the creep should clear its task
        var task = creep.memory.task
        var clear = false;
        if (task != null) {
            if (task == "melee") {
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
                utils.clearCreepTask(creep);
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
