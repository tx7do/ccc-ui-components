import {
    _decorator,
    Component,
    Node,
    math,
    log,
    instantiate,
    Label,
    EventHandler,
    Layout,
    Button,
    Sprite,
    UITransform,
    Enum
} from 'cc';
import {EDITOR} from 'cc/env';

const {ccclass, executeInEditMode, property} = _decorator;

enum PARAM_TYPE {
    NODE_INDEX,
    NODE_NAME
}

@ccclass
@executeInEditMode
export default class TabButtonGroup extends Component {
    private _isAddBtn: boolean = false;

    @property({type: Node})
    defaultTab: Node = null

    @property({type: [Node]})
    _tabsNode: Array<Node> = new Array<Node>(1);

    @property({
        tooltip: 'tab节点',
        type: [Node],
    })
    public set TabsNode(tabArr: Array<Node>) {
        // log("gen init")
        if (tabArr.length < 1) {
            this.TabsNode = new Array<Node>(1);
            return;
        }
        this._tabsNode = tabArr;
        this.generateTabs(tabArr);
        this.updateLayout();
    }

    public get TabsNode(): Array<Node> {
        return this._tabsNode
    }

    @property({})
    _onLabColor: math.Color = math.color(255, 255, 255);

    @property({
        tooltip: 'tab激活时的label的颜色',
    })
    public set OnLabColor(color: math.Color) {
        this._onLabColor = color;
        if (this.defaultTab) {
            this.defaultTab
                .getChildByName("on")
                .getChildByName("label")
                .getComponent(Label)
                .color = this._onLabColor;
        }
    }

    public get OnLabColor(): math.Color {
        return this._onLabColor
    }

    @property(math.Color)
    _offLabColor: math.Color = math.color(235, 181, 255);

    @property({
        tooltip: 'tab未激活时的label的颜色',
    })
    public set OffLabColor(color: math.Color) {
        this._offLabColor = color;
        if (this.defaultTab) {
            this.defaultTab
                .getChildByName("off")
                .getChildByName("label")
                .getComponent(Label)
                .color = this._offLabColor;
        }
    }

    public get OffLabColor(): math.Color {
        return this._offLabColor
    }

    @property({
        type: Enum(PARAM_TYPE),
        tooltip: '节点按钮事件的自定义数据, node_index为节点的的index, node_name为节点名字'
    })
    customData: PARAM_TYPE = PARAM_TYPE.NODE_INDEX;

    @property([EventHandler])
    touchEvents: EventHandler[] = [];


    /**
     * 生成初始化tab
     * @param tabArr tab数量
     */
    private generateTabs(tabArr: Array<Node>) {
        if (EDITOR) {
            //删除已有
            let children = this.node.children.concat()
            for (let i = 0; i < children.length; i++) {
                if (i == 0) {
                    continue;
                }
                if (children[i] != null) {
                    children[i].removeFromParent()
                    children[i].destroy()
                }
            }
            //generate
            for (let i = 0; i < tabArr.length; i++) {
                if (i == 0 && this.node.children.length == 1) {
                    this.TabsNode[i] = this.node.children[i];
                    continue;
                }
                let tab = null;
                if (this.defaultTab && this.node.children.length > 0) {
                    tab = instantiate(this.defaultTab);
                } else {
                    tab = this.generateNewTab(i);
                    this.defaultTab = tab;
                }
                tab.parent = this.node;
                this.TabsNode[i] = tab;
            }
        }
    }

    /**
     * 生成一个新的tab模版
     * @param i 下标
     */
    private generateNewTab(i: number) {
        const tabNode = new Node("tab");

        const onNode = this.generateButtonNode("on", this.OnLabColor);
        const offNode = this.generateButtonNode("off", this.OffLabColor);
        onNode.active = false;

        const tabUiTrans = tabNode.getComponent(UITransform)!;
        if (tabUiTrans) {
            tabUiTrans.setContentSize(math.size(100, 100));
        }

        // 设置zIndex
        offNode.setSiblingIndex(i);
        onNode.setSiblingIndex(i);

        tabNode.addChild(offNode);
        tabNode.addChild(onNode);

        return tabNode;
    }

    private generateButtonNode(name: string, color: math.Color) {
        const root = new Node(name);
        root.addComponent(Sprite);

        const label = this.generateLabel(color);
        root.addChild(label);
        return root;
    }

    private generateLabel(color: math.Color) {
        const labelNode = new Node("label");
        labelNode.addComponent(Label);

        const label = labelNode.getComponent(Label);
        label.string = "TAB Name";
        label.color = color;

        return labelNode;
    }

