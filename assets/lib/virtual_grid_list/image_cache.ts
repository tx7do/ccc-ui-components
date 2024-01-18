import {Component, SpriteFrame, error} from "cc";
import GameUtils from "db://assets/lib/utils/utils";

type Texture2DMap = Map<string, SpriteFrame>;

interface LoadTaskItem {
    uri: string;
    cb: Function;
}

type LoadTaskItemArray = Array<LoadTaskItem>;

export class ImageCache extends Component {
    protected _imgMap: Texture2DMap;                // 图片缓存
    protected _imgLoadingList: LoadTaskItemArray;   // 要加载的图片列表

    protected _loadImgDuration: number = 1;         // 帧内加载最大时长

    protected _imgLoading: boolean = false;         // 图片列表是否在加载中
    private _cacheImage: boolean = true;            // 缓存加载的图片

    set cacheImage(value: boolean) {
        this._cacheImage = value;
    }

    /**
     * 获取缓存图片
     * @param {String} key
     * @returns {SpriteFrame} 纹理
     */
    public getImage(key: string): SpriteFrame {
        return this._imgMap.get(key);
    }

    public clear() {
        this._imgMap && this._imgMap.clear();
        this._imgMap = null;
    }

    /**
     * 添加并等待加载图片
     * @param {String} uri 加载图片地址
     * @param {Function} callback  加载完成回调方法
     */
    public loadImage(uri: string, callback: Function) {
        let list = this._imgLoadingList;
        let imgMap = this._imgMap;
        if (!list) {
            list = this._imgLoadingList = [];
            imgMap = this._imgMap = new Map();
        }

        if (this._cacheImage) {
            const frame = imgMap.get(uri);
            if (frame && callback) {
                callback(frame, uri);
                return;
            }
        }
        list.push({
            uri: uri,
            cb: callback
        });
        if (!this._imgLoading) {
            this._imgLoading = true;
            this.loopLoadImage(list, this._loadImgDuration, imgMap);
        }
    }

    /**
     * 循环排队加载图片列表
     * @param {LoadTaskItemArray} list 要加载的图片列表 [{uri, cb, thisObj}]
     * @param {Number} duration 帧内加载最大时长
     * @param {Texture2DMap} imgMap 图片缓存map
     */
    private loopLoadImage(list: LoadTaskItemArray, duration: number, imgMap: Texture2DMap) {
        // 执行之前，先记录开始时间
        const startTime = new Date().getTime();
        while (list.length > 0) {

            let data = list.pop();
            this.loadSingleImage(data.uri, data.cb, imgMap);

            // 每执行完一段小代码段，都检查一下是否已经超过我们分配的本帧，这些小代码端的最大可执行时间
            if (new Date().getTime() - startTime > duration) {
                // 如果超过了，那么本帧就不在执行，开定时器，让下一帧再执行
                this.scheduleOnce(() => {
                    this.loopLoadImage(list, duration, imgMap);
                });
                return;
            }
        }
        this._imgLoading = false;
    }

    /**
     * 加载单张图片
     * @param {String} uri 加载图片地址
     * @param {Function} callback  加载完成回调方法
     * @param {Texture2DMap} imgMap 图片缓存map
     */
    private async loadSingleImage(uri: string, callback: Function, imgMap: Texture2DMap) {
        const [texture, err] = await GameUtils.asyncWrap<SpriteFrame, string>(GameUtils.loadAsync(uri + '/spriteFrame', SpriteFrame));
        if (err) {
            error('create sprite frame failed, err:' + err);
            return false;
        }

        if (this._cacheImage) {
            imgMap.set(uri, texture);
        }

        if (callback) {
            callback(texture, uri);
        }
    }
}
