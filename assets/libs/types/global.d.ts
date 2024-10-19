export type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};

declare type Nullable<T> = T | null;
declare type NonNullable<T> = T extends null | undefined ? never : T;
declare type Recordable<T = any> = Record<string, T>;
declare type ReadonlyRecordable<T = any> = {
    readonly [key: string]: T;
};
