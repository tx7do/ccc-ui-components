import {log, director} from "cc";
import {Singleton} from "db://assets/lib/utils/singleton";

type SceneData = { [key: string]: any };

interface GameScene {
    sceneName: string;
    isTempScene: boolean;
}

interface BackSceneOption {
    data?: SceneData;
    onSceneLaunched?: Function;
}

interface StartSceneOption extends BackSceneOption {
    startMode?: StartSceneMode;
}

// 启动场景的模式
export enum StartSceneMode {
    STANDARD, // 标准模式：直接压栈
    SINGLE_TOP, // 栈顶模式：如果存在，则清空在其之上的scene，然后压栈；否则直接压栈
    CLEAR_STACK, // 清空栈，再压栈
    TEMPORARY, // 临时场景：返回时会跳过这个场景
}

// 游戏场景管理器
export class GameSceneManager extends Singleton<GameSceneManager>() {
    private static TAG = 'GameSceneManager';

    private _sceneStack: GameScene[] = [];
    private _curSceneName: string;

    private _data: SceneData;

    private _isLoadingScene = false;
    private _countDownTimer: number;
    private _loadSceneTimeout = 10 * 1000;

    protected constructor() {
        super();
    }

    /**
     * SceneManager 初始化
     * 因为游戏默认启动一个场景，所以第一个场景并不是由 SceneManager 启动，所以通过此方法设定默认启动的场景
     * @param initSceneName 第一个场景的场景名
     */
    public init(initSceneName: string) {
        if (this._sceneStack.length == 0 && initSceneName) {
            this._sceneStack.push({sceneName: initSceneName, isTempScene: false});
        }
    }

    /**
     * 获取当前的场景栈
     */
    public get getSceneStack(): GameScene[] {
        return this._sceneStack.slice();
    }

    /**
     * 获取上一个场景传递过来的数据
     */
    public get getSceneData(): SceneData {
        return this._data;
    }

    /**
     * 获取当前场景名
     */
    public get getSceneName(): string {
        return this._curSceneName;
    }

    /**
     * @description 启动一个场景
     * @param sceneName 要启动的场景名称
     * @param options 要传递的数据
     */
    public startScene(sceneName: string, options?: StartSceneOption) {
        if (this._isLoadingScene) {
            log(GameSceneManager.TAG, 'It is loading scene now, skip this invoke.');
            return;
        }

        try {
            if (!sceneName) {
                this._isLoadingScene = false;
                return;
            }

            if (!options) {
                options = {}
            }
            let nameArray = sceneName.split('/');
            sceneName = nameArray[nameArray.length - 1];
            this._isLoadingScene = true;
            this._data = options.data;
            this.doStartScene(sceneName, options.startMode, options.onSceneLaunched);
        } catch (err) {
            this._isLoadingScene = false;
            log(GameSceneManager.TAG, 'startScene err=' + err);
        }
    }

    /**
     * @description 回到上一个场景
     * @param options 需要传递给上一个场景的数据
     */
    public backScene(options?: BackSceneOption): boolean {
        if (this._isLoadingScene) {
            log(GameSceneManager.TAG, 'It is loading back scene now, skip this invoke.');
            return;
        }
        try {
            if (this._sceneStack.length <= 1) {
                log(GameSceneManager.TAG, 'This is last scene.');
                this._isLoadingScene = false;
                return false;
            }

            if (!options) {
                options = {}
            }

            let sceneInfo = this.getBackSceneInfo();
            if (!sceneInfo.sceneName) {
                log(GameSceneManager.TAG, 'backScene failed: sceneName is null');
                return;
            }
            this._isLoadingScene = true;
            this._data = options.data;
            this.doGoBackScene(sceneInfo.sceneName, options.onSceneLaunched);

        } catch (err) {
            log(GameSceneManager.TAG, 'backscene err=' + err);
            this._isLoadingScene = false;
        }
        return true;
    }

