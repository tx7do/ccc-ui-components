import { sys, view } from "cc";

export default class Platform {
    /**
     * @description 是否是平板的屏幕，仅根据屏幕高宽比判断，不适合用于确定是否真的平板
     */
    public static isPadScreen(): boolean {
        let screenWidth = view.getVisibleSize().width;
        let screenHeight = view.getVisibleSize().height;
        let ratio = 1.69;
        return !(screenWidth > screenHeight && screenWidth >= ratio * screenHeight)
            && !(screenHeight > screenWidth && screenHeight >= ratio * screenWidth);
    }

    /**
     * 是否浏览器
     */
    public static isBrowser(): boolean {
        return sys.isBrowser;
    }

    /**
     * 是否移动端
     */
    public static isMobile(): boolean {
        return sys.isMobile;
    }

    /**
     * 是否原生
     */
    public static isNative(): boolean {
        return sys.isNative;
    }

    /**
     * 是否安卓
     */
    public static isAndroid(): boolean {
        return sys.isNative && sys.os == sys.OS.ANDROID;
    }

    /**
     * 是否苹果
     */
    public static isIOS(): boolean {
        return sys.isNative && sys.os == sys.OS.IOS;
    }

    /**
     * 是否微信小游戏
     */
    public static isWxGame(): boolean {
        return sys.platform === sys.Platform.WECHAT_GAME;
    }

    /**
     * 是否抖音小游戏
     */
    public static isDyGame(): boolean {
        return sys.platform === sys.Platform.BYTEDANCE_MINI_GAME;
    }
}
