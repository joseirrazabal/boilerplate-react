import { parseString, Builder }        from 'xml2js';

class Utils {
  static xmlToObject(xml) {
    let object = {};
    parseString(xml,{
      charkey       : '_content',
      attrkey       : '_attributes',
      explicitRoot  : false,
      explicitArray : false
    }, (fail, parsed) => {
      object = parsed;
    });
    return object;
  }

  static getProtectionData(data) {
    let protectionObject = {};
    if (data instanceof Object && data.hasOwnProperty('Protection')) {
      const {ProtectionHeader} = data.Protection;
      const protectionString = Buffer(ProtectionHeader._content, 'base64').toString('utf16le').match(/<.*>/).pop();
      protectionObject = Utils.xmlToObject(protectionString);
    }
    return protectionObject;
  }

  static createPlayReadyInitiator(header, Content, CustomData) {
    return {
      PlayReadyInitiator: {
        _attributes: {
          xmlns: 'http://schemas.microsoft.com/DRM/2007/03/protocols/'
        },
        LicenseAcquisition: {
          Header: {
            WRMHEADER: {
              _attributes: {
                xmlns:'http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader',
                version: '4.0.0.0',
              },
              DATA: Object.assign({}, {
                PROTECTINFO: {
                  KEYLEN: "16",
                  ALGID: "AESCTR"
                }
              }, header)
            }
          },
          CustomData,
          Content
        }
      }
    }
  }

  static createXMLFromObject(object) {
    return new Builder({
      attrkey : '_attributes',
      xmldec  : {
        version: '1.0',
        encoding: 'utf-8'
      }
    }).buildObject(object);
  }

  static setCacheHeader(res, type='no-cache', timeCache=0, timeEdge=0) {
    switch (type) {
      case 'static':
        res.set('Cache-Control', 'max-age=900');
        res.set('Edge-Control', 'max-age=7200');
        break;
      case 'usercontent':
        res.set('Cache-Control', 'max-age=300');
        res.set('Edge-Control', 'max-age=600');
        break;
      case 'min-cache':
        res.set('Cache-Control', 'max-age=60');
        res.set('Edge-Control', 'max-age=120');
        break;
      case 'custom':
        res.set('Cache-Control', `max-age=${timeCache}`);
        res.set('Edge-Control', `max-age=${timeEdge}`);
        break;
      case 'no-cache':
        res.set('Cache-Control', 'max-age=0');
        res.set('Edge-Control', 'max-age=0');
      default:
        res.set('Cache-Control', 'max-age=0');
        res.set('Edge-Control', 'max-age=0');
    }
    return res;
  }
}


export default Utils;
