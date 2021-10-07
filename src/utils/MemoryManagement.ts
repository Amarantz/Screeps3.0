export class MemoryManagement {
    static cleanMemory (): void {
        this.cleanCreeps();
        this.cleanFlags();
    }

    static cleanCreeps(): void {
        Object.keys(Memory.creeps)
        .filter(name => !(name in Game.creeps))
        .forEach(name => delete Memory.creeps[name]);
    }

    static cleanFlags(): void {
        Object.keys(Memory.flags)
        .filter(name => !(name in Game.flags))
        .forEach(name => delete Memory.flags[name]);
    }

    static format(): void  {
        if (typeof(Memory.creeps) === 'undefined')  {
            Memory.creeps = {};
        }

        if (typeof(Memory.flags) === 'undefined') {
            Memory.flags = {};
        }

        if (typeof(Memory.rooms) === 'undefined') {
            Memory.rooms = {};
        }
    }

    static wrap(memory: any, memoryName: string, defaults = {}, deep = false): any {
        if(typeof(memory[memoryName]) === "undefined") {
            memory[memoryName] = _.clone(defaults);
        }
        if (deep) {
            memory[memoryName] = _.defaultsDeep(memory[memoryName], defaults);
        } else {
            memory[memoryName] = _.defaults(memory[memoryName], defaults);
        }

        return memory[memoryName];
    }
}
