import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { Commands } from "./commands";

describe("Commands Module", () => {
    beforeEach(() => {
        const flag = mockInstanceOf<Flag>({
            pos: new RoomPosition(25, 25, 'someroom'),
            name: "SomeName",
            memory: {}
        });
        mockGlobal<Game>("Game", {
            flags: {
                someName: flag
            }
        });
        mockGlobal<Memory>("Memory", {
            flags: {
                SomeName: flag.memory
            }
        });
    });
});
