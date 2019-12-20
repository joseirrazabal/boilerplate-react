import RequestManager from "./../requests/RequestManager";
import LevelTask from "./../requests/tasks/cms/LevelTask";
import LevelRibbonTask from './../requests/tasks/cms/LevelRibbonTask';
import LevelUserTask from "./../requests/tasks/cms/LevelUserTask";
import UserSeenTask from "./../requests/tasks/cms/UserSeenTask";
import MusicTask from "./../requests/tasks/music/MusicTask";
import settings from "./../devices/all/settings";
import FilterList from "./../utils/FilterList";
import ribbonsCache from "./RibbonsCache";
import Utils from "./../utils/Utils";
import Metadata from './../requests/apa/Metadata';
import storage from '../components/DeviceStorage/DeviceStorage';

class RibbonsUtil {
  constructor() {
    this.getRibbons = this.getRibbons.bind(this);
  }

  async getMiddlewareRibbons(node, user_status, callback) {

    console.log('[RCACHE] getMiddlewareRibbons node 1: ', node, user_status)
    const regionStorage = storage.getItem('region');
    const showEpgRibbon = JSON.parse(
      Metadata.get(
        "showEpgRibbon",
        "{\"mexico\":[\"home\"],\"argentina\":[\"home\"], \"default\":[]}" // HACK -- GOOSE -- "homeuser" esto hay que pasarlo a configuracion
      )
    );
    const validateEpgInRegion =
      (showEpgRibbon[regionStorage] || showEpgRibbon['default'])
        .includes (node);
    const params = {node, user_status, first_page: true, show_epg_ribbon: validateEpgInRegion};


    let doRequest = true;
    let idnode = node + '_' + user_status;
    idnode = idnode.replace(/,/g, '_');
    idnode = idnode.replace(/ /g, '');

    console.log('[RCACHE] getMiddlewareRibbons node 2: ', idnode)
    if(settings.use_ribbons_cache) {
      let nodeRibbons = ribbonsCache.get(idnode);
      if(nodeRibbons) {
        doRequest = false;
        if(typeof callback === 'function') {
          const rcallback  = callback(nodeRibbons);
          console.log('[RCACHE] Respuesta desde caché ', ribbonsCache)
        }
      }
    }

    if(doRequest) {
      try {
        const task = new LevelRibbonTask('level', params);
        RequestManager.addRequest(task).then((response) => {

          response.response = this.resolveRibbonsIfCache(response.response);
          response.response = this.resolveRibbonsItemsIfCache(response.response);

          if(settings.use_ribbons_cache) {
            ribbonsCache.set(idnode, response.response, settings.duration_of_ribbons_in_cache);
            console.log('[RCACHE] se puso en cache ', ribbonsCache, response.response)
          }

          if (typeof callback === 'function') {
            const rcallback  = callback(response.response);
            console.log('[RCACHE] Respuesta request Manager :', rcallback)
          }
        });
      } catch (e) {
        console.error('[RibbondUtil] getMiddlewareRibbons err', e);
      }
    }
  }

  resolveRibbonsIfCache(ribbons) {
    let maxRibbons = settings.use_max_ribbons;
    if(isNaN(maxRibbons)) {
      maxRibbons = 0;
    }
    if(maxRibbons > 0) {
      if(ribbons.components && Utils.isArray(ribbons.components) && ribbons.components.length > maxRibbons) {
        ribbons.components = ribbons.components.slice(0, maxRibbons);
      }
    }

    return ribbons;
  }

  resolveRibbonsItemsIfCache(ribbons) {
    let maxRibbonsItems = settings.use_max_ribbons_items;
    if(isNaN(maxRibbonsItems)) {
      maxRibbonsItems = 0;
    }

    if(maxRibbonsItems > 0) {
      let i;
      let ribbons_copy = ribbons.components;
      if(Utils.isArray(ribbons_copy)) {
        for(i = 0; i < ribbons_copy.length; i++) {
          if(Utils.isArray(ribbons_copy[i].items) && ribbons_copy[i].items.length > maxRibbonsItems) {
            ribbons.components[i].items = ribbons_copy[i].items.slice(0, maxRibbonsItems);
          }
        }
      }
    }

    return ribbons;
  }

