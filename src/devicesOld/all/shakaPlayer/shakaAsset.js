import shaka from 'shaka-player';
import shakaPlayer from "./shakaMain";
// import Utils from '../../../utils/Utils'; // No se usa
import shakaUtils from './shakaUtils';

class shakaAssets {

    constructor() {

        /**
         * @typedef {{
         *
         * @property {string} name
         *   The name of the asset.  This does not have to be unique and can be the
         *   same if the asset is encoded different ways (or by different encoders).
         * @property {string} manifestUri
         *   The URI of the manifest.
         * @property {(boolean|undefined)} focus
         *   (optional) If true, focuses the integration test for this asset and selects
         *   this asset in the demo app.
         * @property {(boolean|undefined)} disabled
         *   (optional) If true, disables tests for this asset and hides it in the demo
         *   app.
         * @property {(!Array.<shakaAssets.ExtraText>|undefined)} extraText
         *   (optional) An array of extra text sources (e.g. external captions).
         *
         * @property {shakaAssets.Encoder} encoder
         *   The encoder that created the asset.
         * @property {shakaAssets.Source} source
         *   The source of the asset.
         * @property {!Array.<shakaAssets.KeySystem>} drm
         *   An array of key-systems that the asset uses.
         * @property {!Array.<shakaAssets.Feature>} features
         *   An array of features that this asset has.
         *
         * @property {(!Object.<string, string>|undefined)} licenseServers
         *   (optional) A map of key-system to license server.
         * @property {(!Object.<string, string>|undefined)} licenseRequestHeaders
         *   (optional) A map of headers to add to license requests.
         * @property {(shakaExtern.RequestFilter|undefined)}
         *     requestFilter
         *   A filter on license requests before they are passed to the server.
         * @property {(shakaExtern.ResponseFilter|undefined)}
         *     responseFilter
         *   A filter on license responses before they are passed to the CDM.
         * @property {(shakaExtern.DashContentProtectionCallback|undefined)} drmCallback
         *   A callback to use to interpret ContentProtection elements.
         * @property {(!Object.<string, string>|undefined)} clearKeys
         *   A map of key-id to key to use with clear-key encryption.
         *
         * @property {(Object|undefined)} extraConfig
         *   Arbitrary player config to be applied after all other settings.
         *
         * @property {(Object|undefined)} customData
         *   Arbitrary player custom data to be applied after all other settings.
         */

        this.AssetInfo = {}

        this.DLARequestFilter = this.DLARequestFilter.bind(this);
        this.setAssetInfo = this.setAssetInfo.bind(this);
    }

    static getTypeFilter() {
        
        /** @enum {string} */
        var TypeFilter = {
            DEFAULT: 0,
            FOXPLAY: 1,
            FOXV3PLAY: 4,
            HBO: 2,
            CRACKLE: 3,
            PICARDIA: 5,
        }
        return TypeFilter;
    }

    static getKeySystem() {

        /** {string} */
        var KeySystem = {
            CLEAR_KEY: 'org.w3.clearkey',
            PLAYREADY: 'com.microsoft.playready',
            WIDEVINE: 'com.widevine.alpha',
            FAIRPLAY: 'com.apple.fps.1_0'
        }
        return KeySystem;
    }

    static getAssetInfo() {
        return this.AssetInfo;
    }

    static setAssetInfo(assets) {
        if(!this.AssetInfo) this.AssetInfo = {}
        Object.assign(this.AssetInfo, assets);
    }

    /**
     * A license request filter for DLA license request.
     * @param {shaka.net.NetworkingEngine.RequestType} type
     * @param {shakaExtern.Request} request
     */
    static DLARequestFilter(type, request) {

        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE) {
            return;
        }
        var typeFilter = shakaAssets.getTypeFilter();
        var player = shakaPlayer.getPlayer();
        var keySystem = shakaAssets.getKeySystem();

