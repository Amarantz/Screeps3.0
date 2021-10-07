/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-namespace */
import ErrorMapper from 'utils/ErrorMapper';
import { MemoryManagement } from 'utils/MemoryManagement';

import roleBuilder from 'roles/builder';
import roleHarvester from 'roles/harvester';
import roleUpgrader from 'roles/upgrader';

declare global {
    interface CreepMemory {
        role: string,
    }

    interface protoPos {
        x: number,
        y: number,
        roomName: string,
    }

    namespace NodeJS {
        interface Global {
            deref: (ref: string) => RoomObject | undefined,
            derefRoomPosition: (protoPos: protoPos) => RoomPosition;
        }
    }
}

(global as any).deref = (ref: string): RoomObject | null => {
    return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}

(global as any).derefRoomPosition = (protoPos: protoPos) => {
    return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}

function main(): void {
    let harvesters = 0;
    let upgraders = 0;
    let builders = 0;

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
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,MOVE,CARRY], `harvester_${Game.time}`, { memory: { role: 'harvester'} as CreepMemory });
    }

    if (upgraders < 2 && Game.spawns['Spawn1'].spawning == null) {
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,MOVE,CARRY], `upgrader_${Game.time}`, { memory: { role: 'upgrader'} as CreepMemory });
    }
    if (builders < 2 && Game.spawns['Spawn1'].spawning == null && Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,MOVE,CARRY], `builder_${Game.time}`, { memory: { role: 'builder'} as BuilderMemory });
    }

    // Automatically delete memory of missing creeps
    Object.keys(Memory.creeps)
        .filter(name => !(name in Game.creeps))
        .forEach(name => delete Memory.creeps[name]);
}

function onGlobalReset() {
    MemoryManagement.format();
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
const loop = ErrorMapper.wrapLoop(main);

export {
    loop,
    main
};

onGlobalReset();
