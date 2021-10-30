import { isToBeFilled } from "./harvester"

declare global {
}

const roleHauler = {
    run(creep: Creep): void {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (!creep.room.storage) {
                const fillableTargets = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: s => isToBeFilled(s) });
                if (fillableTargets && creep.transfer(fillableTargets, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(fillableTargets);
                }
            }
            if(creep.room.storage) {
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
        } else {
            if (!creep.memory.t) {
                const drops = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if (drops) {
                    creep.memory.t = drops.id
                } else {
                    const container = creep.pos.findClosestByRange<StructureContainer>(FIND_STRUCTURES, {
                        filter: s => {
                            return s.structureType === STRUCTURE_CONTAINER
                                && s.pos.findInRange(FIND_SOURCES, 1)
                                && s.store.getUsedCapacity() > s.store.getCapacity() * .25
                        }
                    });
                    if (container) {
                        creep.memory.t = container.id
                    }
                }
            } else {
                const target = Game.getObjectById<Resource | StructureContainer>(creep.memory.t);
                if (target && target instanceof StructureContainer) {
                    if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else if (target) {
                    if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                if(!target) {
                    delete creep.memory.t;
                }
            }
        }
    }
}

export default roleHauler;
