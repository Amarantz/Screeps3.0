import { isToBeFilled } from "./harvester"

declare global {
}

const roleHauler = {
    run(creep: Creep): void {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            const fillableTargets = creep.room.find(FIND_MY_STRUCTURES, { filter: s => isToBeFilled(s) });
            if (creep.transfer(fillableTargets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(fillableTargets[0]);
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
