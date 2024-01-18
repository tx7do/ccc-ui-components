import {sys, view, resources, Asset, log} from "cc";
import {Singleton} from "db://assets/lib/utils/singleton";

export default class GameUtils extends Singleton<GameUtils>() {
    private static TAG = 'GameSceneManager';

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
            log(GameUtils.TAG, '请勿重复点击');
            return true;
        }
        this.clickTime[tag] = new Date().getTime();
        return false;
    }

    /**
     * @description 同步调用包装
     * @param promise 需要被调用的异步方法
     */
    public static async asyncWrap<T, U = any>(promise: Promise<T>): Promise<[T | null, U | null]> {
        try {
            const data: Awaited<T> = await promise;
            return [data, null];
        } catch (err) {
            return [null, err];
        }
    }

    /**
     * @description 同步加载资源
     * @param {string} url 远程连接
     * @param {Asset} type 资源类型
     */
    public static loadAsync<T extends typeof Asset>(url: string, type: T): Promise<InstanceType<T>> {
        return new Promise<any>((resolve, reject) => {
            resources.load(url, type, (err: Error, res: any) => {
                if (!err) {
                    resolve(res);
                } else {
                    reject('loadAsync url:' + url + ',err:' + err);
                }
            });
        });
    }

    /**
     * @description 快速获取某个数据对象中深层 key 的值
     * @param src 数据对象
     * @param key 要获取值对应的 key，层级通过 # 分割
     */
    public static key4property(src: any, key: any) {
        if (!src) return undefined;
        let keys = key.split('#');
        for (let i = 0, j = keys.length; i < j; i++) {
            src = src[keys[i]];
            if (typeof src == 'object' && src != null) continue;
            if (i < j - 1) return undefined;
        }
        return src;
    }

    /**
     * 不考虑年、月和时间，只计算两个时间点相差了几天
     * @param start 起始时间
     * @param end 终点时间
     */
    public static dayDiff(start: Date, end: Date) {
        return Math.floor((end.getTime() - start.getTime()) / 86400000);
    }

    /**
     * 是否是今天
     * @param date
     */
    public static isToday(date: Date) {
        const now = new Date();
        return (now.getFullYear() === date.getFullYear())
            && (now.getMonth() === date.getMonth())
            && (now.getDate() === date.getDate());
    }
}

export class MapUtils {
    public static replacer(_: any, value: any) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else {
            return value;
        }
    }

    public static reviver(_: any, value: any) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }
}
