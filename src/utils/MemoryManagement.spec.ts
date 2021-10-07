import { MemoryManagement } from 'utils/MemoryManagement';
import { mockGlobal, mockInstanceOf } from 'screeps-jest';

const harvester = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
describe("MemoryManagement Module", () => {
    it("should handle cleaning creep memory", () => {
        mockGlobal<Game>('Game', {
            creeps: { stillKicking: harvester },
            rooms: {},
            time: 1
          });
          mockGlobal<Memory>('Memory', {
            creeps: {
              dead: { role: 'garbage' },
              goner: { role: 'waste' },
              stillKicking: harvester.memory
            }
          });
        MemoryManagement.cleanCreeps();
        expect(Object.keys(Memory.creeps).length).toBe(1);
    });

    it("should handle cleaning up flags", () => {
        mockGlobal<Game>("Game", {
            flags: {
                flag1: mockInstanceOf<Flag>({ memory: { name: 'flag1' }}),
                flag2: mockInstanceOf<Flag>({ memory: { name: 'flag2' }})
            }
        });
        mockGlobal<Memory>("Memory", {
            flags: {
                flag1: {},
                flag2: {},
                flag3: {}
            }
        });
        MemoryManagement.cleanFlags();
        expect(Object.keys(Memory.flags).length).toBe(2);
    })

    it('should add memory entry', () => {
        const memory:  {[key:string]: any} = {};
        const defaults = { some: 'string' };
        MemoryManagement.wrap(memory, 'someMemory', defaults);
        expect(memory.someMemory).toEqual(defaults);
    });

    it('should format memory if undefined', () => {
        mockGlobal<Memory>("Memory", {
            creeps: undefined,
            flags: undefined,
            rooms: undefined
        });
        MemoryManagement.format();
        expect(Memory.creeps).toEqual({});
        expect(Memory.flags).toEqual({});
        expect(Memory.rooms).toEqual({});
    });

    it('should not format memory if not undefined', () => {
        mockGlobal<Memory>("Memory", {
            creeps: { harvester: {role: 'harvester' }},
            flags: {},
            rooms: {}
        });
        MemoryManagement.format();
        expect(Memory.creeps).toEqual({ harvester: {role: 'harvester' }});
        expect(Memory.flags).toEqual({});
        expect(Memory.rooms).toEqual({});
    });
});
