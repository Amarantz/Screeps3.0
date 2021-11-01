declare global {
    interface WorldInterface {
        isSimulation(): boolean;
        beforeTick(): void;
        afterTick(): void;
    }
}

export const World: WorldInterface = {
    isSimulation: (): boolean => {
        return Game.shard.name === "sim"
    },

    beforeTick: (): void => {

    },

    afterTick: (): void => {

    }
}
