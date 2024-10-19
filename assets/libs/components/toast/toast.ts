import {
    _decorator,
    Component,
    Node,
    Label,
    isValid,
    director,
    instantiate,
    error,
    log,
    view,
    tween,
    math,
    UITransform,
    Prefab
} from 'cc';

import {resLoader} from "db://assets/libs/utils/res/res_loader";


const {ccclass, property} = _decorator;

export interface ShowOption {
    duration?: number;
    icon?: string;
}

@ccclass('toast')
export default class Toast extends Component {
    @property(Label)
    private content: Label = null;

    private static toastNode: Node = null;
    private static isInstantiating: boolean = false; // 是否正在实例化prefab

    private dismissing = false;
    private leftTime = 2;

    /**
     * @description 展示 toast
     * @param text toast 中的文本内容
     * @param options 其他展示选项，包含以下内容：
     * duration：toast 停留时间
     * icon：toast 图标
     */
    public static async show(text: string, options?: ShowOption) {
        log('Toast.show()');

        if (!options) {
            options = {};
        }

        if (!isValid(Toast.toastNode) && !Toast.isInstantiating) {
            Toast.isInstantiating = true;

            let [prefab, err] = await resLoader.asyncLoad<Prefab>('libs', 'components/toast/prefabs/toast', Prefab);
            if (err) {
                error('load loading logo sprite frame failed, err:' + err);
                return false;
            }

            if (err) {
                error('load toast prefab failed, err:' + err);
                return false;
            }

            Toast.isInstantiating = false;
            Toast.toastNode = instantiate(prefab);

            let scene = director.getScene().getChildByName("Canvas");
            scene.addChild(Toast.toastNode);

            Toast.toastNode.setSiblingIndex(99999);

            let toast = Toast.toastNode.getComponent(Toast);
            if (!toast) {
                error('Toast, CRITICAL: toast script is not attached!');
                return;
            }

            if (options.duration) {
                toast.leftTime = options.duration;
            }
            toast.setContent(text);
            toast.display();

        } else if (isValid(Toast.toastNode)) {
            let toast = Toast.toastNode.getComponent(Toast);
            if (toast.dismissing) {
                // 已有Toast正在关闭，则先干掉原来的Toast，重新展示一个新的
                // Toast.toastNode.stopAllActions();
                if (isValid(Toast.toastNode)) Toast.toastNode.destroy();
                Toast.toastNode = null;
                await this.show(text, options);
                return;
            }
            if (options.duration) {
                toast.leftTime = options.duration;
            }
            toast.setContent(text);
            toast.scheduleDismiss();
        }
    }

    private setContent(text: string) {
        if (!isValid(this.node)) {
            return;
        }

        if (text) {
            this.content.string = text;
        }
    }

    private display() {
        log('Toast.display()');

        this.node.setPosition(0, (view.getVisibleSize().height / 2) + this.node.getComponent(UITransform).height);

        tween(this.node)
            .by(0.5, {position: math.v3(0, -190, 0)})
            .call(function () {
                this.scheduleDismiss();
            }.bind(this))
            .start();
    }

    private dismiss() {
        if (this.dismissing) return;
        this.dismissing = true;

        log('Toast.dismiss()');

        tween(this.node)
            .by(0.5, {position: math.v3(0, 170, 0)})
            .call(function () {
                if (!isValid(this.node)) {
                    return;
                }
                this.dismissing = false;
                this.node.destroy();
                Toast.toastNode = null;
            }.bind(this))
            .start();
    }

    private scheduleDismiss() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            if (isValid(this.node)) {
                this.dismiss();
            }
        }, this.leftTime);
    }
}
