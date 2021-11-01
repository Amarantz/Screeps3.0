declare global {
  interface Upgrader extends Creep {
    memory: UpgraderMemory;
  }

  interface UpgraderMemory extends CreepMemory {
    role: 'upgrader';
    upgrading: boolean;
  }
}

const roleUpgrader = {

  run(creep: Upgrader): void {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.room.controller) {
        if (creep.pos.getRangeTo(creep.room.controller) > 2) {
          creep.moveTo(creep.room.controller);
        } else {
          creep.upgradeController(creep.room.controller);
        }
      }
    } else {
      if (!creep.room.storage || creep.room.storage.store.getUsedCapacity() === 0) {
        const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_ENERGY });
        if (target && creep.pickup(target) === ERR_NOT_IN_RANGE) {
          if (creep.fatigue === 0) creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
      if (creep.room.storage && creep.room.storage.store.getUsedCapacity()) {
        if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.storage);
        }
      }
    }
  }
};

export default roleUpgrader;
