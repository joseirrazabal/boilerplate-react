import Metadata from "../requests/apa/Metadata";
import DeviceStorage from "../components/DeviceStorage/DeviceStorage";
import Translations from '../requests/apa/Translator';
import Asset from "../requests/apa/Asset";
import moment from 'moment';
import Utils  from './Utils';
import 'moment/locale/pt-br'

const DEFAULT_SEARCHPRIORITY = JSON.stringify({
  "argentina": {
    "search_predictive_quantity": {
      "suggests": "1",
      "movies": "5",
      "series": "5",
      "live_channels": "5",
      "events": "5",
      "genres": "1",
      "talents": "5",
      "users": "5",
      "unavailables": "0"
    },
    "search_full_quantity": {
      "suggests": "1",
      "movies": "40",
      "series": "40",
      "live_channels": "40",
      "events": "40",
      "genres": "1",
      "talents": "40",
      "users": "40",
      "unavailables": "0"
    },
    "searchPriority": [
      "suggests",
      "live_channels",
      "hbo_live_channel",
      "fox_live_channel",
      "epgs_now",
      "epgs_future",
      "epgs_past",
      "movies",
      "series",
      "fox_movie",
      "fox_serie",
      "hbo_movie",
      "hbo_serie",
      "crackle_movie",
      "crackle_serie",
      "noggin_movie",
      "noggin_serie",
      "talents",
    ]
  },
  "default": {
    "search_predictive_quantity": {
      "suggests": "1",
      "movies": "5",
      "series": "5",
      "live_channels": "5",
      "events": "5",
      "genres": "1",
      "talents": "5",
      "users": "5",
      "unavailables": "0"
    },
    "search_full_quantity": {
      "suggests": "1",
      "movies": "40",
      "series": "40",
      "live_channels": "40",
      "events": "40",
      "genres": "1",
      "talents": "40",
      "users": "40",
      "unavailables": "0"
    },
    "searchPriority": [
      "suggests",
      "movies",
      "series",
      "fox_movie",
      "foxv3_movie",
      "fox_serie",
      "foxv3_serie",
      "hbo_movie",
      "hbo_serie",
      "crackle_movie",
      "crackle_serie",
      "noggin_movie",
      "noggin_serie",
      "live_channels",
      "fox_live_channel",
      "foxv3_live_channel",
      "hbo_live_channel",
      "epgs_future",
      "epgs_now",
      "epgs_past",
      "genres",
      "talents",
      "users"
    ]
  }
});

const SEARCH_FIELD = Object.freeze({
  Talent: 'TALENT',
  Genre: 'GENRE',
});

const TALENTS = Object.freeze({
  AMCO: 'talents',
  GRACENOTE: 'external_talents',
});

const GRACENOTE = 'gracenote';

class Search {

    static getSearchField() {
      return SEARCH_FIELD;
    }

    static parserFormatTypes(formatType) {
        if(!Array.isArray(formatType) && formatType) {
            return formatType.split(',');
        }
    }

    static getSearchPriority(){

      const region = DeviceStorage.getItem('region');
      const externalProvider = Utils.getAPARegionalized('external_metadata', 'provider', '');
      const externalProviderIsEnabled = Utils.getAPARegionalized('external_metadata', 'enabled', false);
      let searchPriority = Metadata.get('search_priority', DEFAULT_SEARCHPRIORITY);

      searchPriority = JSON.parse(searchPriority);

      let result = searchPriority[region] || searchPriority['default'];

      if (externalProvider === GRACENOTE && externalProviderIsEnabled) {
        result.searchPriority = result.searchPriority.map((obj) => {          
          return obj === TALENTS.AMCO ? TALENTS.GRACENOTE : obj;
        })
      }

      return result;
    }


