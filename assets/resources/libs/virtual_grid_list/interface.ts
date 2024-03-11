import {Component, _decorator} from "cc";
import {ImageCache} from "db://assets/resources/libs/virtual_grid_list/image_cache";

const {ccclass} = _decorator;

@ccclass('IVirtualGridListItem')
export class IVirtualGridListItem extends Component {
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
     */
    public loadImage(uri: string, callback: Function) {
        if (this._imageCache) {
            this._imageCache.loadImage(uri, callback);
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
    public onDataChanged(): void {

    }

    /**
     * 当被点击触发事件
     */
    public onSelect(): void {
    }

    /**
     * 当其他单元被点击触发事件
     */
    public onUnselect(): void {
    }

    /**
     * 当控件滑动进入可视区的时候触发
     */
    public onEnter(): void {
    }

    /**
     * 当控件滑动离开可视区的时候触发
     */
    public onLeave(): void {
    }

    protected onDestroy() {
        this._data = null;
    }
}
