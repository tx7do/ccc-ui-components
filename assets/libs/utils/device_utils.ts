import {view} from "cc";

/**
 * @description 设备工具类
 */
class DeviceUtils {
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

}
