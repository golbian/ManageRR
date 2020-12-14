import { IKeyManager, IGrid, ISelectionType } from "./types";
import { anyFunction } from "../../ts-common/types";
export declare class KeyManager implements IKeyManager {
    protected _grid: IGrid;
    protected _focusedId: string | number;
    constructor(grid: IGrid);
    addHotKey(key: string, handler: anyFunction): void;
    isFocus(): boolean;
    protected _initFocusHandlers(): void;
    protected _cellSelecting(selection: ISelectionType): boolean;
    protected _initHotKeys(): void;
}
