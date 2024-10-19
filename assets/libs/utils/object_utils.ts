import {intersectionWith, isArray, isEqual, isObject, mergeWith, unionWith} from "lodash-es";

/**
 * @description: Object operation tool class
 */
export class ObjectUtils {
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

    public static deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
        source: T,
        target: U,
        mergeArrays: 'union' | 'intersection' | 'concat' | 'replace' = 'replace',
    ): T & U {
        if (!target) {
            return source as T & U;
        }
        if (!source) {
            return target as T & U;
        }
        return mergeWith({}, source, target, (sourceValue, targetValue) => {
            if (isArray(targetValue) && isArray(sourceValue)) {
                switch (mergeArrays) {
                    case 'union':
                        return unionWith(sourceValue, targetValue, isEqual);
                    case 'intersection':
                        return intersectionWith(sourceValue, targetValue, isEqual);
                    case 'concat':
                        return sourceValue.concat(targetValue);
                    case 'replace':
                        return targetValue;
                    default:
                        throw new Error(`Unknown merge array strategy: ${mergeArrays as string}`);
                }
            }
            if (isObject(targetValue) && isObject(sourceValue)) {
                return ObjectUtils.deepMerge(sourceValue, targetValue, mergeArrays);
            }
            return undefined;
        });
    }
}
