import { IGrid, IDirection } from "../types";
export declare function isChild(parent: any, child: any): boolean;
export declare const variables: {
    arrowLeft: string;
    arrowRight: string;
    arrowUp: string;
    arrowDown: string;
    escape: string;
    space: string;
};
export declare function selectionMove(e: KeyboardEvent, grid: IGrid, dir: IDirection, range: number, toEnd?: boolean, ctrlUp?: boolean, shiftUp?: boolean): void;
