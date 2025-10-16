
export type requestMethodType = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type requestQueryType = Record<string, string | number | boolean | null | undefined>;

export type requestBodyType = Record<string, unknown>;