    /**
     * @description 获取返回的场景信息
     */
    private getBackSceneInfo(): GameScene {
        let sceneInfo: GameScene;
        for (let i = this._sceneStack.length - 2; i >= 0; i--) {
            sceneInfo = this._sceneStack[i];
            if (!sceneInfo.isTempScene) {
                break;
            }
        }
        return sceneInfo;
    }

    /**
     * @description 开始启动场景，并处理场景栈
     * @param sceneName 场景名
     * @param startMode 启动模式
     * @param onSceneLaunched 场景启动完成后的回调
     */
    private doStartScene(sceneName: string, startMode?: StartSceneMode, onSceneLaunched?: Function) {
        this.countDownLoadScene();
        let isLoadSuccess = director.loadScene(sceneName, (...args: any[]) => {
            this.handleStackByMode(sceneName, startMode);
            this._curSceneName = sceneName;
            this._isLoadingScene = false;
            log(GameSceneManager.TAG, 'loadScene Finish');
            this.cancelCountDownTimer();
            if (onSceneLaunched) {
                onSceneLaunched(...args);
            }
        });
        log(GameSceneManager.TAG, sceneName + ' isLoadSuccess: ' + isLoadSuccess);
        if (!isLoadSuccess) {
            this._isLoadingScene = false;
        }
    }

    /**
     * @description 开始返回场景
     * @param {String} sceneName 要返回的名字
     * @param onSceneLaunched 返回场景成功后的回调
     */
    private doGoBackScene(sceneName: string, onSceneLaunched?: Function) {
        this.countDownLoadScene();
        let isLoadSuccess = director.loadScene(sceneName, (...args: any[]) => {
            this._isLoadingScene = false;
            this.cancelCountDownTimer();
            log(GameSceneManager.TAG, 'backScene Finish');
            this._curSceneName = sceneName;
            this.handleBackSceneStack();
            if (onSceneLaunched) {
                onSceneLaunched(...args);
            }
        });
        log(GameSceneManager.TAG, 'backScene isSuccess ' + sceneName + ' ' + isLoadSuccess);
        if (!isLoadSuccess) {
            this._isLoadingScene = false;
        }
    }

    /**
     * @description 处理返回场景时的栈
     */
    private handleBackSceneStack() {
        this._sceneStack.pop();

        let sceneInfo = this._sceneStack[this._sceneStack.length - 1];
        while (sceneInfo.isTempScene) {
            this._sceneStack.pop();
            sceneInfo = this._sceneStack[this._sceneStack.length - 1];
        }
    }

    /**
     * @description 处理不同启动模式时的入栈情况
     * @param sceneName 要入栈的scene名称
     * @param startMode 启动模式
     */
    private handleStackByMode(sceneName: string, startMode?: StartSceneMode) {
        if (!startMode) {
            startMode = StartSceneMode.STANDARD;
        }
        let isTemp = false;
        switch (startMode) {
            case StartSceneMode.STANDARD:
                break;
            case StartSceneMode.SINGLE_TOP:
                let index = -1;
                for (let i = 0; i < this._sceneStack.length; i++) {
                    if (sceneName == this._sceneStack[i].sceneName) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    this._sceneStack.splice(index, this._sceneStack.length - index);
                }
                break;
            case StartSceneMode.CLEAR_STACK:
                this._sceneStack = [];
                break;
            case StartSceneMode.TEMPORARY:
                isTemp = true;
                break;
            default:

        }
        this._sceneStack.push({sceneName: sceneName, isTempScene: isTemp});
    }

    /**
     * @description 加载场景的计时器，防止加载一个场景卡死无回调时，SceneManager 无法启动其他场景的问题
     */
    private countDownLoadScene() {
        log(GameSceneManager.TAG, 'begin count down loadScene.');
        this.cancelCountDownTimer();
        this._countDownTimer = setTimeout(() => {
            this._isLoadingScene = false;
            log(GameSceneManager.TAG, 'loadScene timeout');
            this.cancelCountDownTimer();
        }, this._loadSceneTimeout);
    }

    private cancelCountDownTimer() {
        if (this._countDownTimer) {
            clearTimeout(this._countDownTimer);
            this._countDownTimer = null;
        }
    }
}
