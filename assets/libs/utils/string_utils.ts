/**
 * 字符串工具类
 */
export class StringUtils {
    /**
     * 限制字符串的长度，超出部分显示为省略号。
     * @param str
     * @param limitLen
     */
    public static limitString(str: string, limitLen: number): string {
        let b = limitLen;
        let init = 0;
        let newVal = '';

        let totalLen = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                totalLen += 2;
            } else {
                totalLen++;
            }
        }

        for (let i = 0; i < str.length; i++) {
            if (init <= b) {
                newVal += str[i];
                if (str.charCodeAt(i) > 255) {
                    init += 2;
                } else {
                    init++;
                }
            }
        }

        return newVal + (totalLen > b ? '...' : '');
    }

    /**
     * 秒数转为分秒字符串
     * @param second
     */
    public static secondToHMString(second: number): string {
        const h: number = Math.floor(second / 60);
        const s: number = second % 60;
        return h.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    }

    /**
     * Add the object as a parameter to the URL
     * @param baseUrl url
     * @param obj
     * @returns {string}
     * eg:
     *  let obj = {a: '3', b: '4'}
     *  setObjToUrlParams('www.baidu.com', obj)
     *  ==>www.baidu.com?a=3&b=4
     */
    public static setObjToUrlParams(baseUrl: string, obj: any): string {
        let parameters = '';
        for (const key in obj) {
            parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
        }
        parameters = parameters.replace(/&$/, '');
        return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
    }

}
