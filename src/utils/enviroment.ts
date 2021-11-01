declare global {
    type PersistentWord = "persistent world";
    type SimulationWorld = "simulation";
    type Season3 = "season3";
    type BotArena = "botarena";
    type World = PersistentWord | SimulationWorld | Season3 | BotArena;
    type ShardName = string;
    interface Enviroment {
        world: World;
        shard: ShardName;
        isAutomatic(): boolean;
    }
}

const world = ((): World => {
    switch(Game.shard.name) {
        case "sim":
            return "simulation";
        case "shardSeason":
            return "season3";
        case "shard0":
        case "shard1":
        case "shard2":
        case "shard3":
            return "persistent world";
        case "botarena":
        default:
            return "botarena";
    }
})();

export const Enviroment: Enviroment = {
    world,
    shard: Game.shard.name,

    isAutomatic(): boolean {
        switch (world) {
            case "persistent world":
            case "season3":
            case "simulation":
                return false;
            case "botarena":
            default:
                return true;
        }
    }
}
