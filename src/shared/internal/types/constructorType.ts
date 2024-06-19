
export type constructorType<T> = new (...args: unknown[]) => T;

export type wrapperType<T> = T; // ? wrapperType to transpile in SWC
