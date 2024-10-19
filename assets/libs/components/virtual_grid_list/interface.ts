import {Component, _decorator} from "cc";

import {ImageCache} from "./image_cache";

const {ccclass} = _decorator;

@ccclass('IVirtualGridListItem')
export abstract class IVirtualGridListItem extends Component {
    protected _itemIndex: number = -1;
    protected _data: any = null;
    protected _imageCache: ImageCache = null;

    set imageCache(value: ImageCache) {
        this._imageCache = value;
    }

    /**
     * 加载图片
     * @param uri
     * @param callback
     * @param bundleName
     */
    public async loadImage(uri: string, callback: Function, bundleName: string = 'resources') {
        if (this._imageCache) {
            await this._imageCache.loadImage(uri, callback, bundleName);
        }
    }

    /**
     * 自定义数据
     */
    public get data(): any {
        return this._data;
    }

    /**
     * 获取索引
     * @returns {Number}
     */
    public get itemIndex(): number {
        return this._itemIndex;
    }

    /**
     * 选中状态
     * @param selected
     */
    public setSelectStatus(selected: boolean): void {
        this._data && (this._data.select = selected);
    }

    /**
     * 更新item
     * @param {*} data 对应数据
     * @param {number} itemIndex 数据对象对应的列表索引
     */
    public updateItem(data: any, itemIndex: number): void {
        this._itemIndex = itemIndex;
        this._data = data;
    }

    /**
     * 更新item 显示，item交替时候触发
     */
    public abstract onDataChanged(): void;

    /**
     * 当被点击触发事件
     */
    public abstract onSelect(): void ;

    /**
     * 当其他单元被点击触发事件
     */
    public abstract onUnselect(): void ;

    /**
     * 当控件滑动进入可视区的时候触发
     */
    public abstract onEnter(): void ;

    /**
     * 当控件滑动离开可视区的时候触发
     */
    public abstract onLeave(): void;

    protected onDestroy() {
        this._data = null;
    }
}
