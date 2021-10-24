import { creepSpawn, roleOptions } from "creepspawn";
import roleBuilder from "roles/builder";
import roleHarvester from "roles/harvester";
import roleHauler from "roles/hauler";
import roleUpgrader from "roles/upgrader";

declare global {
    interface CreepMemory {
        role: string,
    }
}

export default function () {
    let harvesters = 0;
    let upgraders = 0;
    let builders = 0;
    let hauler = 0;

    if (Object.values(Game.creeps).filter(creep => creep.memory.role === 'harvester' && !creep.memory.t).length) {
        const room = Game.rooms['E15S38'];
        const sources = room.find(FIND_SOURCES);
        sources.forEach(source => roleHarvester.assign(source));
    }

    Object.values(Game.creeps).forEach(creep => {
        if (creep.memory.role === 'harvester') {
            harvesters = harvesters + 1;
            roleHarvester.run(creep);
        }
        if (creep.memory.role === 'upgrader') {
            upgraders = upgraders + 1;
            roleUpgrader.run(creep as Upgrader);
        }
        if (creep.memory.role === 'builder') {
            builders = builders + 1;
            roleBuilder.run(creep as Builder);
        }
        if (creep.memory.role === 'hauler') {
            hauler = hauler + 1;
            roleHauler.run(creep);
        }
    });

    const spawn =  Game.spawns['Spawn1'];
    if (harvesters < 2 && spawn.spawning == null) {
        creepSpawn(spawn, roleOptions.harvester)
    }

    if (hauler < 2 && spawn.spawning == null) {
        creepSpawn(spawn, roleOptions.hauler)
    }

    if (upgraders < 2 && spawn.spawning == null) {
        creepSpawn(spawn, roleOptions.upgrader)
    }
    if (builders < 2 && spawn.spawning == null && spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        creepSpawn(spawn, roleOptions.builder)
    }

    // Automatically delete memory of missing creeps
    Object.keys(Memory.creeps)
        .filter(name => !(name in Game.creeps))
        .forEach(name => delete Memory.creeps[name]);
}
