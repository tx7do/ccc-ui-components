import {_decorator, Label, Sprite, math, SpriteFrame} from 'cc';
import {IVirtualGridListItem} from "db://assets/lib/virtual_grid_list/interface";

const {ccclass, property} = _decorator;

@ccclass('list_item')
export class ListItem extends IVirtualGridListItem {
    @property(Sprite)
    imgItem: Sprite = null;

    @property(Label)
    labelItemName: Label = null;

    @property(Label)
    labelDate: Label = null;

    /**
     * 点击触发选择事件
     */
    onSelect() {
        console.log('select _' + this.itemIndex);

        this.updateSelectionStatus();
    }

    onUnselect() {
        console.log('unselect _' + this.itemIndex);

        this.updateSelectionStatus();
    }

    onDataChanged() {
        const data = this.data;
        this.imageCache.loadImage(data.pic, this._showImg.bind(this));
        this.labelItemName.getComponent(Label).string = data.name;
        this.labelDate.getComponent(Label).string = data.date;

        this.updateSelectionStatus();
    }

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

    onDestroy() {
        super.onDestroy();
        // this.node.targetOff();
    }
}
