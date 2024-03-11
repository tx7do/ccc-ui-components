import {
    _decorator,
    CCBoolean,
    CCInteger,
    CCString,
    Component,
    error,
    instantiate,
    Label,
    math,
    Node,
    Prefab,
    ScrollView,
    isValid,
    UITransform,
    Event
} from 'cc';
import {IVirtualGridListItem} from './interface';
import {ImageCache} from "./image_cache";

const {ccclass, property} = _decorator;


interface IVirtualGridOptions {
    paddingTop?: number;        // 列表距离上边缘距离 默认为0
    paddingBottom?: number;     // 列表距离下边缘距离 默认为0

    spacingX?: number;          // 列间距 默认为3
    spacingY?: number;          // 行间距 默认为3

    columnNum?: number;         // 列数 默认为0，自动适配容器宽度
    useVirtualLayout?: boolean; // 是否启用虚拟列表 默认为true
    emptyTip?: string;          // 没有数据显示提示
    cacheImage?: boolean;       // 缓存列表中加载过的图片，控件回收后，图片缓存将被全部释放。
}

@ccclass('VirtualGridList')
export class VirtualGridList extends Component {
    @property({
        tooltip: '表项的预制体',
        type: Prefab,
    })
    protected itemPrefab: Prefab = null;

    @property({
        tooltip: '没有数据时候的显示文本组件',
        type: Label,
    })
    protected labelEmptyTip: Label = null;

    @property({
        tooltip: '表项距离上边缘距离',
        type: CCInteger,
    })
    protected paddingTop: number = 0; // item 距离上边缘距离
    @property({
        tooltip: '表项距离下边缘距离',
        type: CCInteger,
    })
    protected paddingBottom: number = 0; // item 距离下边缘距离

    @property({
        tooltip: '表项的列间距',
        type: CCInteger,
    })
    protected spacingX: number = 3; // item 列间距
    @property({
        tooltip: '表项的行间距',
        type: CCInteger,
    })
    protected spacingY: number = 3; // item 行间距

    @property({
        tooltip: '列数',
        type: CCInteger,
    })
    protected columnNum: number = 0; // 列数

    @property({
        tooltip: '是否启用虚拟列表',
        type: CCBoolean,
    })
    protected useVirtualLayout: boolean = true;    // 是否启用虚拟列表

    @property({
        tooltip: '是否缓存所加载的图片',
        type: CCBoolean,
    })
    protected cacheImage: boolean = true;  // 缓存加载的图片

    @property({
        tooltip: '没有数据时候的显示文本',
        type: CCString,
    })
    protected emptyTip: string = '';

    _items: Array<Node> = [];

    private _imageCache: ImageCache = new ImageCache();

    protected _dataList: any[] = [];

    protected _selectedItemData: any = null;

    protected _scrollView: ScrollView = null; // ScrollView组件
    protected _content: Node = null; // ScrollView.content

    protected _spawnCount: number = 0; // 常驻绘制数量
    protected _totalCount: number = 0; // 总共数量
    protected _bufferZone: number = 0; // 缓冲区域(包括屏幕内)
    protected _lastContentPosY: number = 0; // 上一次滚动位置

    protected _itemHeight: number = 0; // item template 高度
    protected _itemWidth: number = 0; // item template 宽度

    protected _initialized: boolean = false; //初始化完成

    protected _scrollToBottomHandler: Function = null;  // 滑动到底部回调事件
    protected _scrollToBottomThisObj: any = null;       // 滑动到底部回调事件this对象

    protected _selectOneItemHandler: Function = null;   // 选中回调事件
    protected _selectOneItemThisObj: any = null;        // 选中事件this 对象

    /**
     * 获取显示列表
     * @returns {Array<Node>}
     */
    public get getTemplateItems(): Node[] {
        return this._items;
    }

    /**
     * 获取数据队列
     * @returns {Array<any>}
     **/
    public get getDataList(): Array<any> {
        return this._dataList;
    }

    public get getGridList(): ScrollView {
        return this._scrollView;
    }

