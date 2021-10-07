import { Commands } from "command/commands";
import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { bootstrap } from "./bootstrap";

describe("Commands Module", () => {
    let flag: Flag;
    beforeEach(() => {
        flag = mockInstanceOf<Flag>({
            pos: new RoomPosition(25, 25, 'someroom'),
            name: "SomeName",
            memory: {
                T: undefined,
                setPos: undefined
            }
        });
        mockGlobal<Game>("Game", {
            flags: {
                someName: flag
            },
            time: 0
        });
        mockGlobal<Memory>("Memory", {
            flags: {
                SomeName: flag.memory
            }
        });
    });

    it("should build instance of command", () => {
        const command = new bootstrap(flag);
        expect(command).toBeInstanceOf(Commands);
    });
});
