declare global {
  interface CreepMemory {
    /** target Id */
    t?: string;
  }
}


const roleHarvester = {

  run(creep: Creep): void {
    const level = creep.room.controller?.level;
    if(creep.memory.t) {
      const target = Game.getObjectById<Source>(creep.memory.t as Id<Source>);
      if(target) {
        const container = target.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER});
        const fillables = target.pos.findInRange(FIND_MY_STRUCTURES, 2, { filter: s => isToBeFilled(s)});
        if((creep.room.controller?.level || 0) >= 3) {
          if(!container.length) {
            const constructionSite = target.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
            if (constructionSite && creep.store.getFreeCapacity() === 0) {
              if (creep.build(constructionSite[0]) === ERR_NOT_IN_RANGE) {
                if (creep.fatigue === 0) creep.moveTo(constructionSite[0]);
              }
            }
            if (!constructionSite.length) {
              creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER)
            } else {
              if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                if (creep.fatigue === 0) creep.moveTo(target);
              }
            }
          }
          if (fillables.length && creep.store.getFreeCapacity() === 0) {
            if(creep.transfer(fillables[0], RESOURCE_ENERGY) !== OK) {
              if (creep.fatigue === 0) creep.moveTo(fillables[0]);
            }
          }
          if (container.length) {
            if(!creep.pos.isEqualTo(container[0].pos)) {
              if (creep.fatigue === 0) creep.moveTo(container[0].pos);
            } else {
              if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                if (creep.fatigue === 0) creep.moveTo(target);
              }
            }
          }
        }

        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
          if (creep.fatigue === 0) creep.moveTo(target);
        } else {
          if (creep.harvest(target) !== OK) {
            console.log('Error with container location');
          }
        }
      }
    }
  },
  assign(source: Source): void {
    if (_.some(Game.creeps, creep => creep.memory.role === 'harvester' && creep.memory.t && creep.memory.t === source.id)) {
      return;
    }
    const creepToAssign = _.find(Game.creeps, creep => creep.memory.role === 'harvester' && !creep.memory.t);
    if (creepToAssign) {
      creepToAssign.memory.t = source.id
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

export default roleHarvester;
export { isToBeFilled };