    start() {
        // let data: any[] = []
        // data.push({})
        // data.push({})
        // this.refreshItemDisplays(data)

        this.initGridList();
    }

    protected onLoad() {

    }

    /**
     * 通过初始化方法传参的方式，初始化滚动列表，建议在画面的onLoad方法中调用，
     * 相比在creator界面中设置参数，这种方式更易维护，不会因为与VirtualGridList控件保持同步而导致配置丢失或者重置。
     * @param {IVirtualGridOptions} options
     */
    initGridList(options?: IVirtualGridOptions) {
        this._scrollView = this.node.getComponent(ScrollView);
        this._content = this._scrollView.content;

        // this.itemPrefab = itemPrefab;

        if (options) {
            this.paddingTop = (options.paddingTop === undefined) ? this.paddingTop : options.paddingTop;
            this.paddingBottom = (options.paddingBottom === undefined) ? this.paddingBottom : options.paddingBottom;
            this.spacingX = options.spacingX === undefined ? this.spacingX : options.spacingX;
            this.spacingY = options.spacingY === undefined ? this.spacingY : options.spacingY;
            this.columnNum = options.columnNum === undefined ? this.columnNum : options.columnNum;
            this.useVirtualLayout = options.useVirtualLayout === undefined ? this.useVirtualLayout : options.useVirtualLayout;
            this.emptyTip = options.emptyTip === undefined ? this.emptyTip : options.emptyTip;
            this.cacheImage = options.cacheImage === undefined ? true : this.cacheImage;
        }

        this.labelEmptyTip.getComponent(Label).string = this.emptyTip;

        // 延时为了自适应宽度
        this.scheduleOnce(this._initializeList, 0);
    }

    /**
     * 初始化布局
     */
    protected _initializeList() {
        // this._gridList = this.node.getComponent(ScrollView);
        // this._content = this._gridList.content;
        this._itemHeight = (this.itemPrefab.data as Node).getComponent(UITransform).height;
        this._itemWidth = (this.itemPrefab.data as Node).getComponent(UITransform).width;
        if (this.columnNum == 0) {
            // 自动计算
            this.columnNum = Math.floor((this._content.getComponent(UITransform).width + this.spacingX) / (this._itemWidth + this.spacingX));
            if (this.columnNum < 1) {
                this.columnNum = 1;
            }
        }

        if (this.useVirtualLayout) {
            this.node.on('scrolling', this._onVirtualLayoutScrolling, this);
        } else {
            // this.node.on('scrolling', this._onScrolling, this);
        }
        // 缓冲区域，半屏加1个item高度
        this._bufferZone = this.node.getComponent(UITransform).height * 0.5 + this._itemHeight;

        // 计算出需要同时绘制的数量(一屏数量 + 二行(上下各一行))
        this._spawnCount = Math.ceil(this.node.getComponent(UITransform).height / this._itemHeight + 2) * this.columnNum;

        this._lastContentPosY = 0;
        this._initialized = true;

        // 数据列表可能在初始化完成之前进入
        if (this._dataList) {
            this.createItemsDisplayList(this._dataList);
        }
    }

    /**
     * 创建物品格子列表
     * @param {Array<any>} dataList 数据
     */
    protected createItemsDisplayList(dataList: Array<any> = []) {
        this._dataList = dataList = dataList || [];
        if (!this._initialized) {
            return;
        }

        let content = this._content || this._scrollView.content;
        content.destroyAllChildren();

        // 总数量
        this._totalCount = dataList.length;
        // 设置content总高度
        content.getComponent(UITransform).height = this._getContentHeight(this._totalCount);

        // 创建固定数量
        this._createFixedIncrementItems();

        if (!this.isTop()) {
            this.scheduleOnce(() => {
                this.scrollToTop();
            }, .2);
        }

        this.labelEmptyTip.node.active = this._totalCount <= 0;
    }

