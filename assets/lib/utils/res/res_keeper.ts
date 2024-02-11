import {Asset, Component, _decorator} from "cc";
import {AssetType, CompleteCallback, ProgressCallback, resLoader} from "./res_loader";

const {ccclass} = _decorator;

@ccclass
export class ResKeeper extends Component {

    private resCache = new Set<Asset>();

    public load<T extends Asset>(bundleName: string, paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(bundleName: string, paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], onComplete?: CompleteCallback<T> | null): void;
    public load<T extends Asset>(paths: string | string[], type: AssetType<T> | null, onComplete?: CompleteCallback<T> | null): void;
    public load(...args: any) {
        // 调用加载接口
        resLoader.load.apply(resLoader, args);
    }

    /**
     * 缓存资源
     * @param asset
     */
    public cacheAsset(asset: Asset) {
        if (!this.resCache.has(asset)) {
            asset.addRef();
            this.resCache.add(asset);
        }
    }

    /**
     * 组件销毁时自动释放所有keep的资源
     */
    public onDestroy() {
        this.releaseAssets();
    }

    /**
     * 释放资源，组件销毁时自动调用
     */
    public releaseAssets() {
        this.resCache.forEach(element => {
            element.decRef();
        });
        this.resCache.clear();
    }
}
