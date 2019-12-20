import Metadata from './../requests/apa/Metadata';
import Asset from './../requests/apa/Asset';
import Translator from './../requests/apa/Translator';
import DeviceStorage from './../components/DeviceStorage/DeviceStorage';

class Parser {
  static parserModules(response) {
    if (response.response && response.response.modules) {
        return response.response.modules;
    }

    return {};
  }

  static parserList(response) {
    if (response.response && response.response.highlight) {
        return response.response.highlight;
    }
    if (response.response && response.response.groups) {
      return response.response.groups;
    }

    return [];

        if (response.response && response.response.groups) {
            response.response.parser = 'parserList';
            response.response.groups.map((item, index, array) => {

            });
            return response.response.groups;
        }

        return {};

    }

    static parserListForRibbon(response, state){
        let list = response.response.groups.map(function(json){
            let swapArray = [];
            let label = (state !== 'myRecords') ? '' : json.title;
            swapArray = { 
                group_id: json.id, 
                id: json.id, 
                label: label, 
                href: `vcard/${json.id}`, 
                clickHandler: () => { console.log(json.id + ' clicked') }, 
                cover: json.image_small, 
                data_background: json.image_background
            };
            if(String(state) === 'myChannels') swapArray.href = `player/${json.id}`;
            return swapArray;
        });

        return list;
    }

    static parseSpecial(response) {

        let parser = {};
        parser.parser = 'parseSpecial';

        if (response.response && response.response.modules && response.response.modules.module) {
            const ribbons = response.response.modules.module;
            ribbons.forEach((item, index, array) => {
                parser[item.name] = {};
                parser[item.name].type = item.type;
                let components = item.components.component;
                components.forEach((citem, cindex, carray) => {
                    switch (citem.name) {
                        case 'background':
                            parser[item.name][citem.name] = citem.properties.imglarge;
                            break;
                        case 'header':
                            parser[item.name][citem.name] = citem.properties.medium;
                            break;
                        case 'carrousel':
                            parser[item.name][citem.name] = {};
                            parser[item.name][citem.name].id = citem.properties.id;
                            parser[item.name][citem.name].type = citem.properties.type;
                            parser[item.name][citem.name].url = citem.properties.url;
                            break;
                        default:
                    }
                });

            });
        }
        return parser;
    }

    /**
     * Regresa un arreglo de objetos para las chapitas
     * @param {string} region        mexico|colombia|peru|...
     * @param {string} suscription   susc|no_susc|anonymous
     * @param {string} provider      FOX|FOX v3|HBO|NOGGIN|default
     * @param {string} format_types  est,ppe,free,susc
     * @param {string} live_enabled  0|1
     */
    static parserBadges(provider, format_types, live_enabled) {

        if (!format_types) {
            return [];
        }

        let config = JSON.parse(Metadata.get('providers_label_configuration'));
        let region = this.getRegion();
        let suscription = this.getSuscription();

        let results = [];
        try {
            if (!config[region]) {
                region = 'default';
            }

            if (config[region][suscription] && !config[region][suscription][provider]) {
                provider = 'default';
            }

            let arrFormatTypes = format_types.split(',');

            arrFormatTypes.map((formatType, aIndex) => {
                let vidoType = live_enabled && live_enabled == 1 ? "live" : "vod";
                if (config[region][suscription][provider][formatType] && config[region][suscription][provider][formatType][vidoType]) {
                    let badges = config[region][suscription][provider][formatType][vidoType];
                    badges.map((keys, index) => {

                        let style = {};
                        let result = {
                            type: keys.type,
                        };

                        if (keys.type === 'text') {
                            result.label = Translator.get(keys.text, '*Pendiente');
                        } else if (keys.type === 'image') {
                            result.src = Asset.get(keys.url);
                        }

                        const ignore = ['type', 'text', 'url'];

                        for (var key in keys) {
                            if (ignore.indexOf(key) === -1) {
                                if (key === 'backgroundColor') {
                                    if (keys[key].length > 6) {
                                        var alpha = parseFloat(parseInt((parseInt(keys[key].substring(1, 3), 16) / 255) * 1000) / 1000);
                                        style.opacity = alpha;
                                        style.backgroundColor = "rgb(" + parseInt(keys[key].substring(3, 5), 16) + "," +
                                            parseInt(keys[key].substring(5, 7), 16) + "," +
                                            parseInt(keys[key].substring(7, 9), 16) + ")";
                                    }
                                }
                                else {
                                    style[this.parserBadgesCssProperties(key)] = keys[key];
                                }
                            }
                        }
                        result.style = style;
                        results.push(result);
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }

        return results;
    }

    static parserBadgesCssProperties(prop) {
        switch (prop) {
            case 'gravity':
                return 'float'
            case 'textColor':
                return 'color'
            case 'textSize':
                return 'fontSize'
            default:
                return prop;
        }
    }

    //TODO: Implementar
    static getRegion() {
        return DeviceStorage.getItem('region') || 'mexico';
    }

    //TODO: Implementar
    static getSuscription() {
        return 'anonymous';
    }
}

export default Parser