  async getUserMiddlewareRibbons(node, user_status, callback,user_token=null) {
    let params;
    if(user_token){
        params = {node, user_status, first_page: true, user_token};
    }
    else{
      params = {node, user_status, first_page: true};
    }
    try {
      const task = new LevelUserTask('level-user',params);

      RequestManager.addRequest(task).then((response) => {
        if (typeof callback === 'function') {

          //Separar sección "Mis Canales" y "Mis Contenidos"
          //https://dlatvarg.atlassian.net/browse/STV-5154
          /*console.log('>> getUserMiddlewareRibbons response.response', response.response);

          let components = response.response.components;
          const newItem = {};
          let insertIndex = 0;

          if (components) {
            components.map((item, index) => {
              if (item.id === 'porver') {
                item.subtype = 'vod';

                newItem.id = 'canales_porver';
                newItem.type = 'landscape';
                newItem.subtype = 'canales';
                newItem.showFooter = false;
                newItem.type = 'landscape';
                newItem.items = [];
                insertIndex = index;

              }

            });
            response.response.components.splice(insertIndex, 0, newItem);
          }
          */
          const rcallback  = callback(response.response);

        }
      });
    } catch (e) {
      console.error('[RibbondUtil] getMiddlewareRibbons err', e);
    }
  }

  static parserItem(group) {

    return {
      group_id: group.id,
      cover: group.image_small,
      image_still: group.image_still || group.image_small,
      portrait: group.image_medium,
      title: group.title || '',
      year: group.year || null,
      rating: group.rating_code || null,
      description: group.description,
      provider: group.proveedor_name,
      type: group.live_enabled === '1' ? 'live' : 'vod',
      format_types: group.format_types ? group.format_types.split(',') : group.format_types,
      href: this.getHref(group),
      channel_url: null,
      adUrl: null,
      ads: group.type === 'app_behaviour' ? 'app_behaviour' : null,
      live_enabled: group.live_enabled,
    };
  }

  static getHref(model) {
    let href = null;

    switch (model.type) {
      case 'group':
        href = `/vcard/${model.id || model.group_id}`;
        break;
      case 'node':
        href = `/node/${model.section}`;
        break;
      case 'special':
        href = `/special/${model.special}`;
        break;
      case 'live':
        href = `/player/${model.group_id || model.id}`;
        break;
      default:
        href = '';
        break;
    }

    if (model && model.type === 'app_behaviour') href = '#';

    return href;
  }
  async getRibbons(nodeId, user_status, forceCall) {

    if (!nodeId) {
      return Promise.reject(this.ribbonsFail('[No a valid node id]'));
    }

    if (forceCall === true) {
      ribbonsCache.clear();
      console.log('level api force ajax call');
    }

    let nodeRibbons;
    // Existe en cache?
    nodeRibbons = ribbonsCache.get(nodeId);
    if (nodeRibbons) {
      console.log('[LEVELUTIL] desde caché node: ' + nodeId);
      return Promise.resolve(nodeRibbons);
    }
    console.log('[LEVELUTIL] ajax call node: '  + nodeId);

    const resp = await this.getRibbonsFromApi(nodeId, user_status);
    if(resp) {
      if(resp.error === false) {
        nodeRibbons = this.parseLevelResponses(resp.data);
        // Add to cache, set TTL
        ribbonsCache.set(nodeId, nodeRibbons, settings.duration_of_ribbons_in_cache);
        return Promise.resolve(nodeRibbons);
      }
      else {
        return Promise.reject(resp.dataerror);
      }
    }
    else {
      return Promise.reject(this.ribbonsFail('[No response from method - API]'));
    }
  }

