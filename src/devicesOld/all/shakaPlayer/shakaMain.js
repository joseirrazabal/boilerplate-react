
import shakaUtils from "./shakaUtils"
import shaka from 'shaka-player'

class shakaPlayer {

    constructor() {

        /** @private {shaka.cast.CastProxy} */
        this.castProxy_ = null

        /** @private {HTMLMediaElement} */
        this.video_ = null

        /** @private {shaka.Player} */
        this.player_ = null

        /** @private {shaka.Player} */
        this.localPlayer_ = null

        /** @private {shakaExtern.SupportType} */
        this.support_ = null // alerta alerta

        /** @private {ShakaControls} */
        this.controls_ = null
    }

    /**
     * GET && SET
     **/

    static getVideo() {
        return this.video_;
    }

    static setVideo(video) {
        this.video_ = video;
    }

    static getPlayer() {
        return this.player_;
    }

    static setPlayer(player) {
        this.player_ = player;
    }

    /**
     * Prepares the Player to load the given assets by setting the configuration
     * values.  This does not load the asset.
     *
     * @param {?shakaAssets.AssetInfo} asset
     * @return {shakaAssets.AssetInfo}
     * @private
     */
    static preparePlayer(asset) {

        var config = /** @type {shakaExtern.PlayerConfiguration} */(
            { abr: {}, manifest: { dash: {} } });
        config.manifest.dash.clockSyncUri = asset.manifestUri;
        config.streaming = config.streaming || {};
        config.streaming.retryParameters = {
            timeout: 4e3,       // timeout in ms, after which we abort a request; 0 means never
            maxAttempts: 2,   // the maximum number of requests before we fail
            baseDelay: 700,  // the base delay in ms between retries
            backoffFactor: 2, // the multiplicative backoff factor between retries
            fuzzFactor: 0.7,  // the fuzz factor to apply to each retry delay
        };

        // manual backoff retry method, because we can
        config.streaming.failureCallback = function (err) {
            console.warn('FC::ERR:', err);
            if (err.code !== shaka.util.Error.Code.TIMEOUT) {
                return;
            }

           if(this.player_ && typeof this.player_.retryStreaming === "function") this.player_.retryStreaming();
        }

        this.player_.resetConfiguration();

        // Add config from this asset.
        shakaUtils.setupAssetMetadata(asset, this.player_);

        config.preferredAudioLanguage = 'es-419';
        config.preferredTextLanguage = 'es-419';

        this.player_.configure(config);

        return asset;
    };
}

export default shakaPlayer;