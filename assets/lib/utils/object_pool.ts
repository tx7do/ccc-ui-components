import {error, isValid} from "cc";

/**
 * 对象创建器
 */
export interface IObjectCreator<T> {
    /**
     * 创建对象
     */
    create(...params: any[]): Promise<T>

    /**
     * 销毁对象
     */
    destroy(obj: T): void
}

/**
 * 对象池
 */
export default class ObjectPool<T> {
    private _activeList: Array<T>; // 已取对象列表
    private _reserveList: Array<T>; // 以分配未使用对象列表

    private _creator: IObjectCreator<T>; // 对象创建器

    public get actives() {
        return this._activeList;
    }

    /**
     * 获取活跃对象数
     */
    public get activeCount(): number {
        return this._activeList.length;
    }

    /**
     * 获取待机对象数
     */
    public get reservedCount(): number {
        return this._reserveList.length;
    }

    /**
     * 获取创建器
     */
    public get creator(): IObjectCreator<T> {
        return this._creator;
    }

    /**
     * 注册创建器
     */
    protected set creator(creator: IObjectCreator<T>) {
        this._creator = creator;
    }

    protected constructor(reserve: number = 0) {
        this._activeList = new Array<T>();
        this._reserveList = new Array<T>();
        this.initializeReserve(reserve).then();
    }

    /**
     * 初始化对象池
     */
    private async initializeReserve(reserve: number) {
        for (let i = 0; i < reserve; i++) {
            const gameObject = await this._creator.create();
            this._reserveList.push(gameObject);
        }
    }

    /**
     * 获取获取池中的对象
     */
    public async getObject(...params: any): Promise<T> {
        let obj: T;

        if (this.reservedCount == 0) {
            obj = await this._creator.create(...params);
        } else {
            obj = this._reserveList.pop();
        }

        this._activeList.push(obj);

        return obj;
    }

    /**
     * 归还对象
     */
    public returnObject(obj: T) {
        const index: number = this._activeList.indexOf(obj);
        if (index < 0) {
            error('return object failed:', obj, index);
            return;
        }

        this._activeList.splice(index, 1);

        this._creator.destroy(obj);
        if (isValid(obj)) {
            this._reserveList.push(obj);
        }
    }

    // 归还所有的对象
    public returnAllObject() {
        for (const obj of this._activeList) {
            this._creator.destroy(obj);
            if (isValid(obj)) {
                this._reserveList.push(obj);
            }
        }
        this._activeList = [];
    }

    // 销毁掉所有的对象
    public destroyAllObject() {
        for (const obj of this._activeList) {
            this._creator.destroy(obj);
        }
        for (const obj of this._reserveList) {
            this._creator.destroy(obj);
        }
        this._reserveList = [];
        this._activeList = [];
    }
}
