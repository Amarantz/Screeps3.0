declare global {
    type Result<T, S> = ResultSucceeded<T> | ResultFailed<S>
}

export class ResultSucceeded<T> {
    public readonly resultType = "succeeded";
    public constructor(readonly value: T) { }
}

export class ResultFailed<S> {
    public readonly resultType = "failed";
    public constructor(readonly reason: S) { }
}

export const Result = {
    Succeseeded: function <T>(value: T): ResultSucceeded<T> {
        return new ResultSucceeded(value);
    },
    Failed: function <T>(value: T): ResultFailed<T> {
        return new ResultFailed(value);
    }
}