  async getRibbonsFromApi(nodeId, user_status) {

    let response = {
      data: null,
      error: false,
      dataerror: {}
    };

    const levelTask = new LevelTask(nodeId, user_status);
    const levelUserTask = new LevelUserTask(nodeId, user_status);

    let fl = FilterList.getFilter();
    const userSeenTask = new UserSeenTask(fl ? fl.filterlist : '');

    let levelTaskResponse = null;
    let leveluserTaskResponse = null;
    let userSeenTaskResponse = null;

    // IMPORTANTE: sólo en level se regresa error en caso de lo haya,
    // en leveluser y seenuser si hay error, no "se considera" entonces sólo se muestra
    // level
    const level_request = await RequestManager.addRequest(levelTask).then((resp1) => {
      // Is there an error?
      if (resp1.status == "1" || (resp1.response.modules && resp1.response.modules.length == 0)) {
        levelTaskResponse = null;
        response.dataerror = this.ribbonsFail('[Error level request API]');
        response.error = true;
      }
      else {
        levelTaskResponse = resp1;
      }
    }).catch((err) => {
      response.dataerror = this.ribbonsFail('[Error level request API ' + err + ']');
      response.error = true;
    });

    const leveluser_request = await RequestManager.addRequest(levelUserTask).then((resp2) => {
      leveluserTaskResponse = resp2;
    }).catch((err) => {
      // NO se envía error, esperando que sólo level api tenga info
      response.dataerror = this.ribbonsFail('[Error leveluser request API ' + err + ']');
    });

    const userseen_request = await RequestManager.addRequest(userSeenTask).then((resp3) => {
      userSeenTaskResponse = resp3;
    }).catch((err) => {
      // NO se envía error, esperando que sólo level api tenga info
      response.dataerror = this.ribbonsFail('[Error userseen request API ' + err + ']');
    });

    const levelresponses = [];
    levelresponses[0] = levelTaskResponse;
    levelresponses[1] = leveluserTaskResponse;
    levelresponses[2] = userSeenTaskResponse;
    response.data = levelresponses;


    return response;
  }

  async getMusicRibbonsFromApi(service, user, data) {
    let response = {
      data: null,
      error: false,
      dataerror: {}
    };
    const musicTask = new MusicTask(service, user, data);

    await RequestManager.addRequest(musicTask).then((res) => {
      // transform music api response to homologue ribbons
      response = this.transformMusicRibbons(res);
    }).catch((err) => {
      response.dataerror = this.ribbonsFail('[Error music request API ' + err + ']');
    });
    return response;
  }

  async getMusicListFromApi(service, user, data) {
    let response = {
      data: null,
      error: false,
      dataerror: {}
    };
    const musicTask = new MusicTask(service, user, data);
    await RequestManager.addRequest(musicTask).then((res) => {
      response = res;
    }).catch((err) => {
      response.dataerror = this.ribbonsFail('[Error music request API ' + err + ']');
    });
    return response;
  }

  transformMusicRibbons(musicCarousels) {
    let ribbons = {};
    const musicRibbons = musicCarousels.ribbons;
    const type = Number(musicCarousels.type);
    let playlistFreeId;
    try {
      playlistFreeId = musicRibbons.freePlaylists.elements[0] !== undefined ?
          musicRibbons.freePlaylists.elements[0].id : "0000000";
    } catch (e) {
      playlistFreeId = "0000000";
    }

    if(type === 2) {
      delete musicRibbons['freePlaylists'];
      delete musicRibbons['newsRadios'];
      delete musicRibbons['genresRadios'];
      delete musicRibbons['artistsRadios']
    }

    if(type === 1){
      delete musicRibbons['highlightedPlaylists'];
      delete musicRibbons['singlesReleases'];
      delete musicRibbons['albumsReleases'];
      delete musicRibbons['songsReleases'];
      delete musicRibbons['topSongs'];
      delete musicRibbons['recommendations'];
      delete musicRibbons['topAlbums'];
      delete musicRibbons['moodAndMoments'];
      delete musicRibbons['highlights'];
    }

    delete musicRibbons['isFirstTime'];
    delete musicRibbons['djs'];
    delete musicRibbons['events'];

    ribbons = Object.keys(musicRibbons).filter((el) => musicRibbons[el].elements.length > 0 ).map((rkey, index) => {

      const musicRibbon = musicRibbons[rkey];
      const ribbon = {
        components: {},
        name: rkey,
        ribbonindex: index,
        ribbontitles: {
          extrasmall: musicRibbon.title,
          small: musicRibbon.title,
          large: musicRibbon.title,
          medium: musicRibbon.title,
        },
        type: 'carousel',
        type2: rkey === 'banners' ? 'Highlight' : rkey === 'artistsRadios' ? 'circle' : 'square',
        url: 'musicLocal',
        elements: this.transformMusicRibbonsElements(musicRibbon.elements, rkey, index)
      }
      return ribbon;
    });
    return {ribbons, playlistFreeId, topSongs: musicRibbons['topSongs'] || []};
  }

