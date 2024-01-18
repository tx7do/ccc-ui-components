import {_decorator, Component, Label, Prefab} from 'cc';
import {VirtualGridList} from "db://assets/lib/virtual_grid_list/virtual_grid_list";

const {ccclass, property} = _decorator;

interface DataItem {
    pic: string;
    date: string;
    name: string;
}

@ccclass('virtual_grid_list')
export class VirtualGridListScene extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(VirtualGridList)
    protected gridList: VirtualGridList = null;

    @property(Label)
    protected lbSelectOne: Label = null;

    @property(Label)
    protected labelChangeColumn: Label = null;

    private _dataList: any[] = [];
    private _pageNo: number = 1;
    private _currentColumn: number = 0;

    start() {
        this.initGridList();
        this.showList(this._pageNo);
    }

    /**
     * 初始化
     */
    initGridList() {
        this._pageNo = 1;
        this._dataList = [];

        console.log('initGridList', this.gridList);

        if (this.gridList) {
            this.gridList.initGridList(this.itemPrefab, 'list_item', {
                paddingTop: 10,
                paddingBottom: 100,
                spacingY: 5,
                emptyTip: '什么也没有啊',
                columnNum: 0,
                useVirtualLayout: true
            });
            this.gridList.registerScrollToBottomEventHandler(this._nextPage, this);
            this.gridList.registerSelectOneItemEventHandler(this._onSelectOneItem, this);
        }
    }

    protected showList(pageNo: number, itemCount?: number) {
        itemCount = itemCount || 29;

        let list = [];
        let total = pageNo * itemCount;
        let picIndex = 0;
        for (let i = (pageNo - 1) * itemCount + 1; i <= total; i++) {
            picIndex++;
            const item: DataItem = {
                pic: "cases/virtual_grid_list/avatar/avatar_" + picIndex,
                date: "3/9 12:00",
                name: i + '_测试邮件 士大夫撒快递费就爱上了肯德基发收款单飞机萨克的积分'
            }
            list.push(item);
        }
        this._dataList = this._dataList ? this._dataList.concat(list) : list;

        console.log('showList', this.gridList)
        this.gridList.appendItemsToDisplayList(list);
    }

    _nextPage() {
        console.log('next page');
        this.scheduleOnce(() => {
            this.showList(++this._pageNo);
        }, .5)
    }

    _onSelectOneItem(data: any) {
        this.lbSelectOne.string = JSON.stringify(data);
    }

    onBtnScrollToTop_Tap() {
        if (!this.gridList.isTop()) {
            this.gridList.scrollToTop();
        }
    }

    onBtnShowList_Tap() {
        this._pageNo = 1;
        this._dataList = [];
        this.showList(this._pageNo);
    }

    onBtnRefresh_Tap() {
        this.gridList.refreshItemDisplays();
    }

    onBtnClear_Tap() {
        this.gridList.clearList();
    }

    onBtnChangeColumn_Tap() {
        let column = this._currentColumn + 1;
        if (column > 2) {
            column = 0;
        }
        if (column === 2) {
            this.labelChangeColumn.string = `自适应列数`
        } else {
            this.labelChangeColumn.string = `显示${column + 1}列`
        }
        this._currentColumn = column;
        this.gridList.clearList();
        this.initGridList();
    }

    onBtnUpdateItem_Tap() {
        let list = this._dataList;
        let targetList = [];
        let itemData: DataItem;
        for (let i = 0; i < list.length && i < 5; i++) {
            itemData = list[i];
            let picId = 29 - i;
            itemData.pic = "cases/virtual_grid_list/avatar/avatar_" + picId;
            itemData.name = (i + 1) + '我更新了_' + Math.floor(1000 * Math.random());
            targetList.push(itemData);
        }
        itemData = null;
        list = null;
        this.gridList.refreshItemDisplays(targetList);
        targetList = null;
    }
}