    /**
     * 追加数据列表，一般用于滚动翻页
     * @param {Array<any>} dataList 追加数据队列
     */
    appendItemsToDisplayList(dataList: Array<any>) {
        if (!dataList || dataList.length <= 0) {
            return;
        }

        if (this._totalCount <= 0) {
            this.createItemsDisplayList(dataList);
            return;
        }

        dataList = this._dataList.concat(dataList);
        if (this._totalCount < this._spawnCount) {
            // 不满一屏的时候，重新绘制新列表
            this.createItemsDisplayList(dataList);
        } else {
            let content = this._content || this._scrollView.content;
            // 总数量
            this._totalCount = dataList.length;
            // 设置content总高度
            content.getComponent(UITransform).height = this._getContentHeight(this._totalCount);
            // // 创建固定数量
            this._createFixedIncrementItems(this._dataList.length);
            this._dataList = dataList;

            this.labelEmptyTip.node.active = this._totalCount <= 0;

            this.scheduleOnce(() => {
                let pos = this._scrollView.getScrollOffset();
                pos.y += this._itemHeight * .2;
                this._scrollView.scrollToOffset(pos, .1);
            });
        }
    }

    /**
     * 注册滚动至底部回调方法
     * @param {Function} handler 滚动至底部回调函数 function()
     * @param {*} thisObj 回调函数this对象
     */
    registerScrollToBottomEventHandler(handler: Function, thisObj: any) {
        this._scrollToBottomHandler = handler;
        this._scrollToBottomThisObj = thisObj;
    }

    /**
     * 选中事件回调方法
     * @param {Function} handler 选中事件回调函数 function()
     * @param {*} thisObj 回调函数this对象
     */
    registerSelectOneItemEventHandler(handler: Function, thisObj: any) {
        this._selectOneItemHandler = handler;
        this._selectOneItemThisObj = thisObj;
    }

