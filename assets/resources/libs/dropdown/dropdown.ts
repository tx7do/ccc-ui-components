import {
    _decorator,
    Component,
    error,
    instantiate,
    js,
    Label,
    Toggle,
    Node,
    Sprite,
    UITransform
} from 'cc';

import DropDownOptionData from "db://assets/resources/libs/dropdown/dropdown_option_data";
import DropDownItem from "db://assets/resources/libs/dropdown/dropdown_item";
import Maths from "db://assets/resources/libs/utils/maths";

const {ccclass, property} = _decorator;

@ccclass('DropDown')
export default class DropDown extends Component {
    @property(Node)
    private template: Node = null;

    @property(Label)
    private labelCaption: Label = null;

    @property(Sprite)
    private spriteCaption: Sprite = null;

    @property(Label)
    private labelItem: Label = null;

    @property(Sprite)
    private spriteItem: Sprite = null;

    @property([DropDownOptionData])
    private optionDatas: DropDownOptionData[] = [];

    private _dropDown: Node;
    private _validTemplate: boolean = false;
    private _items: DropDownItem[] = [];
    private _isShow: boolean = false;
    private _selectedIndex: number = -1;

    private get selectedIndex(): number {
        return this._selectedIndex;
    }

    private set selectedIndex(value: number) {
        this._selectedIndex = value;
        this.refreshShownValue();
    }

    public addOptionDatas(optionDatas: DropDownOptionData[]) {
        optionDatas && optionDatas.forEach(data => {
            this.optionDatas.push(data);
        });
        this.refreshShownValue();
    }

    public clearOptionDatas() {
        js.clear(this.optionDatas);
        this.refreshShownValue();
    }

    public show() {
        if (!this._validTemplate) {
            this.setUpTemplate();
            if (!this._validTemplate) {
                return;
            }
        }
        this._isShow = true;

        this._dropDown = this.createDropDownList(this.template);
        this._dropDown.name = "DropDown List";
        this._dropDown.active = true;
        this._dropDown.setParent(this.template.parent);

        let itemTemplate = this._dropDown.getComponentInChildren<DropDownItem>(DropDownItem);
        let content = itemTemplate.node.parent;
        itemTemplate.node.active = true;

        js.clear(this._items);

        for (let i = 0, len = this.optionDatas.length; i < len; i++) {
            let data = this.optionDatas[i];
            let item: DropDownItem = this.addItem(data, i == this.selectedIndex, itemTemplate, this._items);
            if (!item) {
                continue;
            }
            item.toggle.isChecked = i == this.selectedIndex;
            item.toggle.node.on("toggle", this.onSelectedItem, this);
            // if(i == this.selectedIndex){
            //     this.onSelectedItem(item.toggle);
            // }
        }
        itemTemplate.node.active = false;

        content.getComponent(UITransform).height = itemTemplate.node.getComponent(UITransform).height * this.optionDatas.length;
    }

    private addItem(data: DropDownOptionData, selected: boolean, itemTemplate: DropDownItem, dropDownItems: DropDownItem[]): DropDownItem {
        let item = this.createItem(itemTemplate);
        item.node.setParent(itemTemplate.node.parent);
        item.node.active = true;
        item.node.name = `item_${this._items.length + data.optionString ? data.optionString : ""}`;
        if (item.toggle) {
            item.toggle.isChecked = false;
        }
        if (item.label) {
            item.label.string = data.optionString;
        }
        if (item.sprite) {
            item.sprite.spriteFrame = data.optionSf;
            item.sprite.enabled = data.optionSf != null;
        }
        this._items.push(item);
        return item;
    }

    public hide() {
        this._isShow = false;
        if (this._dropDown != null) {
            this.delayedDestroyDropdownList(0.15);
        }
    }

    private async delayedDestroyDropdownList(delay: number) {
        // await WaitUtil.waitForSeconds(delay);
        // wait delay;
        for (let i = 0, len = this._items.length; i < len; i++) {
            if (this._items[i] != null)
                this.destroyItem(this._items[i]);
        }
        js.clear(this._items);
        if (this._dropDown != null) {
            this.destroyDropDownList(this._dropDown);
        }
        this._dropDown = null;
    }

    private destroyItem(item: any) {

    }

    // 设置模板，方便后面item
    private setUpTemplate() {
        this._validTemplate = false;

        if (!this.template) {
            error("The dropdown template is not assigned. The template needs to be assigned and must have a child GameObject with a Toggle component serving as the item");
            return;
        }
        this.template.active = true;
        let itemToggle: Toggle = this.template.getComponentInChildren<Toggle>(Toggle);
        this._validTemplate = true;
        // 一些判断
        if (!itemToggle || itemToggle.node == this.template) {
            this._validTemplate = false;
            error("The dropdown template is not valid. The template must have a child Node with a Toggle component serving as the item.");
        } else if (this.labelItem != null && !this.labelItem.node.isChildOf(itemToggle.node)) {
            this._validTemplate = false;
            error("The dropdown template is not valid. The Item Label must be on the item Node or children of it.");
        } else if (this.spriteItem != null && !this.spriteItem.node.isChildOf(itemToggle.node)) {
            this._validTemplate = false;
            error("The dropdown template is not valid. The Item Sprite must be on the item Node or children of it.");
        }

        if (!this._validTemplate) {
            this.template.active = false;
            return;
        }
        let item = itemToggle.node.addComponent<DropDownItem>(DropDownItem);
        item.label = this.labelItem;
        item.sprite = this.spriteItem;
        item.toggle = itemToggle;
        item.node = itemToggle.node;

        this.template.active = false;
        this._validTemplate = true;
    }

    // 刷新显示的选中信息
    private refreshShownValue() {
        if (this.optionDatas.length <= 0) {
            return;
        }
        let data = this.optionDatas[Maths.clamp(this.selectedIndex, 0, this.optionDatas.length - 1)];
        if (this.labelCaption) {
            if (data && data.optionString) {
                this.labelCaption.string = data.optionString;
            } else {
                this.labelCaption.string = "";
            }
        }
        if (this.spriteCaption) {
            if (data && data.optionSf) {
                this.spriteCaption.spriteFrame = data.optionSf;
            } else {
                this.spriteCaption.spriteFrame = null;
            }
            this.spriteCaption.enabled = this.spriteCaption.spriteFrame != null;
        }
    }

    protected createDropDownList(template: Node): Node {
        return instantiate(template);
    }

    protected destroyDropDownList(dropDownList: Node) {
        dropDownList.destroy();
    }

    protected createItem(itemTemplate: DropDownItem): DropDownItem {
        let newItem = instantiate(itemTemplate.node);
        return newItem.getComponent<DropDownItem>(DropDownItem);
    }

    /** 当toggle被选中 */
    private onSelectedItem(toggle: Toggle) {
        let parent = toggle.node.parent;
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i] == toggle.node) {
                // Subtract one to account for template child.
                this.selectedIndex = i - 1;
                break;
            }
        }
        this.hide();
    }


    protected start() {
        this.template.active = false;
        this.refreshShownValue();
    }

    protected onEnable() {
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    protected onDisable() {
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
    }

    private onClick() {
        if (!this._isShow) {
            this.show();
        } else {
            this.hide();
        }
    }
}
