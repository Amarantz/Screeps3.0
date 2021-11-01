export const roleFiller = {
    run: (creep: Creep) => {
        if (creep.room.storage && creep.store.getUsedCapacity() === 0) {
            if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE ) {
                creep.moveTo(creep.room.storage);
            }
        }

        if (creep.store.getUsedCapacity() !== 0) {
            const target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => isToBeFilled(s)});
            if (creep.transfer(target as StructureExtension | StructureSpawn | StructureTower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target as StructureExtension | StructureSpawn | StructureTower);
            }
        }
    }
}


function isToBeFilled(structure: Structure): boolean {
    if (structure.structureType === STRUCTURE_EXTENSION
      || structure.structureType === STRUCTURE_SPAWN
      || structure.structureType === STRUCTURE_TOWER
    ) {
      const s = structure as StructureExtension | StructureSpawn | StructureTower;
      return s.energy < s.energyCapacity;
    }
    return false;
  }
