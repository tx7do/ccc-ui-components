import {_decorator, Graphics, Color, UITransform, Component} from "cc";
import {QRCode} from './_qrcode';

const {ccclass, property, menu} = _decorator;
/**
 * 二维码组件
 */
@ccclass("QRCodeComponent")
@menu("UI组件/QRCodeComponent")
export default class QRCodeComponent extends Component {

    protected get graphics() {
        let comp = this.getComponent(Graphics);
        if (comp) {
            return comp;
        }
        return this.addComponent(Graphics)!;
    }

    @property
    protected _str: string = "Hello World!"

    @property({displayName: "内容", tooltip: "内容"})
    get string() {
        return this._str;
    }

    set string(v) {
        if (this._str == v) {
            return;
        }
        this._str = v;

        this.generate();
    }

    @property
    protected _backColor = new Color(Color.WHITE);

    @property({displayName: "背景颜色", tooltip: "设置背景颜色"})
    get backColor() {
        return this._backColor;
    }

    set backColor(v) {
        if (this._backColor.equals(v)) {
            return;
        }
        this._backColor = v;
        this.generate();
    }

    @property
    protected _foreColor = new Color(Color.BLACK);

    @property({displayName: "前景颜色", tooltip: "设置前景颜色"})
    get foreColor() {
        return this._foreColor;
    }

    set foreColor(v) {
        if (this._foreColor.equals(v)) {
            return;
        }
        this._foreColor = v;
        this.generate();
    }

    @property
    protected _margin = 10;

    @property({displayName: '边距', tooltip: "边距"})
    get margin() {
        return this._margin;
    }

    set margin(v) {
        if (this._margin == v) {
            return;
        }
        this._margin = v;
        this.generate();
    }

    @property
    protected _size = 200;
    @property({displayName: "大小", tooltip: "大小"})
    get size() {
        return this._size;
    }

    set size(v) {
        if (this._size == v) {
            return;
        }
        this._size = v;
        this.node.getComponent(UITransform)?.setContentSize(v, v);
        this.generate();
    }

    onLoad() {
        this.node.getComponent(UITransform)?.setContentSize(this._size, this._size);
        this.generate();
    }

    resetInEditor(): void {
        this.node.getComponent(UITransform)?.setContentSize(this._size, this._size);
        this.generate();
    }

    /**
     * 使用完整的参数生成二维码
     * @param url 目标链接
     * @param size 生成大小
     * @param margin 边距
     * @param foreColor 前景颜色
     * @param backColor 背景颜色
     */
    generateWithParams(url: string, size: number = 200, margin: number = 10, foreColor: Color = Color.BLACK, backColor: Color = Color.WHITE) {
        this._str = url;

        this._size = size;
        this._margin = margin;

        this._foreColor = foreColor;
        this._backColor = backColor;

        this.generate();
    }

    /**
     * 生成二维码
     */
    generate() {
        const graphics = this.graphics;
        graphics.clear();

        let tran = this.node.getComponent(UITransform)!;

        //背景色
        graphics.fillColor = this.backColor;
        let width = tran.width;
        let offsetX = -width * tran.anchorX;
        let offsetY = -width * tran.anchorY;
        graphics.rect(offsetX, offsetY, width, width);
        graphics.fill();
        graphics.close();

        //生成二维码数据
        let qrcode = new QRCode(-1, 2);
        qrcode.addData(this.string);
        qrcode.make();
        graphics.fillColor = this.foreColor;
        let size = width - this.margin * 2;
        let num = qrcode.getModuleCount();

        let tileW = size / num;
        let tileH = size / num;
        let w = Math.ceil(tileW);
        let h = Math.ceil(tileH);
        for (let row = 0; row < num; row++) {
            for (let col = 0; col < num; col++) {
                if (qrcode.isDark(row, col)) {
                    graphics.rect(offsetX + this.margin + col * tileW, offsetX + size - tileH - Math.round(row * tileH) + this.margin, w, h);
                    graphics.fill();
                }
            }
        }
    }
};
