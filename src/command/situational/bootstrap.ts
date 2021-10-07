import { Commands } from "command/commands";

export class bootstrap extends Commands {
    static primary: COLOR_YELLOW;
    static secondary: COLOR_RED;
    static commandName: "bootstrap";

    constructor(flag: Flag) {
        super(flag);
    }
    init(): void {
        //todo
    }
    run(): void {
        //todo
    }
    refresh(): void {
        //todo
    }
}
