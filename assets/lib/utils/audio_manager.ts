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
    bundle?: string;
}

type AudioRes = string | AudioClip;

export class GameAudioManager extends Singleton<GameAudioManager>() {
    private readonly _audioSource: AudioSource = null;

    protected constructor() {
        super();

        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        // director.getScene().addChild(audioMgr);

        director.addPersistRootNode(audioMgr);

        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    private _loop: boolean = true;
    private _volume: number = 1;
    private _bgmAudioID: number = -1;

    private _musicPlayCallback: AudioCallbackMap = new Map();
    private _effectPlayCallback: AudioCallbackMap = new Map();

    public get audioSource() {
        return this._audioSource;
    }

    public setVolume(volume: number) {
        this._volume = volume;
        this._audioSource.volume = volume;
    }

    public setLoop(loop: boolean) {
        this._loop = loop;
        this._audioSource.loop = loop;
    }

    /**
     * 播放背景音乐
     * @param sound 声音源
     * @param volume 音量
     * @param bundleName
     */
    async playMusic(sound: AudioRes, volume: number = 1, bundleName: string = 'resources') {
        this.stop();

        await this.play(sound, {volume: volume, bundle: bundleName});
    }

    /**
     * 播放音效
     * @param sound 声音源
     * @param volume 音量
     * @param bundleName
     */
    async playAudio(sound: AudioRes, volume: number = 1, bundleName: string = 'resources') {
        await this.playOneShot(sound, volume, bundleName);
    }

    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound clip or url for the audio
     * @param volume 音量
     * @param bundleName
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
     */
    async play(sound: AudioRes, options?: IAudioPlayOptions, stopOther = true) {
        if (sound instanceof AudioClip) {
            this._audioSource.clip = sound;
        } else {
            let [clip, err] = await resLoader.asyncLoad<AudioClip>(options.bundle || 'resources', sound, AudioClip);
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
