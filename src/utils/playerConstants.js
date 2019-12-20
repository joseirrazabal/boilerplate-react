// DOC https://dlatvarg.atlassian.net/wiki/spaces/DAMCO/pages/250741191/Diagrama+de+estados+de+los+reproductores

/* PLAYER INTERNAL STATE VARS (PER PLAYER) */
export const NOT_PLAYING = 'NOT_PLAYING';
export const PLAYING_LIVE_IP = 'PLAYING_LIVE_IP';
export const PLAYING_LIVE_DVB = 'PLAYING_LIVE_DVB';
export const PLAYING_MP3 = 'PLAYING_MP3';
export const PLAYING_RADIO = 'PLAYING_RADIO';
export const PLAYING_VOD_DRM = 'PLAYING_VOD_DRM';
export const PLAYING_VOD_CLEAR = 'PLAYING_VOD_CLEAR';
export const SHOWING_IMAGE = 'SHOWING_IMAGE';
/* END PLAYER INTERNAL STATE VARS (PER PLAYER) */

/* PLAYERS GLOBAL STATE (BOTH PLAYERS) */
export const E1 = 'E1';
export const E2 = 'E2';
export const E3 = 'E3';
export const E4 = 'E4';
export const E5 = 'E5';
export const E6 = 'E6';
export const E7 = 'E7';
export const E8 = 'E8';
export const E9 = 'E9';
export const E10 = 'E10';
export const E11 = 'E11';
export const E12 = 'E12';
export const E13 = 'E13';
export const E14 = 'E14';
export const E15 = 'E15';
export const E16 = 'E16';
export const E17 = 'E17';
export const E18 = 'E18';
export const E19 = 'E19';
/* END PLAYERS GLOBAL STATE */


// Stream types valid for player
export const SS = 'smooth_streaming';
export const DASHWV = 'dashwv';
export const DASHWV_MA = 'dashwv_ma';
export const SS_MA = 'smooth_streaming_ma';
export const HLS = 'hls';
export const HLS_KR = 'hls_kr';
export const HLSPRM = 'hlsprm';
export const IP_MULTICAST = 'ip_multicast';
export const IP_MULTICAST_UDP = 'ip_multicast_udp';
export const DVBC = 'dvbc';
export const DVBS = 'dvbs';
export const WVC = 'widevine_classic';
export const AUDIO = 'audio';
export const RADIO = 'radio';
export const SPOT = 'spot';
export const PLAYERIMAGE = 'image';


// Player errors
export const onStreamNotFound = 'onStreamNotFound';
export const onConnectionTimeout = 'onConnectionTimeout';
export const onConnectionFailed = 'onConnectionFailed';
export const onNetworkDisconnected = 'onNetworkDisconnected';
export const onAuthenticationFailed = 'onAuthenticationFailed';
export const onUnknownError = 'onUnknownError';
export const onRenderError = 'onRenderError';

// Custom errors desde AAF Playing miniframework
export const onResolvePlayingError = 'onResolveError';
export const onResolveGetmediaError = 'onGetmediaError';

export const PROVIDER_CODE_FOXV3 = 'foxv3';
export const PROVIDER_CODE_HBO = 'hbo';