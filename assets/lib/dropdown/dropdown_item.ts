import {
    _decorator,
    Component,
    Label,
    Sprite,
    Toggle
} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('DropDownItem')
export default class DropDownItem extends Component {
    @property(Label)
    public label: Label = null;

    @property(Sprite)
    public sprite: Sprite = null;

    @property(Toggle)
    public toggle: Toggle = null;
}
