import {_decorator, Component} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('virtual_grid_list_base_item')
export class VirtualGridListBaseItem extends Component {
    private _itemIndex: number = -1;
    private _data: any = null;

    public get data(): any {
        return this._data;
    }

    protected start() {

    }

    /**
     * 更新item
     * @param {*} data 对应数据
     * @param {*} itemIndex 数据对象对应的列表索引
     */
    public updateItem(data: any, itemIndex: number) {
        this._itemIndex = itemIndex;
        this._data = data;
    }

    /**
     * 获取itemID
     * @returns {Number}
     */
    public get getItemIndex(): number {
        return this._itemIndex;
    }

    public setSelectStatus(selected: boolean) {
        this._data && (this._data.select = selected);
    }

    /**
     * 异步加载图片
     * @param {String} pic 图片uri
     * @param {Function} cb 加载完成之后回调方法
     * @param {*} thisObj 回调方法this对象
     */
    public loadImage(pic: string, cb: Function, thisObj: any) {
    }

    /**
     * 子类可覆盖方法，更新item 显示，item交替时候触发
     */
    public dataChanged() {
    }

    public onSelect() {
    }

    /**
     * 子类可覆盖方法，当其他单元被点击触发事件
     */
    public onUnselect() {
    }

    /**
     * 子类可覆盖，当控件滑动进入可视区的时候触发
     */
    public onEnter() {
        // log('on enter:' + this.$itemIndex);
    }

    /**
     * 子类可覆盖，当控件滑动离开可视区的时候触发
     */
    public onLeave() {
        // log('on leave:' + this.$itemIndex);
    }

    protected onDestroy() {
        this._data = null;
    }
}
