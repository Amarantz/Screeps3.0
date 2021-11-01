declare global {
    interface state {
        /** type of process  */
        t: string
    }

    interface Stateful {
        encode(): state;
    }
}

export const isStateful = (args: any): args is Stateful => {
    return args.encode !== undefined;
}


