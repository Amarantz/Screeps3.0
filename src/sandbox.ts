import roleBuilder from "roles/builder";
import roleHarvester from "roles/harvester";
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
    });

    if (harvesters < 2 && Game.spawns['Spawn1'].spawning == null) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, MOVE, CARRY], `harvester_${Game.time}`, { memory: { role: 'harvester' } as CreepMemory });
    }

    if (upgraders < 2 && Game.spawns['Spawn1'].spawning == null) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, MOVE, CARRY], `upgrader_${Game.time}`, { memory: { role: 'upgrader' } as CreepMemory });
    }
    if (builders < 2 && Game.spawns['Spawn1'].spawning == null && Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, MOVE, CARRY], `builder_${Game.time}`, { memory: { role: 'builder' } as BuilderMemory });
    }

    // Automatically delete memory of missing creeps
    Object.keys(Memory.creeps)
        .filter(name => !(name in Game.creeps))
        .forEach(name => delete Memory.creeps[name]);
}