  transformMusicRibbonsElements(elements, kind, index){
      let ribbonElements = [];

      switch (kind){
        case 'banners':
          ribbonElements = elements.filter(c => c.kind !== 'link')
            .filter(c => c.kind !== 'radioStation')
            .filter(c => c.kind !== 'radioGenre')
            .filter(c => c.kind !== 'radio')
            .map((card) => {
             return {
               crest: null,
               title: card.title ? Utils.htmlDecode(card.title) : '',
               cover: card.image,
               image_background: card.image,
               image_highlight: card.image,
               image_large: card.image,
               image_medium: card.image,
               image_small: card.image,
               url: `${card.kind}/${card.id}`,
               group_id: kind,
               index: index,
               description: card.title ? `${card.title}` : '',
               rating_code: '',
               music_class: kind,
               href: `/${card.kind}/${card.id}`,
               type: card.kind.replace(/\b\w/g, l => l.toUpperCase()),
               musicData: card,
               artist: card.artists ? card.artists : '',
               tracks: card.tracks ? `${card.tracks} canciones` : '',
               duration: card.duration ? card.duration : '',
               followers: card.followers ? `${card.followers} seguidores` : '',
               record: card.record ? card.record : '',
               year: card.year ? card.year : '',
             }
          });
          break;
        case 'topSongs':
          ribbonElements = elements.map((card) => {
            return {
              crest: card.artist ? card.artist.join(' ,') : '',
              title: card.name ? card.name : '',
              cover: card.image,
              image_background: card.image,
              image_highlight: card.image,
              image_large: card.image,
              image_medium: card.image,
              image_small: card.image,
              url: '',
              group_id: kind,
              index: index,
              description: card.title ? `${card.title}` : '',
              rating_code: '',
              music_class: kind,
              href: `#`,
              type: 'Song',
              musicData: card,
            }
          });
          break;
        case 'artistsRadios':
          ribbonElements = elements.map((card) => {
            return {
              crest: null,
              title: card.artist ? card.artist : '',
              cover: card.image,
              image_background: card.image,
              image_highlight: card.image,
              image_large: card.image,
              image_medium: card.image,
              image_small: card.image,
              url: `${card.kind}/${card.id}`,
              group_id: kind,
              index: index,
              description: card.title ? `${card.title}` : '',
              rating_code: '',
              music_class: kind,
              href: `/radioList/artist/${card.id}`,
              type: 'radios',
              artist: true,
              musicData: card,
            }
          });
          break;
        case 'genresRadios':
          ribbonElements = elements.map((card) => {
            return {
              crest: '',
              title: card.name ? card.name : '',
              cover: card.image,
              image_background: card.image,
              image_highlight: card.image,
              image_large: card.image,
              image_medium: card.image,
              image_small: card.image,
              url: `${card.kind}/${card.id}`,
              group_id: kind,
              index: index,
              description: card.title ? `${card.title}` : '',
              rating_code: '',
              music_class: kind,
              href: `/radioList/genre/${card.name}`,
              type: 'radios',
              genre: true,
              musicData: card,
            }
          });
          break;
        case 'newsRadios':
        case 'topsRadios':
          ribbonElements = elements.filter(e => e.encoding === 'MP3').map((card) => {
            return {
              crest: '',
              title: card.name ? card.name : '',
              cover: card.image,
              image_background: card.image,
              image_highlight: card.image,
              image_large: card.image,
              image_medium: card.image,
              image_small: card.image,
              url: `${card.kind}/${card.id}`,
              group_id: kind,
              index: index,
              description: card.title ? `${card.title}` : '',
              rating_code: '',
              music_class: kind,
              href: `#`,
              type: 'Radio',
              musicData: card,
              dial: card.dial ? card.dial : '',
              band: card.band ? card.band : '',
            }
          });
          break;
        case 'highlights':
        case 'superhighlight_title':
            ribbonElements = elements.map((card) => {
              return {
                crest: '',
                title: card.title ? card.title : '',
                cover: card.image,
                image_background: card.image,
                image_highlight: card.image,
                image_large: card.image,
                image_medium: card.image,
                image_small: card.image,
                url: `${card.kind}/${card.id}`,
                group_id: kind,
                index: index,
                description: card.title ? `${card.title}` : '',
                rating_code: '',
                music_class: kind,
                href: `/${this.getMusicUrl(card.entidade)}/${card.id}`,
                type: card.entidade.replace(/\b\w/g, l => l.toUpperCase()),
                musicData: card,
                artist: card.artistsNames ? card.artistsNames : '',
                tracks: card.tracks ? `${card.tracks} canciones` : '',
                duration: card.duration ? card.duration : '',
                followers: card.followers ? `${card.followers} seguidores` : '',
                record: card.record ? card.record : '',
                year: card.year ? card.year : '',
              }
            });
            break;
        default:
          ribbonElements = elements.map((card) => {
            return {
              crest: '',
              title: card.title ? card.title : '',
              name: card.name ? card.name : '',
              cover: card.image,
              image_background: card.image,
              image_highlight: card.image,
              image_large: card.image,
              image_medium: card.image,
              image_small: card.image,
              url: `${card.kind}/${card.id}`,
              group_id: kind,
              index: index,
              description: card.title ? `${card.title}` : '',
              rating_code: '',
              music_class: kind,
              href: `/${this.getMusicUrl(kind)}/${card.id}`,
              type: this.getMusicUrl(kind).replace(/\b\w/g, l => l.toUpperCase()),
              musicData: card,
              artist: card.artistsNames ? card.artistsNames : '',
              tracks: card.tracks ? `${card.tracks} canciones` : '',
              duration: card.duration ? card.duration : '',
              followers: card.followers ? `${card.followers} seguidores` : '',
              record: card.record ? card.record : '',
              year: card.year ? card.year : '',
            }
          });
          break;
      }

    return ribbonElements;
  }