  static parserData(data, src) {
    
        Object.keys(data).map((prop,) => {
          let groups = data[prop];

            if(Array.isArray(groups)) {
              groups.filter((obj) => obj ).map((it) => {  
                  it.src = it.live_enabled == 1 ? `/player/${it.id}` : `${src}/${it.id}`;
                  it.cover = data.typeCarousel==='highlight' ? it.image_small : it.image_medium;
                  it.provider = it.proveedor_name != 'AMCO' ? it.proveedor_name : 'default';
                  it.format_types = this.parserFormatTypes(it.format_types) || [];
                  it.type = it.live_enabled == 1 ? 'live' : 'vod';        
                })
            }

        });
    
        return data;
    }


    static orderPriority(suggest){
      const searchPriority = this.getSearchPriority();
      
      let founds={};
      let keys=Object.keys(suggest);
      searchPriority.searchPriority.forEach((it)=>{
        keys.forEach((_it)=>{
          if(it==_it){
            founds[_it]=suggest[_it];
          }
        });

      });
      return founds;
    }

  static getQuantity() {

    /** Para AAF deberá tomarse la llave search_priority.default.search_full_quantity.<nodo> para obtener los quantity de las categorías.
    Ejemplo:
    [Endpoint]/services/search/predictive?value=dead&suggest=1&movies=40&series=40&unavailables=0&live_channels=40&events=40&genres=1&talents=40&users=40&api_version=v5.4&format=json
    */

    const searchPriority = this.getSearchPriority();
    const searchPredictiveQuantity = searchPriority.search_full_quantity ? searchPriority.search_full_quantity : {};
   
    return searchPredictiveQuantity;
      
    }

    static modifyType(data, typeCarousel, keyApa) {      

        data['typeCarousel'] = typeCarousel;
        data['keyApa'] = `predictSearch_${keyApa}_label`;        
      
        return data;
    }

    /*to parser EPG content */
    static parserEPG(data, key, label) {
      data = this.modifyType(data, 'epg_event', key); // return the typeCarousel and keyApa
        Object.keys(data).map((prop, i) => {
            let epg = data[prop];

            if (Array.isArray(epg)) {
                epg.map((it) => {
                    it.cover = it.ext_eventimage_name || it.channel_image;
                    it.date_begin = it.begintime;
                    it.date_end = it.endtime;
                    it.title = it.title || it.name;
                    it.label = this.getDurationDate(label, it.begintime, it.endtime);
                    const eventData = JSON.stringify({ event: it });
                    it.src = `/epg/${it.group_id}?eventData=${encodeURI(eventData)}`;
                    if(it.channel_group && it.channel_group.common) {
                        it.provider = it.proveedor_name != 'AMCO' ? it.proveedor_name: 'default';
                      it.format_types = this.parserFormatTypes(it.channel_group.common.format_types);                      
                        it.type = it.channel_group.common.live_enabled == 1 ? 'live' : 'vod';
                    }
                })
            }
        });
    }

