import {isObject, isString} from "lodash-es";

import {Recordable} from "db://assets/libs/types/global";

export class DateTimeUtils {
    static DATE_TIME_FORMAT: string = 'YYYY-MM-DD HH:mm:ss';

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

    public static joinTimestamp<T extends boolean>(
        join: boolean,
        restful: T,
    ): T extends true ? string : object;

    public static joinTimestamp(join: boolean, restful = false): string | object {
        if (!join) {
            return restful ? '' : {};
        }
        const now = new Date().getTime();
        if (restful) {
            return `?_t=${now}`;
        }
        return {_t: now};
    }

    /**
     * @description: Format request parameter time
     */
    public static formatRequestDate(params: Recordable) {
        if (Object.prototype.toString.call(params) !== '[object Object]') {
            return;
        }

        for (const key in params) {
            const format = params[key]?.format ?? null;
            if (format && typeof format === 'function') {
                params[key] = params[key].format(DateTimeUtils.DATE_TIME_FORMAT);
            }
            if (isString(key)) {
                const value = params[key];
                if (value) {
                    try {
                        params[key] = isString(value) ? value.trim() : value;
                    } catch (error: any) {
                        throw new Error(error);
                    }
                }
            }
            if (isObject(params[key])) {
                DateTimeUtils.formatRequestDate(params[key]);
            }
        }
    }
}