    /**
     * 根据tab 调整layout大小
     */
    private updateLayout() {
        if (!this.defaultTab) {
            return;
        }

        const layout = this.node.getComponent(Layout);
        const defaultTabUiTrans = this.defaultTab.getComponent(UITransform)!;
        const nodeUiTrans = this.node.getComponent(UITransform)!;

        let w: number, h: number = null;
        if (layout.type == Layout.Type.VERTICAL) {
            h = (defaultTabUiTrans.height + layout.spacingY) * this.TabsNode.length;
            w = defaultTabUiTrans.width;
        } else if (layout.type == Layout.Type.HORIZONTAL) {
            w = (defaultTabUiTrans.width + layout.spacingX) * this.TabsNode.length;
            h = defaultTabUiTrans.height;
        }

        nodeUiTrans.width = w;
        nodeUiTrans.height = h;
    }

    /**
     * 添加button组件
     */
    private addTabButtonComponent() {
        if (this._isAddBtn) {
            return;
        }

        this._isAddBtn = true;
        this.node.children.forEach((node, nodeIndex) => {
            let btnComp = node.getComponent(Button)

            if (btnComp == null) {
                node.addComponent(Button)
                btnComp = node.getComponent(Button);
            }

            // 判断button，将ccButton替换为自定义的UICustomButton
            if (btnComp.getComponent("Button") !== null) {
                const newBtnComp = node.addComponent("Button")
                const newBtn = newBtnComp.getComponent(Button);

                newBtn.transition = btnComp.transition;
                newBtn.zoomScale = btnComp.zoomScale;

                newBtn.disabledSprite = btnComp.disabledSprite;
                newBtn.hoverSprite = btnComp.hoverSprite;
                newBtn.normalSprite = btnComp.normalSprite;
                newBtn.pressedSprite = btnComp.pressedSprite;

                newBtn.hoverColor = btnComp.hoverColor;
                newBtn.normalColor = btnComp.normalColor;
                newBtn.pressedColor = btnComp.pressedColor;
                newBtn.disabledColor = btnComp.disabledColor;

                newBtn.target = btnComp.target

                btnComp = newBtnComp.getComponent(Button)
                node.getComponent(Button).destroy() // 移除老button
            }

            //绑定回调事件
            this.touchEvents.forEach((event: EventHandler) => {
                //克隆数据，每个节点获取的都是不同的回调
                let hd = new EventHandler() //copy对象
                hd.component = event['_componentName']
                hd.handler = event.handler
                hd.target = event.target
                if (this.customData === PARAM_TYPE.NODE_INDEX) {
                    hd.customEventData = nodeIndex.toString()
                } else {
                    hd.customEventData = node.name
                }
                btnComp.clickEvents.push(hd)
            })

        })
    }


    protected onLoad() {
        if (EDITOR) {
            //添加layout
            if (!this.node.getComponent(Layout)) {
                const uiTrans = this.node.getComponent(UITransform)!;

                uiTrans.anchorY = 1;
                log("TabButtonGroup add Layout");
                this.node.addComponent(Layout);
                this.node.getComponent(Layout).type = Layout.Type.VERTICAL;
                uiTrans.anchorY = 1;
                this.updateLayout();
            }
            if (!this.defaultTab || this.TabsNode.length < 1) {
                this.TabsNode = this.TabsNode;
            }
            return;
        }
        this.addTabButtonComponent();
    }


    /**
     * tab状态切换
     * @param index tab下标
     */
    public changeTab(index: number) {
        if (!this._isAddBtn) {
            this.addTabButtonComponent();
        }
        for (let i = 0; i < this.TabsNode.length; i++) {
            this.TabsNode[i].getComponent(Button).interactable = true;
            this.TabsNode[i].getChildByName("on").active = false;
            this.TabsNode[i].getChildByName("off").active = true;
        }
        this.TabsNode[index].getComponent(Button).interactable = false;
        this.TabsNode[index].getChildByName("on").active = true;
        this.TabsNode[index].getChildByName("off").active = false;
    }

    /**
     * 设置默认激活tab
     */
    public initTab(index: number = 1) {
        this.changeTab(index - 1);
    }

    /**
     * 设置tab label string
     * @param list
     */
    public setTabLabel(list: Array<string>) {
        for (let index = 0; index < list.length; index++) {
            const currentTab = this.TabsNode[index];
            if (currentTab) {
                currentTab.active = true;
                currentTab.getChildByName("on").getChildByName("label").getComponent(Label).string = list[index];
                currentTab.getChildByName("off").getChildByName("label").getComponent(Label).string = list[index];
            } else {
                let newTab = instantiate(this.TabsNode[0]);
                newTab.getChildByName("on").getChildByName("label").getComponent(Label).string = list[index];
                newTab.getChildByName("off").getChildByName("label").getComponent(Label).string = list[index];
                let btnComp = newTab.getComponent(Button)
                btnComp.clickEvents[0].customEventData = index.toString();
                this.node.addChild(newTab);
                this.TabsNode.push(newTab);
            }
        }
    }

    public hideAll() {
        for (let i = 0; i < this.TabsNode.length; i++) {
            this.TabsNode[i].active = false;
        }
    }
}
