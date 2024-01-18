/**
 * 单体模板类
 * @constructor
 */
export function Singleton<T>() {
    class TSingleton {
        private static _instance: TSingleton = null;

        public static get instance(): T {
            if (TSingleton._instance == null) {
                TSingleton._instance = new this();
            }
            return TSingleton._instance as T;
        }

        protected constructor() {
        }
    }

    return TSingleton;
}
