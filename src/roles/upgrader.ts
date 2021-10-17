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
          if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      } else {
        const target = creep.room.find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_ENERGY});
        if (creep.pickup(target[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  };

  export default roleUpgrader;
