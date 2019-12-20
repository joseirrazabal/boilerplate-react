import Metadata from "../../requests/apa/Metadata";
import Utils from "../../utils/Utils";

export default {
  // external URL to check network status when ajax
  ajax_url: '/manifest.json',
  // Interval to check network status, in seconds
  interval_time_check_: 15,
  //Ribbons time to expire, in seconds (same TTL for ribbons cards, when level cache expires then reload cards)
  duration_of_ribbons_in_cache: 3600, // 1 hora
  // Enable or not debugger use
  debugger_enabled: false,

  //time to send lineal channel, milisegundos
   interval_lineal_chanel: 3600000, // 1 hora

  // credits time default, in seconds
  rolling_credits_time: -30,

  // Event that is fired when VOD reached credits time (only full player)
  end_vod_fire_event: 'onEndVOD',

  //path de suscribirte
  path_suscription: 'planSelector',

  // Evento que envía ps4 cuando AAF entra en segundo plano o se reactiva
  playstation_app_status_change: 'playstation_app_status_change',

  // Event that is fired to networkDisconnection
  event_change_network_status: 'current-network-status',

  // Event that is fired to handle epg's visibility
  show_epg: 'epgVisibility',

  // Position of EndPlayer Component
  end_player_position_top: 285,
  end_player_position_left: 57,
  end_player_position_height: 150,
  end_player_position_width: 265,

  //Event fired when stop a play media to update progress view of the video
  update_progress: 'updateProgress',

  live_fullplayer_position_top: 106,
  live_fullplayer_position_left: 950,
  live_fullplayer_position_height: 170,
  live_fullplayer_position_width: 302,

  full_player_position_top:0,
  full_player_position_left:0,
  full_player_position_height:'720px',
  full_player_position_width:'1280px',

  prepend_multiple: '_ma',

  /**
   * ****Por el momento sólo usar para debug
   * Importante: TODO falta hacer el clear/reset del cache cuando el usuario haga login o haga logout, según sea el caso
   * En estos momentos el caché guardará todos los ribbons, tanto del logueado como del anónimo
   * Se usa en los ribbons de level y leveluser)
   */
  use_ribbons_cache: false,

  /**
   * * ****Por el momento sólo usar para debug
   * Aplica sobre level y leveluser y es independiente del setting de arriba use_ribbons_cache
   * Poner null o false si no se usa
   * Poner un número si existe el máximo
   * use_max_ribbons = número máximo de ribbons para mostrar por nodo
   * use_max_ribbons_items = número máximo items/cards por ribbons para mostrar
   */
  use_max_ribbons: false,
  use_max_ribbons_items: false,
  check_app_version: true,

  /*
  ** EPG cache Toggle y configuracion
  */ 

  epg_cache_enabled: false,

};

/*
   Player states:
   0 connect
   1 stop
   2 playing
   3 paused
   4 skip
   5 speed
   6 buffering
*/
export const PONCONNECT = 0;
export const PONSTOP = 1;
export const PONPLAY = 2;
export const PONPAUSE = 3;
export const PONSKIP = 4;
export const PONSPEED = 5;
export const PONBUFFER = 6;
