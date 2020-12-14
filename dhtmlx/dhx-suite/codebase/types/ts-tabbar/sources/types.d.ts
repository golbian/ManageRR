import { ILayoutConfig, LayoutEvents, ILayoutEventHandlersMap, ICell } from "../../ts-layout";
import { EventSystem } from "../../ts-common/events";
import { Position } from "../../ts-common/html";
export interface ITabbarConfig extends ILayoutConfig {
    mode?: Position;
    noContent?: boolean;
    tabWidth?: number;
    tabHeight?: number;
    css?: string;
    disabled?: string | string[];
    closable?: boolean | string[];
    activeTab?: string;
    closeButtons?: boolean;
}
export declare enum TabbarEvents {
    change = "change",
    beforeClose = "beforeClose",
    afterClose = "afterClose",
    close = "close"
}
export interface ITabbar {
    config: ITabbarConfig;
    events: EventSystem<TabbarEvents | LayoutEvents, ITabbarEventHandlersMap | ILayoutEventHandlersMap>;
    toVDOM(nodes?: any[]): any;
    paint(): void;
    destructor(): void;
    getId(index: number): string;
    getCell(id: string): ICell;
    setActive(id: string): void;
    getWidget(): any;
    getActive(): string;
    removeTab(id: string): void;
    addTab(config: ITabbarConfig, index: number): any;
    disableTab(id: string): boolean;
    enableTab(id: string): void;
    isDisabled(id?: string): boolean;
    removeCell(id: string): void;
    addCell(config: ITabbarConfig, index: number): any;
}
export interface ITabbarEventHandlersMap {
    [key: string]: (...args: any[]) => any;
    [TabbarEvents.change]: (id: string, prev: string) => any;
    [TabbarEvents.beforeClose]: (id: string) => boolean;
    [TabbarEvents.afterClose]: (id: string) => any;
    [TabbarEvents.close]: (id: string) => any;
}
