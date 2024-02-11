import {Asset, Director, Scene, director, log, assetManager} from "cc";
import {EDITOR} from "cc/env";

import {ResKeeper} from "./res_keeper";

export class AssetManagerEx {
    private static instance: AssetManagerEx;
    private defaultKeeper: ResKeeper = new ResKeeper();
    private persistDepends: Set<string> = new Set<string>();
    private sceneDepends: string[] = null;
    private lastScene = null;

    /**
     * 获取当前场景的持久节点应用的资源
     */
    private getPersistDepends(): Set<string> {
        // director.addPersistRootNode()
        // const persistNodeList = Object.keys(game._persistRootNodes).map(function (x) {
        //     return game._persistRootNodes[x];
        // });
        // return ResUtil.getNodesDepends(persistNodeList);
        return null;
    }

    /**
     * 处理场景切换，分两种情况，一种为根据scene的uuid找到场景的资源，另外一种为根据scene.dependAssets进行缓存
     * @param scene
     */
    private onSceneChange(scene: Scene) {
        console.log('On Scene Change');
        return;
    }


    // 为Asset注入引用计数的功能
    private static assetInit() {
        console.log('asset init');
        if (!Object.getOwnPropertyDescriptor(Asset.prototype, 'addRef')) {
            Object.defineProperties(Asset.prototype, {
                refDepends: {
                    configurable: true,
                    writable: true,
                    enumerable: false,
                    value: false,
                },
                refCount: {
                    configurable: true,
                    writable: true,
                    enumerable: false,
                    value: 0,
                },
                addRef: {
                    configurable: true,
                    writable: true,
                    value: function (): Asset {
                        ++this.refCount;
                        return this;
                    }
                },
                decRef: {
                    configurable: true,
                    writable: true,
                    value: function (autoRelease = true): Asset {
                        --this.refCount;
                        if (this.refCount <= 0 && autoRelease) {
                            AssetManagerEx.Instance.releaseAsset(this, false);
                        }
                        return this;
                    }
                }
            });
        }
    }

    private constructor() {
        if (EDITOR) {
            return;
        }
        // game.once(game.EngineInitedEvent, AssetManagerEx.assetInit);
        director.on(Director.EVENT_BEFORE_SCENE_LAUNCH, (scene) => {
            this.onSceneChange(scene);
        });
    }

    public static get Instance() {
        if (!this.instance) {
            this.instance = new AssetManagerEx();
        }
        return this.instance;
    }

    public getKeeper(): ResKeeper {
        return this.defaultKeeper;
    }

    private getReferenceKey(assetOrUrlOrUuid: Asset | string) {
        if (assetOrUrlOrUuid instanceof Asset && !assetOrUrlOrUuid.uuid) {
            // 远程资源没有_uuid
            if (assetOrUrlOrUuid.nativeUrl) {
                return assetOrUrlOrUuid.nativeUrl;
            }
        }
        // return loader._getReferenceKey(assetOrUrlOrUuid);
    }

    /**
     * 缓存一个资源
     * @param item 资源的item对象
     * @param add
     */
    private cacheItem(item: any, add: boolean = false) {
        if (item) {
            let asset: Asset = item.content;
            if (asset instanceof Asset) {
                if (add) {
                    asset.addRef();
                }

                if (!asset._nativeDep && item.dependKeys) {
                    let depends = item.dependKeys;
                    for (let i = 0; i < depends.length; i++) {
                        this.cacheItem(assetManager.dependUtil.getDeps(depends[i]), true);
                    }
                    //asset.refDepends = true;
                }
            } else {
                // 原生资源、html元素有可能走到这里，原生资源都是有对应的Asset对应引用的，所以这里可以不处理
                console.log(`cacheItem ${item} is not Asset ${asset}`);
            }
        } else {
            console.warn(`cacheItem error, item is ${item}`);
        }
    }

    public cacheAsset(assetOrUrlOrUuid: Asset | string, add: boolean = false) {
        let key = this.getReferenceKey(assetOrUrlOrUuid);
        if (key) {
            let item = assetManagerEx.getReferenceKey(key);
            if (item) {
                this.cacheItem(item, add);
            } else {
                console.warn(`cacheAsset error, loader.getItem ${key} is ${item}`);
            }
        } else {
            console.warn(`cacheAsset error, this.getReferenceKey ${assetOrUrlOrUuid} return ${key}`);
        }
    }

    /**
     * 释放一个资源
     * @param item 资源的item对象
     * @param dec
     */
    private releaseItem(item: any, dec: boolean = false) {
        if (item && item.content) {
            let asset: any = item.content;
            let res = item.uuid || item.id;
            if (asset instanceof Asset) {
                if (dec) {
                    asset.decRef(false);
                }
                if (asset.refCount <= 0) {
                    let depends = item.dependKeys;
                    if (depends) {
                        for (let i = 0; i < depends.length; i++) {
                            this.releaseItem(assetManager.dependUtil.getDeps(depends[i]), true);
                        }
                    }

                    assetManager.releaseAsset(res);
                    log(`assetManager.releaseAsset Asset ${res}`);
                }
            } else {
                assetManager.releaseAsset(res);
                log(`assetManager.releaseAsset ${res} rawAsset ${asset}`);
            }
        } else {
            console.warn(`releaseItem error, item is ${item}`);
        }
    }

    /**
     * 释放一个资源（会减少其引用计数）
     * @param assetOrUrlOrUuid
     * @param dec
     */
    public releaseAsset(assetOrUrlOrUuid: Asset | string, dec: boolean = false) {
        let key = this.getReferenceKey(assetOrUrlOrUuid);
        if (key) {
            let item = assetManager.dependUtil.getDeps(key);
            if (item) {
                this.releaseItem(item, dec);
            } else {
                console.warn(`releaseAsset error, loader.getItem ${key} is ${item}`);
            }
        } else {
            console.warn(`releaseAsset error, this.getReferenceKey ${assetOrUrlOrUuid} return ${key}`);
        }
    }
}

export const assetManagerEx = AssetManagerEx.Instance;
