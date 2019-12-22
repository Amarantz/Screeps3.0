/**
 * Generic type for partial implementations of interfaces.
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> :
                   T[P] extends Id<infer V> ? Id<V> :
                   T[P] extends (object | undefined) ? DeepPartial<T[P]> :
                   T[P];
} & { [key: string]: any };


/**
 * Properties I've seen having been accessed internally by Jest's matchers and message formatters (there may be others).
 */
const jestInternalStuff: Array<symbol | string | number> = [
  Symbol.iterator,
  Symbol.toStringTag,
  "asymmetricMatch",
  "$$typeof",
  "nodeType",
  "@@__IMMUTABLE_ITERABLE__@@",
  "@@__IMMUTABLE_RECORD__@@"
];

/**
 * Mocks a global object instance, like Game or Memory.
 *
 * @param name - the name of the global
 * @param mockedProps - the properties you need to mock for your test
 */
function mockGlobal<T extends object>(name: string, mockedProps: DeepPartial<T> = {}) {
  const g = global as any;
  g[name] = mockInstanceOf<T>(mockedProps);
}

/**
 * Creates a mock instance of a class/interface.
 *
 * @param mockedProps - the properties you need to mock for your test
 */
function mockInstanceOf<T extends object>(mockedProps: DeepPartial<T> = {}): T {
  const target: DeepPartial<T> = {};

  Object.entries(mockedProps).forEach(([propName, mockedValue]) => {
    target[propName as keyof T] =
      typeof mockedValue === "function" ? jest.fn(mockedValue)
      : Array.isArray(mockedValue) ? mockedValue.map(mockInstanceOf)
      : typeof mockedValue === "object" ? mockInstanceOf(mockedValue)
      : mockedValue;
  });
  return new Proxy<T>(target as T, {
    get(t: T, p: PropertyKey): any {
      if (p in target) {
        return target[p.toString()];
      } else if (!jestInternalStuff.includes(p)) {
        throw new Error(`Unexpected access to property "${p.toString()}". Did you forget to mock it?`);
      }
    }
  });
}

/**
 * Keeps counters for each structure type, to generate unique IDs for them.
 */
const structureCounters: { [key: string]: number } = {};

/**
 * Creates a mock instance of a structure, with a unique ID, structure type and toJSON.
 * The unique IDs allow Jest's matcher (deep equality) to tell them apart.
 *
 * @param structureType
 * @param mockedProps - the additional properties you need to mock for your test
 */
function mockStructure<T extends StructureConstant>(structureType: T, mockedProps: DeepPartial<Structure<T>> = {}): Structure<T> {
  const count = (structureCounters[structureType] ?? 0) + 1;

  structureCounters[structureType] = count;
  return mockInstanceOf<Structure<T>>({
    id: `${structureType}${count}` as Id<Structure<T>>,
    structureType: structureType as any,
    toJSON() {
      return {
        id: this.id,
        structureType: this.structureType
      };
    },
    ...mockedProps
  });
}

/**
 * Call this once before running tests that create new instances of RoomPosition.
 */
function mockRoomPositionConstructor() {
  const constructorMock = jest.fn(mockRoomPosition);
  const g = global as any;
  g.RoomPosition = constructorMock;
}

/**
 * Creates a mock instance of RoomPosition.
 */
function mockRoomPosition(x: number, y: number, roomName: string): RoomPosition {
  return mockInstanceOf<RoomPosition>({
    x,
    y,
    roomName,
    toJSON: () => ({ x, y, roomName })
  });
}


export {
  mockGlobal,
  mockRoomPosition,
  mockRoomPositionConstructor,
  mockInstanceOf,
  mockStructure
};
