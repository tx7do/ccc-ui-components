import {_decorator, Component, Sprite, ProgressBar, SpriteFrame, error} from 'cc';

import {GameSceneManager, StartSceneMode} from "db://assets/libs/utils/scene_manager";
import {resLoader} from "db://assets/libs/utils/res/res_loader";

const {ccclass, property} = _decorator;

@ccclass('BaseLoadingScene')
export abstract class BaseLoadingScene extends Component {
    @property(Sprite)
    logo: Sprite = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    /**
     * 进入场景
     * @protected
     */
    protected startScene(sceneName: string, bundleName: string = 'resources', startMode: StartSceneMode = StartSceneMode.STANDARD, onSceneLaunched?: Function) {
        this.node.active = true;

        GameSceneManager.instance.preloadScene(sceneName, bundleName,
            function (completedCount: number, totalCount: number, _: any) {
                if (this.progressBar != null) {
                    this.progressBar.progress = completedCount / totalCount;
                }
            }.bind(this),
            function () {
                // 启动场景
                GameSceneManager.instance.startScene(sceneName, bundleName, {
                    startMode: startMode,
                    onSceneLaunched: onSceneLaunched,
                });
            }.bind(this),
        );
    }

    /**
     * 加载LOGO
     * @protected
     */
    protected async setLogo(imagePath: string, bundleName: string = 'resources') {
        if (this.logo == null) {
            return false;
        }

        let [spriteFrame, err] = await resLoader.asyncLoad<SpriteFrame>(bundleName, imagePath + '/spriteFrame', SpriteFrame);
        if (err) {
            error('load loading logo sprite frame failed, err:' + err);
            return false;
        }

        this.logo.spriteFrame = spriteFrame;

        return true;
    }
}