    static handlerContent() {
        const users = (data, key) => {
            data = this.modifyType(data, 'user-info', key); // return the typeCarousel and keyApa

            Object.keys(data).map((prop, i) => {
                let users = data[prop];

                if(Array.isArray(users)) {
                    users.map((it) => {
                      it.src = `socialProfile/${it.id}`;
                      let socialImage = '';
                      if(it && it.metadatas) {
                          it.title = it.metadatas.name || '';

                          socialImage = `https://graph.facebook.com/${it.metadatas.facebookId}/picture?type=large`;
                          const validateImage = it.metadatas.facebookId || it.metadatas.facebookID ? socialImage: '';
                          it.cover = validateImage;
                          const gameId = it.games && it.games.userActions ? Object.keys(it.games.userActions)[0] : '0';                          
                          const points = getPoints(it, gameId);
                          const level = getLevel(it, gameId);
                        const imgStar = `<div class="levels-points_img"><img src=${Asset.get('social_star')} width="100%"/></div><div class="points">Puntos <b>${points}</b></div>`;
                        it.label = `<div class="followers">${it.followers} Seguidores </div><div class="level"> Nivel <b>${level}</b></div>${imgStar}`;
                      }
                      
                    })
                }

            });

            return data;
        }

      const getLevel = (it, id) => {

        const games = it.gamesArray && it.gamesArray.find && it.gamesArray.find((element) => {
          return element.id === id
        }) || null;


        return games && games.level && games.level.number ? games.level.number : it.metadatas && it.metadatas.levelNumber ? it.metadatas.levelNumber : '0';
      }

      const getPoints = (it, id) => {

        const games = it.gamesArray && it.gamesArray.find && it.gamesArray.find((element) => {
          return element.id === id
        }) || null;

        return games && games.points ? games.points : it.metadatas && it.metadatas.points ? it.metadatas.points : '0';
      }

        const genres = (data, key) => {
          data = this.modifyType(data, 'text', key); // return the typeCarousel and keyApa

          Object.keys(data).map((prop, i) => {
            let genres = data[prop];

            if (Array.isArray(genres)) {
              genres.map((it) => {                             
                it.src = `talent/${SEARCH_FIELD.Genre}/${it.name}/${false}/`;
                it.typeContent = true;
              })

            }

          });

          return data;
        }

        const talents = (data, key) => {
            data = this.modifyType(data, 'user-profile', key); // return the typeCarousel and keyApa

            Object.keys(data).map((prop, i) => {
                let talents = data[prop];

                if(Array.isArray(talents)) {
                    talents.map((it) => {

                      let chunks;
                      let lastName;
                      let firstName = '';
                      if(it.name.split(' ')) { chunks = it.name.split(' '); }

                      if(Array.isArray(chunks)) {
                          chunks.map((it, i) => {

                              if(i == chunks.length - 1) { lastName = it;}
                              else firstName += it;

                          })
                      }

                      const newName = `${lastName} ${firstName}`;

                      it.title = it.name;
                      it.src = `talent/${it.id}/${newName}/${false}/`;
                      it.typeContent = true;
                    })

                }

            });

            return data;
        }
       
        const external_talents = (data, key) => {
          data = this.modifyType(data, 'user-profile', key); // return the typeCarousel and keyApa

          Object.keys(data).map((prop, i) => {
              let talents = data[prop];
              if(Array.isArray(talents)) {
                  talents.map((it) => {

                    let chunks;
                    let lastName;
                    let firstName = '';
                    if(it.first_name && typeof it.first_name ==='string' && it.first_name.split(' ')) { 
                      chunks = it.first_name.split(' ');
                   }

                    if(Array.isArray(chunks)) {
                        chunks.map((it, i) => {
                            if(i == chunks.length - 1) { lastName = it;}
                            else firstName += it;
                        })
                    }
                    const newName = `${it.last_name ? it.last_name:''}, ${it.first_name}`;

                    it.title = it.first_name + ' ' + it.last_name;
                    it.src = `talent/${it.internal_ids[0]}/${newName}/${false}/`;
                    it.typeContent = true;
                    it.cover=it.image ? it.image+'?impolicy=resize&vwidth=88' : null;
                  })

              }

          });

          return data;
      }

      const epgs_future = (data, key) => {    
        const label = Translations.get("predictSearch_event_future_sublabel", "Disponible");
        data = this.parserEPG(data, key, label);          
          return data;
        }

      const epgs_past = (data, key) => {
        const label = Translations.get("predictSearch_event_past_sublabel", " ");
        data = this.parserEPG(data, key, label); 
            return data;

        }

      const epgs_now = (data, key) => {
        const label = Translations.get("ao vivo · ");
        data = this.modifyType(data, 'epg_event', key); // return the typeCarousel and keyApa
            Object.keys(data).map((prop, i) => {
                let epg = data[prop];
                console.log('fer epg', epg)
                if(Array.isArray(epg)) {
                    epg.map((it) => {
                        it.cover = it.ext_eventimage_name;
                        it.src = `/player/${it.group_id}`;

                      if(it.channel_group && it.channel_group.common) {
                            it.provider = it.proveedor_name != 'AMCO' ? it.proveedor_name: 'default';
                            it.format_types = this.parserFormatTypes(it.channel_group.common.format_types);
                            it.type = it.channel_group.common.live_enabled == 1 ? 'live' : 'vod';
                            it.title = it.title || it.name;
                            it.label = this.getDurationDate(label, it.begintime, it.endtime);
                        }
                    })
                }

            });
            return data;

        }


        const suggests = (data, key) => {

          data = this.modifyType(data, 'highlight', key); // return the typeCarousel and keyApa
          
          const src = `/vcard`;
          data = this.parserData(data, src);
          return data;
        }

        const defaultContent = (data, key) => {
          
            data = this.modifyType(data, 'portrait', key); // return the typeCarousel and keyApa

            const src = `/vcard`;
          data = this.parserData(data, src);


          for (var [key, value] of Object.entries(data)) {          
            if (Array.isArray(data[key]) && value) {              
              data[key] = value.filter((obj) => obj );
            }            
          }
       
          return data;          
        }

        return {
            users: users,
            talents: talents,
            genres: genres,
            defaultContent: defaultContent,
            epgs_future: epgs_future,
            epgs_past: epgs_past,
            epgs_now: epgs_now,
            suggests:suggests,
            external_talents: external_talents
        }

    }

