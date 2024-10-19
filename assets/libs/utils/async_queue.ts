export type NextFunction = (nextArgs?: any) => Promise<void>;

/**
 * 异步回调方法类型
 */
export type AsyncCallback = (
    next: NextFunction,
    params: any,
    args: any
) => Promise<void>;

interface AsyncTask {
    /**
     * 任务uuid
     */
    uuid: number;

    /**
     * 任务开始执行的回调
     * params: push时传入的参数
     * args: 上个任务传来的参数
     */
    callbacks: Array<AsyncCallback>;

    /**
     * 任务参数
     */
    params: any;
}


/**
 * 异步队列
 *
 * @example
 * const queue = new AsyncQueue();
 *
 * queue.push((next, params) => {
 *   console.log("执行任务 1");
 *   // 模拟异步操作
 *   setTimeout(() => {
 *     console.log("任务 1 完成");
 *     next();
 *   }, 1000);
 * });
 *
 * queue.push((next, params) => {
 *   console.log("执行任务 2");
 *   setTimeout(() => {
 *     console.log("任务 2 完成");
 *     next();
 *   }, 1000);
 * });
 *
 * queue.complete = () => console.log("所有任务执行完毕");
 *
 * queue.execute();
 *
 */
export class AsyncQueue {
    private static _$uuid_count: number = 1;

    private _enable: boolean = true;

    private _runningAsyncTask: AsyncTask | null = null;
    private _processingTaskUUID: number = 0;

    private _queues: Array<AsyncTask> = [];

    /**
     * 任务队列完成回调
     */
    public _complete: Function | null = null;

    public get queues(): Array<AsyncTask> {
        return this._queues;
    }

    public get complete(): Function | null {
        return this._complete;
    }

    public set complete(fnc: Function | null) {
        this._complete = fnc;
    }

    public get enable(): boolean {
        return this._enable;
    }

    public set enable(enable: boolean) {
        this._enable = enable;
    }

    /**
     * 是否有正在处理的任务
     */
    public get isProcessing(): boolean {
        return this._processingTaskUUID > 0;
    }

    constructor() {
    }

    /**
     * 加入单个异步任务到队列中
     * @return 任务uuid
     */
    public async push(callback: AsyncCallback, params: any = null): Promise<number> {
        const uuid = AsyncQueue._$uuid_count++;

        this._queues.push({
            uuid: uuid,
            callbacks: [callback],
            params: params
        });

        await this.execute();

        return uuid;
    }

    /**
     * 加入多个任务，这几个任务将会并行执行
     * @return 任务uuid
     */
    public async append(params: any, ...callbacks: AsyncCallback[]): Promise<number> {
        const uuid = AsyncQueue._$uuid_count++;

        this._queues.push({
            uuid: uuid,
            callbacks: callbacks,
            params: params
        });

        await this.execute();

        return uuid;
    }

    /**
     * 移除一个尚未执行的异步任务
     */
    public remove(uuid: number) {
        if (this._runningAsyncTask?.uuid === uuid) {
            console.warn("A running task cannot be removed");
            return;
        }
        for (let i = 0; i < this._queues.length; i++) {
            if (this._queues[i].uuid === uuid) {
                this._queues.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 清空队列
     */
    public clear() {
        this._queues = [];
        this._processingTaskUUID = 0;
        this._runningAsyncTask = null;
    }

    /**
     * 开始运行队列
     */
    public async execute(args: any = null) {
        if (this.isProcessing) {
            return;
        }

        if (!this._enable) {
            return;
        }

        // console.log('================== execute');

        const actionData: AsyncTask = this._queues.shift()!;
        if (actionData == null) {
            this.handleComplete(args);
            return;
        }

        this._runningAsyncTask = actionData;
        const taskUUID: number = actionData.uuid;
        this._processingTaskUUID = taskUUID;
        const callbacks: Array<AsyncCallback> = actionData.callbacks;

        if (callbacks.length === 1) {
            await this.executeSingleCallback(taskUUID, actionData, callbacks[0], args);
        } else {
            await this.executeMultipleCallback(taskUUID, actionData, callbacks, args);
        }
    }

    /**
     * 执行单个回调方法
     * @protected
     */
    protected async executeSingleCallback(
        taskUUID: number,
        actionData: AsyncTask,
        callback: AsyncCallback,
        args: any = null
    ) {
        const nextFunc: NextFunction = async (nextArgs: any = null) => {
            await this.next(taskUUID, nextArgs);
        };
        await callback(nextFunc, actionData.params, args);
    }

    /**
     * 执行多个回调方法
     * @protected
     */
    protected async executeMultipleCallback(
        taskUUID: number,
        actionData: AsyncTask,
        callbacks: Array<AsyncCallback>,
        args: any = null
    ) {
        // 多个任务函数同时执行
        let fnum: number = callbacks.length;
        const nextArgsArr: any[] = [];
        const nextFunc: NextFunction = async (nextArgs: any = null) => {
            --fnum;
            nextArgsArr.push(nextArgs || null);
            if (fnum === 0) {
                await this.next(taskUUID, nextArgsArr);
            }
        };
        const knum = fnum;
        for (let i = 0; i < knum; i++) {
            await callbacks[i](nextFunc, actionData.params, args);
        }
    }

    protected handleComplete(args: any = null) {
        this._processingTaskUUID = 0;
        this._runningAsyncTask = null;
        // console.log("任务完成")
        if (this._complete) {
            this._complete(args);
        }
    }

    protected async next(taskUUID: number, args: any = null) {
        if (this._processingTaskUUID === taskUUID) {
            this._processingTaskUUID = 0;
            this._runningAsyncTask = null;
            await this.execute(args);
        }
    }
}
