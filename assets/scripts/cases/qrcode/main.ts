import {_decorator, Component, EditBox} from 'cc';

import QRCodeComponent from "db://assets/resources/libs/qrcode/qrcode";

const {ccclass, property} = _decorator;

@ccclass('main')
export class main extends Component {
    @property(QRCodeComponent)
    qrCode: QRCodeComponent = null;

    @property(EditBox)
    ebUrl: EditBox = null;

    @property(EditBox)
    ebSize: EditBox = null;

    start() {

    }

    handleButtonGenerate() {
        this.qrCode.generateWithParams(this.ebUrl.string, Number(this.ebSize.string));
    }
}
