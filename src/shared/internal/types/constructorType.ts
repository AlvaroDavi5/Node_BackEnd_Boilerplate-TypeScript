
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type classConstructorType<T> = new (...args: any[]) => T;

export type wrapperType<T> = T; // ? wrapperType to transpile in SWC
