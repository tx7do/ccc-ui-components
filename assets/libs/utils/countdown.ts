import {Component, log} from 'cc';

/**
 * 倒计时定时器
 */
export abstract class Countdown extends Component {
    private _countTime: number = 0;
    private _startCountTime: number = 0;
    private _pause: boolean = false;

    get getStartCountTime(): number {
        return this._startCountTime;
    }

    get getCountTime(): number {
        return this._countTime;
    }

    /**
     * 设置倒计时时间
     * @param countTime
     */
    public setCountDownTime(countTime: number) {
        this._countTime = countTime;
        this._startCountTime = countTime;
        this.updateCountDownTime();
    }

    /**
     * 启动倒计时
     * @param countTime
     */
    public startCountDown(countTime: number) {
        this.setCountDownTime(countTime);

        this._pause = false;

        // log(this.countTime, getCurrentTime())

        this.schedule(this.handleSchedule, 1, countTime - 1, 1);
    }

    /**
     * 暂停定时器
     */
    public pauseCountDown() {
        this._pause = true;
        this.unschedule(this.handleSchedule);
    }

    /**
     * 恢复定时器
     */
    public resumeCountDown() {
        if (this._pause == false) {
            return;
        }
        this._pause = false;
        this.schedule(this.handleSchedule, 1, this._countTime - 1, 1);
    }

    /**
     * 停止定时器
     */
    public stopCountDown() {
        this._pause = false;
        this.unschedule(this.handleSchedule);
    }

    /**
     * 定时器调度回调
     * @private
     */
    private handleSchedule() {
        --this._countTime;
        if (this._countTime < 0) {
            this._countTime = 0;
        }

        // log(this.countTime, getCurrentTime());

        this.updateCountDownTime();

        if (this._countTime <= 0) {
            this.handleTimeout();
        }
    }

    /**
     * 更新倒计时时间
     * @protected
     */
    protected abstract updateCountDownTime(): void;

    /**
     * 定时器到期回调
     * @protected
     */
    protected abstract handleTimeout(): void;
}