        switch (shakaAssets.AssetInfo.typeFilter) {
            case typeFilter.FOXPLAY:
                shakaAssets.FoxPlayLicenseRequestFilter(type, request, player, keySystem);
                break;
            case typeFilter.FOXV3PLAY:
                shakaAssets.FoxV3PlayLicenseRequestFilter(type, request, player, keySystem);
                break;
            case typeFilter.HBO:
                shakaAssets.HBOLicenseRequestFilter(type, request, player, keySystem);
                break;
            case typeFilter.DEFAULT:
                shakaAssets.LicenseRequestFilter(type, request, player, keySystem);
                break;
        }
    };


    /**
    * A license request filter for DLA license request.
    * @param {shaka.net.NetworkingEngine.RequestType} type
    * @param {shakaExtern.Request} request
    * @param {shaka.Player} player
    */
    static LicenseRequestFilter(type, request, player, keySystem) {
        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE)
            return;
        switch (player.keySystem()) {
            case keySystem.WIDEVINE:
                // let parsedURL = /^(\w+)\:\/\/([^\/]+)\/(.*)$/.exec(shakaAssets.AssetInfo.licenseServers.url_server);
                // let [, protocol, fullhost, fullpath] = parsedURL;
                if(shakaAssets.AssetInfo.licenseServers.url_server.includes('licenser/getlicense')) {
                    request.body = new Uint8Array(shakaUtils.toUTF8(
                        JSON.stringify({
                            'token': shakaAssets.AssetInfo.customData.token,
                            'device_id': shakaAssets.AssetInfo.customData.device_id,
                            'widevineBody': window.btoa(String.fromCharCode.apply(
                                null, new Uint8Array(request.body)))
                        }))).buffer;
    
                } else {
                    request["Access-Control-Allow-Origin"] = "*";
                    request.headers["Content-Type"] = "application/octect-stream";
                    request.headers['deviceUniqueId'] = shakaAssets.AssetInfo.customData.device_id;
                    request.headers['privateData'] = shakaAssets.AssetInfo.customData.token;
                    request.body;
                    console.log('[OP Request]', request)
                    console.log('[OP Headers]', request.headers)
                }
                break;
            case keySystem.PLAYREADY:
                break;
            case keySystem.FAIRPLAY:
                break;
        }
    };


    /**
    * A license request filter for DLA license request (FOX V3).
    * @param {shaka.net.NetworkingEngine.RequestType} type
    * @param {shakaExtern.Request} request
    * @param {shaka.Player} player
    * @param {string} keySystem
    */
    static FoxV3PlayLicenseRequestFilter(type, request, player, KeySystem) {
        console.log("FoxV3PlayLicenseRequestFilter",player.keySystem());
        switch (type) {
            case shaka.net.NetworkingEngine.RequestType.LICENSE:
                switch (player.keySystem()) {
                    case KeySystem.WIDEVINE:
                        break;
                    case KeySystem.PLAYREADY:
                        break;
                    case KeySystem.FAIRPLAY:
                        break;
                }
                break;
        }
    };

    /**
     * A license request filter for DLA license request (FOX V2).
     * @param {shaka.net.NetworkingEngine.RequestType} type
     * @param {shakaExtern.Request} request
     * @param {shaka.Player} player
     * @param {string} keySystem
     */
    static FoxPlayLicenseRequestFilter(type, request, player, keySystem) {
        switch (type) {
            case shaka.net.NetworkingEngine.RequestType.LICENSE:
                switch (player.keySystem()) {
                    case keySystem.WIDEVINE:
                        var challenge = window.btoa(String.fromCharCode.apply(null, new Uint8Array(request.body)));
                        request.uris[0] = request.uris[0].replace('/getWidevineLicense', '');
                        request.body = new Uint8Array(shakaAssets.toUTF8(
                            JSON.stringify({
                                getWidevineLicense: {
                                    releasePid: this.getParameterByName('_releasePid', request.uris[0]),
                                    widevineChallenge: challenge
                                }
                            }))).buffer;
                        break;
                    case keySystem.PLAYREADY:
                        break;
                    case keySystem.FAIRPLAY:
                        break;
                }
                break;
        }
    };

    /**
    * A license request filter for DLA license request (FOX V2).
    * @param {shaka.net.NetworkingEngine.RequestType} type
    * @param {shakaExtern.Request} request
    * @param {shaka.Player} player
    * @param {string} keySystem
    */
    static HBOLicenseRequestFilter(type, request, player, keySystem) {
        switch (type) {
            case shaka.net.NetworkingEngine.RequestType.LICENSE:
                switch (player.keySystem()) {
                    case keySystem.WIDEVINE:
                        if (request.body.byteLength === 2) {
                            request.uris[0] = request.uris[0].replace('GetLicense', 'GetCertificate');
                        }
                        var cuDat = this.AssetInfo.customData
                            && this.AssetInfo.customData.token
                            && this.AssetInfo.customData.token.replace('{keyid}', player.drmInfo().keyIds[0]);

                        request.headers['dt-custom-data'] = window.btoa(cuDat);
                        break;
                    case keySystem.PLAYREADY:
                        break;
                    case keySystem.FAIRPLAY:
                        break;
                }
                break;
        }
    };



    /**
     * A license response filter for DLA license responses.
     * @param {shaka.net.NetworkingEngine.RequestType} type
     * @param {shakaExtern.Response} response
     */
    static DLAResponseFilter = function (type, response) {
        if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST) {
            response.headers['date'] = response.headers['last-modified'];
            return;
        }

        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE) {
            return;
        }

        var typeFilter = shakaAssets.getTypeFilter();
        var player = shakaPlayer.getPlayer();
        var keySystem = shakaAssets.getKeySystem();

        switch (shakaAssets.AssetInfo.typeFilter) {
            case typeFilter.FOXPLAY:
                shakaAssets.FoxPlayLicenseResponseFilter(type, response, player, keySystem);
                break;
            case typeFilter.FOXV3PLAY:
                shakaAssets.FoxV3PlayLicenseResponseFilter(type, response, player, keySystem);
                break;
            case typeFilter.DEFAULT:
                break;
        }
    };

    static decodeLicense = (str) => {
        // atob creates a "raw string" where each character is interpreted as a byte.
        var decodedString = String.fromCharCode.apply(null, new Uint8Array(str));
        var obj = JSON.parse(decodedString);
        var message = obj.getWidevineLicenseResponse.license
        return message;
    };

    /**
     * A license response filter for DLA license responses (FOX V3).
     * @param {shaka.net.NetworkingEngine.RequestType} type
     * @param {shakaExtern.Response} response
     * @param {shaka.Player} player
     * @param {string} keySystem
     */
    static FoxV3PlayLicenseResponseFilter = function (type, response, player, keySystem) {

        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE)
            return;

        switch (player.keySystem()) {
            case keySystem.WIDEVINE:
                var wrappedArray = new Uint8Array(response.data);
                var rawLicenseString = String.fromCharCode.apply(null, wrappedArray);
                response.data = new Uint8Array(rawLicenseString.length);
                for (var i = 0; i < rawLicenseString.length; ++i) {
                    response.data[i] = rawLicenseString.charCodeAt(i);
                }
                break;
            case keySystem.PLAYREADY:
                break;
            case keySystem.FAIRPLAY:
                break;
        }
    };

    /**
     * A license response filter for DLA license responses (FOX V2).
     * @param {shaka.net.NetworkingEngine.RequestType} type
     * @param {shakaExtern.Response} response
     * @param {shaka.Player} player
     * @param {string} keySystem
     */
    static FoxPlayLicenseResponseFilter = function (type, response, player, keySystem) {
        if (type !== shaka.net.NetworkingEngine.RequestType.LICENSE)
            return;

        switch (player.keySystem()) {
            case keySystem.WIDEVINE:
                var wrappedArray = new Uint8Array(response.data);
                var wrappedString = String.fromCharCode.apply(null, wrappedArray);
                var wrapped = JSON.parse(wrappedString);
                var rawLicenseBase64 = wrapped.getWidevineLicenseResponse.license;
                var rawLicenseString = atob(rawLicenseBase64);
                response.data = new Uint8Array(rawLicenseString.length);
                for (var i = 0; i < rawLicenseString.length; ++i) {
                    response.data[i] = rawLicenseString.charCodeAt(i);
                }
                break;
            case keySystem.PLAYREADY:
                break;
            case keySystem.FAIRPLAY:
                break;
        }
    };

    static getParameterByName(name, url) {
        if (!url) {
          url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
      }

}

export default shakaAssets;