    static parserSections(obj) {
        const parent = Object.assign({}, obj);

        let parser = {};
        Object.keys(parent).map((prop, i) => {
            const child = parent[prop];

            Object.keys(child).map((__prop, __i) => {
                if(Array.isArray(child[__prop])) parser[prop] = child;
                else {
                    const grandSon = child[__prop];

                    Object.keys(grandSon).map((keyGrandson, i) => {
                        const newProperty = `${prop}_${keyGrandson}`;

                        if(!parser[newProperty]) {
                            parser[newProperty] = {};
                            parser[newProperty][keyGrandson] = grandSon[keyGrandson];
                        }

                    })

                }
            })

        })

        return parser;
    }

    static handler(obj) {
        const placeholder = '';
        const handle = this.handlerContent(); //Controla contenidos
        const parent = Object.assign({}, obj);

        Object.keys(parent).map((prop, i) => {
          
            let child = parent[prop];
            if(typeof(handle[prop]) === 'function')
              child = handle[prop](child, prop)
            else
              child = handle['defaultContent'](child, prop);

        })


        return obj;
    }

    static getSuggest(suggest) {
        let sugg = [];

        if(typeof suggest[0] == 'object') {
            if(typeof suggest[0] == 'object' && !Array.isArray(suggest[0]) && !Utils.isEmpty(suggest[0])) {
                if(!Array.isArray(suggest[0]['common'])) {
                    sugg.push(suggest[0]['common']);
                    sugg.map((it) => {
                        it.provider = it.proveedor_name;
                        it.type = it.live_enabled == 1 ? 'live' : 'vod';
                    })
                }
                else {
                    sugg = suggest[0]['common'];
                    sugg.provider = sugg.proveedor_name;
                    sugg.type = sugg.live_enabled == 1 ? 'live' : 'vod';
                }
            }

        }

        return sugg;
    }

  static getDurationDate(label, beginTime, endTime) {

    const dateFormat = "YYYY/MM/DD HH:mm:ss";
       
    if (moment(beginTime, dateFormat).isValid() && moment(endTime, dateFormat).isValid()) {
      let momentBeginTime = moment(beginTime, dateFormat);
      let momentEndTime = moment(endTime, dateFormat);
      // - ${momentEndTime.format(" [termina às] HH:mm")
      let q = momentBeginTime.locale('pt-br').calendar(null, {
          lastDay : '[ontem às] HH',
          //sameDay : '[Today fuck] HH:mm',
          nextDay : '[amanhã às] HH',
          // lastWeek : '[last] dddd [às] LT',
          nextWeek : '[dia] DD/MM [às] HH',
          sameElse : 'L',
          sameDay: function (now) {
            if (this.isBefore(now)) {
              return '[ao vivo · termina às] HH';
            } else {
              return '[começa hoje às] HH';
            }
          }
        });
        let result = `${q}h`;
        return result.trim();
    }

    return "";

  }
}

export default Search;
