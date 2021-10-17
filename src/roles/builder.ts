declare global {
    interface Builder extends Creep {
        memory: BuilderMemory;
    }

    interface BuilderMemory extends CreepMemory {
        building: boolean;
        role: 'builder';
    }
}

const roleBuilder = {
    run(creep: Builder): void {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            const target = creep.room.find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_ENERGY });
            if (creep.pickup(target[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

export default roleBuilder;
