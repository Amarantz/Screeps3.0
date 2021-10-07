export class Unit {
    creep: Creep | PowerCreep;
    name: string;

    constructor(creep: Creep | PowerCreep) {
        this.creep = creep;
        this.name = creep.name;
    }

    get hits(): number {
        return this.creep.hits;
    }

    get hitsMax(): number {
        return this.creep.hitsMax;
    }

    get pos(): RoomPosition {
        return this.creep.pos;
    }

    get room(): Room | undefined {
        return this.creep.room;
    }

    get store(): StoreDefinition {
        return this.creep.store;
    }

    refresh(): void {
        const creep = Game.creeps[this.name];
        if (creep) {
            this.creep = creep;
        } else {

        }
    }
}
