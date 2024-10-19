import {director, error, Node, AudioClip, AudioSource} from "cc";

import {Singleton} from "./singleton";
import {resLoader} from "./res/res_loader";


interface IAudioCallbackOptions {
    onError?: Function;
    onComplete?: Function;
    onStop?: Function;
    onPause?: Function;
    onResume?: Function;
    onEnd?: Function; // onComplete || onError || onStop
}

type AudioCallbackMap = Map<number, IAudioCallbackOptions>

interface IAudioPlayOptions extends IAudioCallbackOptions {
    loop?: boolean;
    volume?: number;
}

type AudioRes = string | AudioClip;

export class GameAudioManager extends Singleton<GameAudioManager>() {
    private readonly _audioSource: AudioSource;

    protected constructor() {
        super();

        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        // director.getScene().addChild(audioMgr);

        director.addPersistRootNode(audioMgr);

        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    private _loop: boolean = true;
    private _enableMusic: boolean = true;
    private _enableEffect: boolean = true;

    private _volume: number = 1;
    private _bgmAudioID: number = -1;

    private _musicPlayCallback: AudioCallbackMap = new Map();
    private _effectPlayCallback: AudioCallbackMap = new Map();

    private _enableMusicCallback: Function = null;
    private _enableEffectCallback: Function = null;

    public get audioSource() {
        return this._audioSource;
    }

    public setVolume(volume: number) {
        this._volume = volume;
    }

    public setLoop(loop: boolean) {
        this._loop = loop;
    }

    public enable(enableMusic: boolean, enableEffect: boolean) {
        this.enableMusic = enableMusic;
        this.enableEffect = enableEffect;
    }

    public set enableMusic(enable: boolean) {
        this._enableMusic = enable;
        this._enableMusicCallback && this._enableMusicCallback(enable);
    }

    public set enableEffect(enable: boolean) {
        this._enableEffect = enable;
        this._enableEffectCallback && this._enableEffectCallback(enable);
    }

    async playMusic(sound: AudioRes, volume: number = 1, bundleName: string = 'resources') {
        this.stop();
        if (this._enableMusic) {
            await this.play(sound, {volume: volume}, true, bundleName);
        }
    }

    async playEffect(sound: AudioRes, volume: number = 1, bundleName: string = 'resources') {
        if (this._enableEffect) {
            await this.playOneShot(sound, volume, bundleName);
        }
    }

    resumeMusic() {
        if (this._enableMusic) {
            this.resume();
        }
    }

    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound clip or url for the audio
     * @param volume 音量
     * @param bundleName 资源包名
     */
    async playOneShot(sound: AudioRes, volume?: number, bundleName: string = 'resources') {
        if (sound instanceof AudioClip) {
        } else {
            let [clip, err] = await resLoader.asyncLoad<AudioClip>(bundleName, sound, AudioClip);
            if (err) {
                error('create audio clip failed, err:' + err);
                return;
            }

            sound = clip;
        }

        const volume_ = (volume !== undefined) ? volume : this._volume;

        this._audioSource.playOneShot(sound, volume_);
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param options
     * @param stopOther
     * @param bundleName
     */
    async play(sound: AudioRes, options?: IAudioPlayOptions, stopOther = true, bundleName: string = 'resources') {
        if (sound instanceof AudioClip) {
            this._audioSource.clip = sound;
        } else {
            let [clip, err] = await resLoader.asyncLoad<AudioClip>(bundleName, sound, AudioClip);
            if (err) {
                error('create audio clip failed, err:' + err);
                return;
            }

            this._audioSource.clip = clip;
        }

        const volume = (options && options.volume !== undefined) ? options.volume : this._volume;
        const loop = (options && options.loop !== undefined) ? options.loop : this._loop;

        this._audioSource.volume = volume;
        this._audioSource.loop = loop;

        this._audioSource.play();
    }

    /**
     * stop the audio play
     */
    stop() {
        this._audioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this._audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume() {
        this._audioSource.play();
    }

    protected onEnable() {
        // Register the started event callback
        this.audioSource.node.on(AudioSource.EventType.STARTED, this.onAudioStarted, this);
        // Register the ended event callback
        this.audioSource.node.on(AudioSource.EventType.ENDED, this.onAudioEnded, this);
    }

    protected onDisable() {
        this.audioSource.node.off(AudioSource.EventType.STARTED, this.onAudioStarted, this);
        this.audioSource.node.off(AudioSource.EventType.ENDED, this.onAudioEnded, this);
    }

    protected onAudioStarted() {
        // TODO...
    }

    protected onAudioEnded() {
        // TODO...
    }
}
