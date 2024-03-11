import {
    _decorator,
    CCString,
    SpriteFrame
} from 'cc';

const {ccclass, property} = _decorator;

@ccclass("DropDownOptionData")
export default class DropDownOptionData {
    @property(CCString)
    public optionString: string = "";

    @property(SpriteFrame)
    public optionSf: SpriteFrame = null;
}
