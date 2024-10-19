import {sys} from "cc";

/**
 * 平台工具类
 */
export class PlatformUtils {
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
