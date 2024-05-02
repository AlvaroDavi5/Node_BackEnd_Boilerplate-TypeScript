
export type constructorType<T> = new (...args: any[]) => T;

export type wrapperType<T> = T; // ? wrapperType to transpile in SWC
