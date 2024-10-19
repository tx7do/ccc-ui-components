import {Asset, resources} from "cc";

/**
 * @description 资源工具类
 */
export class ResourceUtils {
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
}
