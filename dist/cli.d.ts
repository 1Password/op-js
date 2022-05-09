import { FieldAssignment, FieldLabelSelector, FieldTypeSelector, GlobalFlags } from "./index";
export declare type FlagValue = string | string[] | boolean | FieldLabelSelector | FieldTypeSelector;
export declare type Flags = Record<string, FlagValue>;
export declare const camelToHyphen: (str: string) => string;
export declare const parseFlagValue: (value: FlagValue) => string;
export declare const createFlags: (flags: Record<string, FlagValue>) => string[];
export declare const createFieldAssignment: ([label, type, value,]: FieldAssignment) => string;
export declare class CLI {
    static requiredVersion: string;
    globalFlags: Partial<GlobalFlags>;
    getVersion(): string;
    validate(): Promise<void>;
    execute<TData extends string | Record<string, any> | void>(command: string[], { args, flags, stdin, json, }?: {
        args?: (string | null | FieldAssignment)[];
        flags?: Record<string, FlagValue>;
        stdin?: string;
        json?: boolean;
    }): TData;
}
export declare const cli: CLI;