  getMusicUrl(kind) {
    switch (kind) {
      case 'albumsReleases':
      case 'topAlbums':
      case 'highlights':
      case 'recommendations':
      case 'singlesReleases':
        return 'album';
      case 'newsRadios':
      case 'topRadios':
      case 'genresRadios':
        return 'radios';
      default:
        return 'playlist';
    }
  }

  ribbonsFail(err) {
    let error = { msg: 'error_generic_playout',  type: 'error_generic_playout', strerr: err };

    return error;
  }

  async parseLevelResponses(responses) {

    let levelRes = responses[0];
    let leveluserRes = responses[1];
    let seenRes = responses[2];

    /*
    //Sólo para testing y hardcodeo
    levelRes = this.testLevelAPI();
    leveluserRes = this.testLeveluserAPI();
    seenRes = this.testSeenuserAPI();
    */

    let i, j, k;

    // leveluserRes y seenRes pueden ser nulos, al menos levelRes debería traer respuesta
    if(levelRes) {
      if(leveluserRes && seenRes && leveluserRes.response) {
        for (i = 0; i < leveluserRes.response.modules.module.length; i++) {
          for (j = 0; j < levelRes.response.modules.module.length; j++) {
            if (levelRes.response.modules.module[j].name == leveluserRes.response.modules.module[i].name)
            {
              for (k = 0; k < levelRes.response.modules.module[j].components.component.length; k++)
              {
                if (levelRes.response.modules.module[j].type == "carrouselrecommended1" && levelRes.response.modules.module[j].components.component[k].name == "carrousel")
                {
                  levelRes.response.modules.module[j].components.component[k].properties =
                    leveluserRes.response.modules.module[i].components.component[0].properties;
                  if (seenRes.msg != "ERROR")
                  {
                    if (seenRes.response.groups.length > 0 && seenRes.response.groups.length >= levelRes.response.modules.module[j].components.component[k].properties.offset)
                    {
                      let offset = levelRes.response.modules.module[j].components.component[k].properties.offset;
                      //Validación en caso que el offset no esté dentro del rango de la colección de seen
                      if (offset && offset < seenRes.response.groups.length)
                      {
                        let vGroup_id = seenRes.response.groups[offset].id;
                        levelRes.response.modules.module[j].components.component[k].properties.url += "&group_id=" + vGroup_id;
                        levelRes.response.modules.module[j].components.component[k].properties.seen = seenRes.response.groups[levelRes.response.modules.module[j].components.component[k].properties.offset];
                      }
                      else
                      {
                        console.info('** El offset es mayor que la colección en seen y no se pinta el ribbon recomendados');
                      }
                    }
                  }
                }
                else if (levelRes.response.modules.module[j].components.component[k].name == "carrousel") {
                  levelRes.response.modules.module[j].components.component[k].properties =
                    leveluserRes.response.modules.module[i].components.component[0].properties;
                }
                else if (levelRes.response.modules.module[j].components.component[k].name == "carrouselizq") {
                  levelRes.response.modules.module[j].components.component[k].properties =
                    leveluserRes.response.modules.module[i].components.component[0].properties;
                }
                else if (levelRes.response.modules.module[j].components.component[k].name == "carrouselder") {
                  levelRes.response.modules.module[j].components.component[k].properties =
                    leveluserRes.response.modules.module[i].components.component[1].properties;
                }
              }
            }
          }
        }
      }
    }

    // Después de ajustar con leveluser y seenuser
    return this.__getRibbonUrls(levelRes.response.modules.module);
  }

