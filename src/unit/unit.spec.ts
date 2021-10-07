import { mockInstanceOf, mockGlobal } from 'screeps-jest';
import { Unit } from 'unit/unit';

describe("Unit Module", () => {
    let creep: Creep;
    beforeEach(() => {
        creep = mockInstanceOf<Creep>({
            name: 'somename',
            id: '5616123156123',
            hits: 25,
            hitsMax: 25,
            owner: mockInstanceOf<Owner>({
                username: 'bobsmith'
            }),
            memory: {},
            body: [{type: WORK, hits: 25}],
            fatigue: 0,
            my: true,
            ticksToLive: 2000,
            pos: { roomName: "w23n24", x: 20, y: 20 },
            store: { getFreeCapacity: () => 25, getCapacity: () => 25 },
            room: {} as Room
        });
        mockGlobal<Game>("Game", {
            creeps: {
                somename: creep
            }
        });
    });

    it("should map the return the name", () => {
        const unit = new Unit(creep);
        expect(unit.name).toBe('somename');
    });

    it('should return hit points', () => {
        const unit = new Unit(creep);
        expect(unit.hits).toBe(25);
    });

    it('should return max hit points', () => {
        const unit = new Unit(creep);
        expect(unit.hitsMax).toBe(25);
    });

    it('should return room position', () => {
        const unit = new Unit(creep);
        expect(unit.pos).not.toBeNull();
    });

    it('should refresh creep', () => {
        const unit = new Unit(creep);
        expect(creep.hits).toBe(25);
        creep.hits = 20;
        unit.refresh();
        expect(creep.hits).toBe(20);
    });
});
