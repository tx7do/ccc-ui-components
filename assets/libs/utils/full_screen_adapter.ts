import {_decorator, Component, ResolutionPolicy, screen, view} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('full_screen_adapter')
export default class FullScreenAdapter extends Component {
    @property({
        tooltip: '等比适配开关',
    })
    protected showAll: boolean = false;  // 等比缩放

    onLoad() {
        this.screenAdapter();

        //监听窗口大小变化时的回调，每次窗口变化都要自动适配
        screen.on('window-resize', () => {
            this.screenAdapter();
        });
    }

    /**
     * Fit Height 模式：适用于宽大于高的屏幕
     * Fit Width 模式：适用于高大于宽的屏幕
     */
    screenAdapter() {
        if (this.showAll) {
            this.setShowAll();
            return;
        }

        const screenRatio = this.computeScreenRatio();
        const designRatio = this.computeDesignRatio();
        const devicePixelRatio = screen.devicePixelRatio;

        if (screenRatio <= 1) {
            // 屏幕高度大于或等于宽度,即竖屏
            if (screenRatio <= designRatio) {
                this.setFitWidth();
            } else {
                // 此时屏幕比例大于设计比例
                // 为了保证纵向的游戏内容不受影响，应该使用 fitHeight 模式
                this.setFitHeight();
            }
        } else {
            // 屏幕宽度大于高度,即横屏
            this.setFitHeight();
        }

        // log('screenAdapter', screenRatio, designRatio, devicePixelRatio, view.getResolutionPolicy());
    }

    /**
     * 当前屏幕分辨率比例
     */
    computeScreenRatio(): number {
        return screen.windowSize.width / screen.windowSize.height;
    }

    /**
     * 设计稿分辨率比例
     */
    computeDesignRatio(): number {
        const ds = view.getDesignResolutionSize();
        return ds.width / ds.height;
    }

    /**
     * 非等比拉伸
     */
    setExactFit() {
        // view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.EXACT_FIT);
        // console.log('EXACT_FIT', view.getDesignResolutionSize().width, view.getDesignResolutionSize().height);
    }

    /**
     * 等比缩放
     */
    setShowAll() {
        // log('setShowAll: ', view.getDesignResolutionSize().width, view.getDesignResolutionSize().height);
        view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.SHOW_ALL);
        // console.log('SHOW_ALL', view.getDesignResolutionSize().width, view.getDesignResolutionSize().height);
    }

    /**
     * 适应宽度
     */
    setFitWidth() {
        // view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
        view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.FIXED_WIDTH);
        // console.log('FIXED_WIDTH', view.getDesignResolutionSize().width, view.getDesignResolutionSize().height);
    }

    /**
     * 适应高度
     */
    setFitHeight() {
        // view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.FIXED_HEIGHT);
        // console.log('FIXED_HEIGHT', view.getDesignResolutionSize().width, view.getDesignResolutionSize().height);
    }
}