  __getRibbonUrls(ribbons) {
    var ret = [];

    let i, j;
    let ct = 1;
    for(i = 0; i < ribbons.length; i++) {
      let unribbon = ribbons[i];

      let car_url = this.__setUrl(unribbon);
      if(car_url) {
        for(j = 0; j < car_url.length; j++) {
          ret.push(car_url[j]);
        }
      }
    }

    return ret;
  }

  __setUrl(data) {
    let ret = [];

    if (typeof (data) === 'undefined') {
      return null;
    }

    let component = data.components.component;

    let url = this.__getMfwUrl(component);
    let url2 = null;

    data.type2 = this.__getMfwType(component);
    if (!url) {
      url = this.__getMfwUrlName(component, 'carrouselizq');
      data.type2 = this.__getMfwTypeName(component, 'carrouselizq');
      url2 = this.__getMfwUrlName(component, 'carrouselder');
    }

    if (!url) {
      return null;
    }

    data.url = url;
    data.ribbontitles = this.__getMfwRibbonTitle(component);
    ret.push(data);
    if (url2) {
      let data2 = {}
      data2.components = data.components;
      data2.name = data.name;
      data2.type = "carrouseldoble";
      data2.type2 = this.__getMfwTypeName(component, 'carrouselder');
      data2.url = url2;
      data2.ribbontitles = this.__getMfwRibbonTitle(data2.components.component);

      ret.push(data2);
    }

    return ret;
  }

  __getMfwUrl(component) {
    let nameT = "carrousel";
    let i;
    for (i = 0; i < component.length; i++) {
      if (nameT == component[i].name) {
        let properties = component[i].properties;
        return properties.url;
      }
    }
  }

  __getMfwUrlName(component, name) {
    let nameT = name;
    let i;
    for (i = 0; i < component.length; i++) {
      if (nameT == component[i].name) {
        let properties = component[i].properties;
        return properties.url;
      }
    }
  }

  __getMfwType(component) {
    let nameT = "carrousel";
    let i;
    for (i = 0; i < component.length; i++) {
      if (nameT == component[i].name) {
        return component[i].type;
      }
    }
  }

  __getMfwTypeName(component, name) {
    let nameT = name;
    let i;
    for (i = 0; i < component.length; i++) {
      if (nameT == component[i].name) {
        return component[i].type;
      }
    }
  }

  __getMfwRibbonTitle(component) {
    let titles = {};
    titles.extrasmall = '';
    titles.large = '';
    titles.medium = '';
    titles.small = '';

    let nameT = "header";
    let i;
    for (i = 0; i < component.length; i++) {
      if (nameT == component[i].name) {
        let properties = component[i].properties;
        titles.extrasmall = properties.extrasmall ? properties.extrasmall : '';
        titles.large = properties.large ? properties.large : '';
        titles.medium = properties.medium ? properties.medium : '';
        titles.small = properties.small ? properties.small : '';
      }
    }

    return titles;
  }
}

export default RibbonsUtil
