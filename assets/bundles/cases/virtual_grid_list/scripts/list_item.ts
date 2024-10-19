import {_decorator, Label, Sprite, math, SpriteFrame} from 'cc';

import {IVirtualGridListItem} from "db://assets/libs/components/virtual_grid_list/interface";

const {ccclass, property} = _decorator;

@ccclass('list_item')
export class ListItem extends IVirtualGridListItem {
    @property(Sprite)
    imgItem: Sprite = null;

    @property(Label)
    labelItemName: Label = null;

    @property(Label)
    labelDate: Label = null;

    updateSelectionStatus() {
        if (true === this.data.select) {
            this.node.getComponent(Sprite).color = math.color(52, 217, 235);
        } else {
            this.node.getComponent(Sprite).color = math.color(255, 255, 255);
        }
    }

    _showImg(spriteFrame: SpriteFrame, uri: string) {
        if (this.data && spriteFrame && uri.replace('_gray', '') == this.data.pic) {
            this.imgItem.getComponent(Sprite).spriteFrame = spriteFrame;
            // this.imgItem.node.getComponent(Sprite).color.a = 255;
        }
    }

    protected onDestroy() {
        super.onDestroy();
        // this.node.targetOff();
    }

    /**
     * 点击触发选择事件
     */
    public onSelect() {
        console.log('select _' + this.itemIndex);

        this.updateSelectionStatus();
    }

    public onUnselect() {
        console.log('unselect _' + this.itemIndex);

        this.updateSelectionStatus();
    }

    public async onDataChanged() {
        const data = this.data;
        await this.loadImage(data.pic, this._showImg.bind(this), 'virtual_grid_list');
        this.labelItemName.string = data.name;
        this.labelDate.string = data.date;

        this.updateSelectionStatus();
    }

    public onEnter(): void {
    }

    public onLeave(): void {
    }
}
