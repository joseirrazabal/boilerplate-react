import shaka from 'shaka-player';


class shakaUtils {

  /**
   * @param {shakaAssets.AssetInfo} asset
   * @param {shaka.Player} player
   */
  static setupAssetMetadata(asset, player) {
    var config = /** @type {shakaExtern.PlayerConfiguration} */(
      { drm: {}, manifest: { dash: {} }, streaming: {} });

    // Add config from this asset.
    if (asset.licenseServers)
      config.drm.servers = asset.licenseServers;
    if (asset.drmCallback)
      config.manifest.dash.customScheme = asset.drmCallback;
    if (asset.clearKeys)
      config.drm.clearKeys = asset.clearKeys;
    if (asset.streamBufferSize)
      config.streaming.bufferingGoal = +asset.streamBufferSize;
    if (asset.bufferBehind)
      config.streaming.bufferBehind = asset.bufferBehind;
    if (asset.drm && asset.drm.advanced)
      config.drm.advanced = asset.drm.advanced;

    player.configure(config);
    
    // Configure Resolution
    player.setMaxHardwareResolution(1280, 720);

    // Configure network filters.
    var networkingEngine = player.getNetworkingEngine();
    networkingEngine.clearAllRequestFilters();
    networkingEngine.clearAllResponseFilters();

    if (asset.licenseRequestHeaders) {
      var filter = shakaUtils.addLicenseRequestHeaders_.bind(
        null, asset.licenseRequestHeaders);
      networkingEngine.registerRequestFilter(filter);
    }

    if (asset.requestFilter)
      networkingEngine.registerRequestFilter(asset.requestFilter);
    if (asset.responseFilter)
      networkingEngine.registerResponseFilter(asset.responseFilter);
    if (asset.extraConfig)
      player.configure(/** @type {shakaExtern.PlayerConfiguration} */(
        asset.extraConfig));
  };


  /**
   * @param {!Object.<string, string>} headers
   * @param {shaka.net.NetworkingEngine.RequestType} requestType
   * @param {shakaExtern.Request} request
   * @private
   */
  static addLicenseRequestHeaders(headers, requestType, request) {
    if (requestType !== shaka.net.NetworkingEngine.RequestType.LICENSE) return;

    // Add these to the existing headers.  Do not clobber them!
    // For PlayReady, there will already be headers in the request.
    for (var k in headers) {
      request.headers[k] = headers[k];
    }
  };


  static toUTF8(str) {
    var encoded = encodeURIComponent(str);
    var utf8 = unescape(encoded);

    var result = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; ++i) {
      result[i] = utf8.charCodeAt(i);
    }
    return result.buffer;
  };

  /**
   * Convert a Uint8Array to a base64 string.  The output will always use the
   * alternate encoding/alphabet also known as "base64url".
   * @param {!Uint8Array} arr
   * @param {boolean=} opt_padding If true, pad the output with equals signs.
   *   Defaults to true.
   * @return {string}
   */
  static toBase64(arr, opt_padding) {
    // btoa expects a "raw string" where each character is interpreted as a byte.
    var bytes = String.fromCharCode.apply(null, arr);
    var padding = (opt_padding === undefined) ? true : opt_padding;
    var base64 = window.btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_');
    return padding ? base64 : base64.replace(/=*$/, '');
  };


  /**
   * Convert a base64 string to a Uint8Array.  Accepts either the standard
   * alphabet or the alternate "base64url" alphabet.
   * @param {string} str
   * @return {!Uint8Array}
   */
  static fromBase64(str) {
    // atob creates a "raw string" where each character is interpreted as a byte.
    var bytes = window.atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    var result = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; ++i) {
      result[i] = bytes.charCodeAt(i);
    }
    return result;
  };


}

export default shakaUtils;
