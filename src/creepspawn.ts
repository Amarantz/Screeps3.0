declare global {
    interface creepSetupOptions {
        body: BodyPartConstant[],
        namePrefix: string,
        memory: CreepMemory,
        maxRepeat?: number
    }
}

export const bodyCost = (body: BodyPartConstant[]): number => {
    return body.reduce((acc, bodyPart) => {
        return acc + BODYPART_COST[bodyPart];
    }, 0);
}

export const creepSpawn = (spawn: StructureSpawn, opts: creepSetupOptions) => {
    if (spawn.spawning) {
        return spawn.spawning
    }
    const baseCost = bodyCost(opts.body);
    const currentMult = Math.floor(spawn.room.energyCapacityAvailable / baseCost);
    let mult = 1;
    if (opts.maxRepeat && currentMult <= opts.maxRepeat) {
        mult = currentMult;
    } else if (opts.maxRepeat && currentMult > opts.maxRepeat) {
        mult = opts.maxRepeat;
    }

    const body: BodyPartConstant[] = [];
    opts.body.forEach(b => {
        for (let i = 0; i < mult; i++) {
            body.push(b);
        }
    });
    return spawn.spawnCreep(body, `${opts.namePrefix}_${Game.time}`, { memory: opts.memory });
}

export const roleOptions: { [key: string]: creepSetupOptions } = {
    harvester: {
        body: [WORK, WORK, MOVE, CARRY],
        maxRepeat: 99,
        namePrefix: 'harvester',
        memory: {
            role: 'harvester'
        }
    },
    upgrader: {
        body: [WORK, MOVE, CARRY],
        maxRepeat: 99,
        namePrefix: 'upgrader',
        memory: {
            role: 'upgrader'
        }
    },
    hauler: {
        body: [MOVE, MOVE, CARRY, CARRY],
        maxRepeat: 99,
        namePrefix: 'hauler',
        memory: {
            role: 'hauler'
        }
    },
    filler: {
        body: [MOVE, MOVE, CARRY, CARRY],
        maxRepeat: 99,
        namePrefix: 'filler',
        memory: {
            role: 'filler'
        }
    },
    builder: {
        body: [WORK, MOVE, CARRY],
        maxRepeat: 99,
        namePrefix: 'builder',
        memory: {
            role: 'builder'
        }
    }
}
