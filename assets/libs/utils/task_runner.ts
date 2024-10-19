/**
 * 任务
 */
type Task<T> = {
    name?: string;
    fn: () => Promise<T>;
};

/**
 * 默认的队列限制数量
 */
const defaultQueueLimit: number = 5;

/**
 * 任务运行器
 */
export class TaskRunner {
    private _queue: Task<any>[] = [];
    private _activeTaskNum: number = 0;

    constructor(private limit = defaultQueueLimit, public debug = false) {
        if (limit < 1) {
            throw new Error("limit must be integer greater then 1");
        }
    }

    /**
     * 添加任务
     * @param task
     */
    public async addTask<T>(task: Task<T>) {
        task.name ? task.name : task.fn.name || this._queue.length || "";
        this._queue.push(task);
        await this.runTask();
    }

    private async execute<T>(task: Task<T>) {
        this.log(`running ${task.name}`);
        try {
            try {
                const result = await task
                    .fn();
                this.log(`task ${task.name} finished`);
                return result;
            } catch (error) {
                this.log(`${task.name} failed`);
                throw error;
            }
        } finally {
            this._activeTaskNum--;
            await this.runTask();
        }
    }

    /**
     * 运行任务
     * @private
     */
    private async runTask() {
        while (this._activeTaskNum < this.limit && this._queue.length > 0) {
            const task = this._queue.shift();
            this._activeTaskNum++;
            await this.execute(task!);
        }
    }

    /**
     * 记录日志
     * @param msg
     * @private
     */
    private log(msg: string) {
        if (this.debug) {
            console.info(`[TaskRunner] ${msg}`);
        }
    }
}