    /**
     * 刷新列表显示, 条数不变，修改数据，刷新显示
     * @param {any[]} some 刷新指定单元
     */
    refreshItemDisplays(some?: any[]) {
        if (this._items) {
            let list = this._items;
            let item: Node;
            if (some && some.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    item = list[i];
                    const com = (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem)
                    if (some.indexOf(com.data) != -1) {
                        com.onDataChanged();
                    }
                }
            } else {
                for (let i = 0; i < list.length; i++) {
                    item = list[i];
                    const com = (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem)
                    com.onDataChanged();
                }
            }
            item = null;
            list = null;
        }
    }

    protected _onVirtualLayoutScrolling() {
        let items = this._items;
        const buffer = this._bufferZone;
        const isDown = this._content.position.y < this._lastContentPosY; // 滚动方向 下减上加
        const offset = (this._itemHeight + this.spacingY) * Math.ceil(items.length / this.columnNum); // 所有items 总高度
        let dataList = this._dataList;

        // 更新每一个item位置和数据
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let viewPos = this.getPositionInView(item);

            if (isDown) {
                // 往下滑动，看下面的item，超出屏幕外下方，但是没有到top的item
                if (viewPos.y < -buffer
                    && item.position.y + offset < 0) {
                    let itemCtrl = (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem);
                    itemCtrl.onLeave();
                    item.setPosition(item.position.x, item.position.y + offset)
                    let itemIndex = itemCtrl.itemIndex - items.length;
                    itemCtrl.updateItem(dataList[itemIndex], itemIndex);
                    itemCtrl.onDataChanged();
                    itemCtrl.onEnter();
                }
            } else {
                // 往上滑动，看上面的item，超出屏幕外上方，但是没有到bottom的item
                if (viewPos.y > buffer
                    && item.position.y - offset > -this._content.getComponent(UITransform).height) {
                    let itemCtrl = (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem);
                    let itemIndex = itemCtrl.itemIndex + items.length;
                    // 大于总数量的不移动更新
                    if (itemIndex < this._totalCount) {
                        itemCtrl.onLeave();
                        item.setPosition(item.position.x, item.position.y - offset)
                        itemCtrl.updateItem(dataList[itemIndex], itemIndex);
                        itemCtrl.onDataChanged();
                        itemCtrl.onEnter();

                        if (itemIndex === this._totalCount - 1) {
                            this._onScrollToBottom();
                        }
                    }
                }
            }
        }
        // 保存最后一次contentY偏移量，判断滑动方向
        this._lastContentPosY = this._content.position.y;
        items = null;
        dataList = null;
    }

    /**
     * 滚动到底部触发
     */
    protected _onScrollToBottom() {
        if (this._scrollToBottomHandler) {
            this._scrollToBottomHandler.call(this._scrollToBottomThisObj);
        }
    }

    protected _onSelectOneItem(data: any) {
        if (this._selectOneItemHandler) {
            this._selectOneItemHandler.call(this._selectOneItemThisObj, data);
        }
    }

    /**
     * 创建固定增量的items
     * @param {Number} startIndex 起始索引
     */
    protected _createFixedIncrementItems(startIndex: number = 0) {
        let items: Node[] = this._items = [];
        startIndex = startIndex || 0
        // 如果总数量不足够同时创建的数量，则只创建总数量
        let fixCount = this._totalCount;
        if (this.useVirtualLayout) {
            fixCount = this._totalCount < this._spawnCount ? this._totalCount : this._spawnCount;
        }

        let dataList = this._dataList;
        for (let i = startIndex; i < fixCount; i++) {
            let item = this._createOneItemDisplay(i, dataList[i]);
            items.push(item);
        }
        dataList = null;

        if (items.length > 0) {
            this.scheduleOnce(() => {
                for (let i = 0; i < items.length; i++) {
                    (items[i].getComponent(IVirtualGridListItem) as IVirtualGridListItem).onDataChanged();
                }
                items = null;
            })
        }
    }

    /**
     * 创建一个item
     * @param {Number} idx 索引
     * @param {*} data
     * @returns {Node} 返回一个显示单元
     */
    protected _createOneItemDisplay(idx: number, data: any): Node {
        let item = instantiate(this.itemPrefab);
        this._content.addChild(item);

        // 更新位置
        this._updateItemPos(item, idx);

        // 更新id
        const component = (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem);
        component.updateItem(data, idx);
        component.imageCache = this._imageCache;

        item.on(Node.EventType.TOUCH_END, this._onItemTouched, this);
        return item;
    }

    /**
     * 显示单元被点击事件 触发select 和 unselect事件
     * @param {Event} event
     */
    protected _onItemTouched(event: Event) {
        const target = event.target as Node;
        const com = target.getComponent(IVirtualGridListItem) as IVirtualGridListItem;
        this._selectOne(com, true);
    }

    setSelectionWithoutCallback(data: any) {
        const item = this.findItemDisplayByData(data);
        item && this._selectOne(this.getBaseItem(item), false);
    }

    setSelectionAndCallback(data: any) {
        const item = this.findItemDisplayByData(data);
        item && this._selectOne(this.getBaseItem(item), true);
    }

    getBaseItem(item: Node): IVirtualGridListItem {
        return (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem)
    }

    protected _selectOne(com: IVirtualGridListItem, triggerOutsideCallback: any) {
        if (this._selectedItemData && this._selectedItemData != com.data) {
            let item = this.findItemDisplayByData(this._selectedItemData);
            if (item) {
                let component = this.getBaseItem(item);
                component.setSelectStatus(false);
                component.onUnselect();
            }
        }
        this._selectedItemData = com.data;
        com.setSelectStatus(true);
        com.onSelect();
        true === triggerOutsideCallback && this._onSelectOneItem(com.data);
    }

    /**
     * 根据item的数据data查找显示对象Item，当开启虚拟列表的时候，返回对象可能不存在
     * @param {any} data
     * @returns {Node} 与数据对应的显示单元
     */
    public findItemDisplayByData(data: any): Node {
        if (data && this._items) {
            let list = this._items;
            for (let item of list) {
                let component = (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem);
                if (component.data == data) {
                    return item;
                }
            }
            list = null;
            return null;
        } else {
            return null;
        }
    }

    /**
     * 更新item位置
     * @param {Node} item item节点
     * @param {Number} idx 索引
     */
    private _updateItemPos(item: Node, idx: number) {
        const col = idx % this.columnNum;
        const row = Math.floor(idx / this.columnNum);

        const contentUiTrans = this._content.getComponent(UITransform)!;
        const itemUiTrans = item.getComponent(UITransform)!;

        item.setPosition(
            -contentUiTrans.width * 0.5 + itemUiTrans.width * (0.5 + col) + this.spacingX * col,
            -itemUiTrans.height * (0.5 + row) - this.spacingY * (row) - this.paddingTop
        );
    }

    /**
     * 更新item
     * @param {Node} item item节点
     * @param {any} data
     * @param {*} idx 索引
     */
    private _updateItem(item: Node, data: any, idx: number) {
        // 更新位置
        this._updateItemPos(item, idx);
        // 更新id
        (item.getComponent(IVirtualGridListItem) as IVirtualGridListItem).updateItem(data, idx);
    }

    /**
     * 获取content总高度
     * @param {Number} totalCount 总数量
     * @returns {Number} 容器总高度
     */
    private _getContentHeight(totalCount: number): number {
        return Math.ceil(totalCount / this.columnNum) * (this._itemHeight + this.spacingY) + this.paddingTop + this.paddingBottom;
    }

    /**
     * 是否在顶端
     * @returns {Boolean}
     */
    public isTop(): boolean {
        return this.getScrollOffsetY() <= 0;
    }

    /**
     * 滚动到顶部
     */
    public scrollToTop() {
        this.scrollToFixedPosition(0, .2);
    }

    /**
     * 滚动到固定位置
     * @param {Number} itemIndex item index
     * @param {Number} sec 滚动时间
     */
    public scrollToFixedPosition(itemIndex: number, sec: number) {
        this.stopAutoScroll();

        let itemHeight = 1;
        if (this.itemPrefab != null && this.itemPrefab.data != null) {
            itemHeight = (this.itemPrefab.data as Node).getComponent(UITransform).height;
        }

        const columnNum = this.columnNum;
        const col = itemIndex % columnNum;
        const row = Math.floor(itemIndex / columnNum);
        const y = -itemHeight * (0.5 + row) - this.spacingY * (row) - this.paddingTop;
        const pos = math.v2(0, y);
        if (this._scrollView) {
            this._scrollView.scrollToOffset(pos, sec || 0);
        }

        if (this.useVirtualLayout) {
            if (this._content) {
                this._content.destroyAllChildren();
            }
            let startIndex = itemIndex - col;
            this._createFixedIncrementItems(startIndex);
        }
    }

    /**
     * 停止自动滚动
     */
    public stopAutoScroll() {
        if (this._scrollView == null) {
            return;
        }

        if (!this._scrollView.isAutoScrolling()) return;

        this._scrollView.stopAutoScroll();
    }

    /**
     * 获取item在scrView上的位置
     * @param {Node} item 显示单元
     * @returns {math.Vec2 | math.Vec3} 显示单元位置
     */
    public getPositionInView(item: Node): math.Vec2 | math.Vec3 {
        const worldPos = item.parent.getComponent(UITransform).convertToWorldSpaceAR(item.position);
        return this._scrollView.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
    }

    /**
     * 获取当前Y轴偏移量整数
     * @returns {Number}
     */
    public getScrollOffsetY(): number {
        return Math.floor(this._scrollView.getScrollOffset().y);
    }

    /**
     * 清空列表
     */
    public clearList() {
        this._dataList = null;
        this._disposeItems();
        this.createItemsDisplayList();
    }

    /**
     * 清理回收所有显示单元
     */
    protected _disposeItems() {
        isValid(this._content) && this._scrollView.content.destroyAllChildren();
        this._items = null;
    }

    protected _onScrolling() {

    }

    /**
     * 回收
     */
    protected onDestroy() {
        if (this.useVirtualLayout) {
            this.node.off('scrolling', this._onScrolling, this);
        }

        this._scrollToBottomHandler = null;
        this._scrollToBottomThisObj = null;

        this._selectOneItemHandler = null;
        this._selectOneItemThisObj = null;

        this._disposeItems();
        this._dataList = null;

        this._imageCache.clear();
    }
}
