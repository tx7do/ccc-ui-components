import {log} from "cc";

import {Singleton} from "db://assets/libs/utils/singleton";

export class ClickUtils extends Singleton<ClickUtils>() {
    private clickTime = {};

    /**
     * @description 是否频繁点击
     * @param tag 判断重点的一个id，用于区分不同时机
     * @param duration 少于该时长即认为发生了重复点击（毫秒）
     **/
    public isQuickClick(tag?: string, duration?: number): boolean {
        if (!tag) tag = 'normal';

        if (!this.clickTime) this.clickTime = {};
        if (this.clickTime[tag] == undefined) this.clickTime[tag] = 0;
        let gapTime = new Date().getTime() - this.clickTime[tag];
        if (!duration) duration = 500;
        if (gapTime < duration) {
            log('请勿重复点击');
            return true;
        }
        this.clickTime[tag] = new Date().getTime();
        return false;
    }
}
