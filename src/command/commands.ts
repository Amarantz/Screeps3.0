/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unsafe-call */
declare global {
    const enum MEM {
        TICK = 'T',
    }

    interface FlagMemory {
        setPos?: protoPos,
        [MEM.TICK]: number,
    }

    namespace NodeJS {
        interface Global {
            deref: (ref: string) => RoomObject | undefined,
            derefRoomPosition: (protoPos: protoPos) => RoomPosition;
        }
    }
}

declare let global: NodeJS.Global;

export abstract class Commands {
    static primary: ColorConstant;
    static secondary: ColorConstant;
    static CommandName: string;
    memory: FlagMemory;
    name: string;
    flag: Flag;

    constructor(flag: Flag, baseFilter?: (base: any) => boolean) {
        this.memory = flag.memory;
        this.name = flag.name;
        this.flag = flag;

        if (!this.memory[MEM.TICK]) {
            this.memory[MEM.TICK] = Game.time;
        }

        if (this.memory.setPos) {
            const setPosition = global.derefRoomPosition(this.memory.setPos);
            if (!this.flag.pos.isEqualTo(setPosition)) {
                this.flag.setPosition(setPosition);
            } else {
                delete this.memory.setPos;
            }
        }

        (global as any)[this.name] = this;
    }

    get room(): Room | undefined {
        return this.flag.room;
    }

    get pos(): RoomPosition {
        return this.flag.pos;
    }

    get age(): number {
        return Game.time - this.memory[MEM.TICK]!;
    }

    abstract init(): void;
    abstract run(): void;
    abstract refresh(): void;
}
