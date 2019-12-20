import Utils from '../Utils';
import Metadata from '../../requests/apa/Metadata';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';

class UtilsClaroPagos {
  constructor() {

  }
  static getProvincesCode(){
    const metadataKey = 'provinces_codes';
    const defaultValue = [
          { "name": "Aguascalientes", "code": "AGU" },
          { "name": "Baja California", "code": "BCN" },
          { "name": "Baja California Sur", "code": "BCS" },
          { "name": "Campeche", "code": "CAM" },
          { "name": "Chiapas", "code": "CHP" },
          { "name": "Chihuahua", "code": "CHH" },
          { "name": "Coahuila", "code": "COA" },
          { "name": "Colima", "code": "COL" },
          { "name": "Ciudad de México", "code": "CMX" },
          { "name": "Durango", "code": "DUR" },
          { "name": "Guanajuato", "code": "GUA" },
          { "name": "Guerrero", "code": "GRO" },
          { "name": "Hidalgo", "code": "HID" },
          { "name": "Jalisco", "code": "JAL" },
          { "name": "México", "code": "MEX" },
          { "name": "Michoacán", "code": "MIC" },
          { "name": "Morelos", "code": "MOR" },
          { "name": "Nayarit", "code": "NAY" },
          { "name": "Nuevo León", "code": "NLE" },
          { "name": "Oaxaca", "code": "OAX" },
          { "name": "Puebla", "code": "PUE" },
          { "name": "Querétaro", "code": "QUE" },
          { "name": "QuintanaRoo", "code": "ROO" },
          { "name": "San Luis Potosí", "code": "SLP" },
          { "name": "Sinaloa", "code": "SIN" },
          { "name": "Sonora", "code": "SON" },
          { "name": "Tabasco", "code": "TAB" },
          { "name": "Tamaulipas", "code": "TAM" },
          { "name": "Tlaxcala", "code": "TLA" },
          { "name": "Veracruz", "code": "VER" },
          { "name": "Yucatán", "code": "YUC" },
          { "name": "Zacatecas", "code": "ZAC" }
        ];

    let  provinces_codes = Utils.getAPARegionalized('provinces_codes', 'provinces', defaultValue);    

    provinces_codes.forEach((item) => {
      
      item.value = item.code;
      item.option = item.name;
    });    

    return provinces_codes;
  }

  static getCountryCodes(){
    const metadataKey = 'country_codes';
    const defaultValue = "{\"mexico\":\"MEX\",\"brasil\":\"BRA\",\"argentina\":\"ARG\",\"chile\":\"CHL\",\"colombia\":\"COL\",\"costarica\":\"CRI\",\"dominicana\":\"DMA\",\"ecuador\":\"ECU\",\"elsalvador\":\"SLV\",\"guatemala\":\"GTM\",\"honduras\":\"HND\",\"nicaragua\":\"NIC\",\"panama\":\"PAN\",\"paraguay\":\"PRY\",\"peru\":\"PER\",\"puertorico\":\"PRI\",\"uruguay\":\"URY\"}";

    try {
      let country_codes = JSON.parse(Metadata.get(metadataKey, defaultValue));      
      return country_codes;
    } catch (e) {
      return {};
    }
  }

  static getCountryCode(){
    const region = DeviceStorage.getItem('region');
    const country_codes = this.getCountryCodes();
    return country_codes[region];
  }

  static getConfiguration(action){
    const metadataKey = 'claropagos_configuration';
    const defaultValue = {
          "server_url": "https://api.sandbox.claropagos.com/v1",
          "create_client": {
            "header": {
              "authorization": "QmVhcmVyIGV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlJc0ltcDBhU0k2SW1JeE56VmpOR1JrWWpZNFl6a3hOVFl6T1dVeFlXVXlPVGc1TUdVeFpURTJaamhoWWpWbFpUZGxORFJtTkRReFkyVmhNekF5TURjNE9UQmxNMkprWWpObVpETmtNekUxWXpjNE4yTm1NakZoSW4wLmV5SmhkV1FpT2lJeElpd2lhblJwSWpvaVlqRTNOV00wWkdSaU5qaGpPVEUxTmpNNVpURmhaVEk1T0Rrd1pURmxNVFptT0dGaU5XVmxOMlUwTkdZME5ERmpaV0V6TURJd056ZzVNR1V6WW1SaU0yWmtNMlF6TVRWak56ZzNZMll5TVdFaUxDSnBZWFFpT2pFMU16SXdORFUyT1RRc0ltNWlaaUk2TVRVek1qQTBOVFk1TkN3aVpYaHdJam94TlRZek5UZ3hOamt6TENKemRXSWlPaUl5SWl3aWMyTnZjR1Z6SWpwYkltTnNhV1Z1ZEdVdGRISmhibk5oWTJOcGIyNWxjeUpkZlEuamxWbnFnemlzektoeU54N2tPTFpoMTU4dVQ4MmdXUGxZR3IyNkdka2hvY2hRZ1NDeUhHcTAzbHYxblRhZjN0bFozNDhLVjVseGFRUzR5aHFyeUJPamZYZVpMUTlNZDIwVVVEdjZCV1JFQ1VSeHdQQnBJUWVtTnoyRXV4SVNrb1AyOGdkbDJSR2Y2S3lNSnFGV0hfTlRnSXZ4Y0Q2d0tobHV6WlVLN1lpQmJfalpYQXdBQlpibFNoNkR1SmJVRHNQVXN3NnJLbkJYMzFvTGtZeXVyT3UwdTRTVHB1TFd3WVRyakV4UF9ncy1Mazl6WGQyYzVOV1NzbmJhb2dBMmFlRlpZekpycUFEd1c0SmJMTjVqc1Vld3BySjVucEJOVlNFMUV5MWFySUJibjFEOHpSbmtzTmtIcEhDMFBqYnVqWmlBTTFoZnJ5LXZOX0Z5a3RtRUl4VlR4QnV4SF93VWQ5OW9HX0ZHTnBpV3ZGaGZ1bW5ZdVRTcFRlOXFoVzM2Vkthd0EwcUlxbHBNTVU5YU9zSUhHMGVlZm45dEplNjgyOE1VeHNTSVBzM05odDFRZkEwb3RjbmxBSjlfZ3YwRjNuZkVNVzZRVG1HSWl2dmswUHRhQzBWcUs0NVF3YjYySm14ek9yclV4Wmc1S25CbWlGY090QndTTmd2TnhaQjRVd3ZrY0ttX19fNlE1OFlsdml4c3BkTjhSVnRWYkNjM0RkUktrRmVWVmFFSmZMTmxUeC1YRi12OWpncFIxd1haR0ZPZ0k1ekhERG9IZ01pc0tUeTJ0VDFXUzNaMEttN282Nk10WmFmZnVhUklFbnljY0dnX3RsSEpVa1pLaFhmdC1OSjd2MkVlbzBWSFY0b3VKYnF6WFdBejJaVUpRaXVzWUozMHBOZnJiakNNTTA="
            }
          },
          "create_card": {
            "header": {
              "authorization": "QmVhcmVyIGV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlJc0ltcDBhU0k2SWpZMFpHWXpNVEkxWmpkbE1HSmxaV05tT1RBek1qZzBaREkxTW1NeE56ZGhNbVptTnpjeU4yUmtPR00wT0dJeE5UTXlOamM0TjJSbU5EVm1OMkl5TVRoak1HSXlaakE0TVRVelpXSXdNV1ZrSW4wLmV5SmhkV1FpT2lJeElpd2lhblJwSWpvaU5qUmtaak14TWpWbU4yVXdZbVZsWTJZNU1ETXlPRFJrTWpVeVl6RTNOMkV5Wm1ZM056STNaR1E0WXpRNFlqRTFNekkyTnpnM1pHWTBOV1kzWWpJeE9HTXdZakptTURneE5UTmxZakF4WldRaUxDSnBZWFFpT2pFMU16SXdORFUzTURBc0ltNWlaaUk2TVRVek1qQTBOVGN3TUN3aVpYaHdJam94TlRZek5UZ3hOekF3TENKemRXSWlPaUl5SWl3aWMyTnZjR1Z6SWpwYkltTnNhV1Z1ZEdVdGRHRnlhbVYwWVhNaVhYMC5FTkRtWXBqTGRDWkIwWlM0NEsxbkJfTWQ5MXJ3bTRZdTlGZDlxMHdDbFBLUThTWVZoS1dSQ2tna0I0QjNKbVJVTlJnN3hDZEpjdU5Xb3NWcklVd0RpeUJUVDg5UlB6OWNXaTllbkpFT2U5bXl4Ml9DYndvYjNsV2h0QXVFTGxhWFpDaDM3NGhXTzVTWjU0NXZtNzRHS3Y1RXdsTnctMkoyYURNWHJUYjFSN1kzZGpta3F2WDdROXQzekw4MFpiOWx6R0JQZlFtOXZnYlZoNzhTejViMXd6NDdrSjVYYlIxMEZ2YXZVRm8yLXQ2TmZzY2ZGc2U1TmE4NERCSXEyaGpkbHFRN1Q0c2ZqNzdHRFUzQWRxUURLWE9FQkt6V05JOU1ZS3ZzRU1MZXowb0Q3NnJjME1nWm1HUXdsMkhFRXRlYXFJcFQ3VFF1Sk9nellGMVJLeVpIX1NxVkQ0aWZsRVp0bEoyOG02SDlKNXREdVpOd2Z0V01FMjdqemhwdnBiRDNQb1FWQWtGS1lKcjRrMVVOcDVKZ1FYS0pBd3BJVHJ0QXRtQXJGVE1SYWNEUXhXclp5ZEhqVUdhOVhwM1Nad0FVaG54Qk8xTzVObWt6VGZaTXNDWjRsNjFnMG9BdWpfUHRTMjlRR1hzUndPTWt6SDhQb2hkQ2dyTVBFYmVjZ214Rk81OF9DemZtXzNOVjhpZzduUDBxd09KTXgzLUNsYTVUN1ZyNm1HNm5mZkloWXZrWFlZc0dSYVo0NFh6SFlQcmh0YXR4Ym1ubXQyUXg1Zi1HcHh4WWo3OExnTzFUTDVlWmpDQXptc0Y0LWVyaGREanNYX0lzYm5USEdDZ1VDNV9qQmFtM0RGOTdBaFNjRTVBQ3dTM0Y2ZGs1SXBrY1Y0Y0RCS29WMmdNNXdtZw=="
            }
          },
          "update_card": {
            "header": {
              "authorization": "QmVhcmVyIGV5SjBlWEFpT2lKS1YxUWlMQ0poYkdjaU9pSlNVekkxTmlJc0ltcDBhU0k2SWpZMFpHWXpNVEkxWmpkbE1HSmxaV05tT1RBek1qZzBaREkxTW1NeE56ZGhNbVptTnpjeU4yUmtPR00wT0dJeE5UTXlOamM0TjJSbU5EVm1OMkl5TVRoak1HSXlaakE0TVRVelpXSXdNV1ZrSW4wLmV5SmhkV1FpT2lJeElpd2lhblJwSWpvaU5qUmtaak14TWpWbU4yVXdZbVZsWTJZNU1ETXlPRFJrTWpVeVl6RTNOMkV5Wm1ZM056STNaR1E0WXpRNFlqRTFNekkyTnpnM1pHWTBOV1kzWWpJeE9HTXdZakptTURneE5UTmxZakF4WldRaUxDSnBZWFFpT2pFMU16SXdORFUzTURBc0ltNWlaaUk2TVRVek1qQTBOVGN3TUN3aVpYaHdJam94TlRZek5UZ3hOekF3TENKemRXSWlPaUl5SWl3aWMyTnZjR1Z6SWpwYkltTnNhV1Z1ZEdVdGRHRnlhbVYwWVhNaVhYMC5FTkRtWXBqTGRDWkIwWlM0NEsxbkJfTWQ5MXJ3bTRZdTlGZDlxMHdDbFBLUThTWVZoS1dSQ2tna0I0QjNKbVJVTlJnN3hDZEpjdU5Xb3NWcklVd0RpeUJUVDg5UlB6OWNXaTllbkpFT2U5bXl4Ml9DYndvYjNsV2h0QXVFTGxhWFpDaDM3NGhXTzVTWjU0NXZtNzRHS3Y1RXdsTnctMkoyYURNWHJUYjFSN1kzZGpta3F2WDdROXQzekw4MFpiOWx6R0JQZlFtOXZnYlZoNzhTejViMXd6NDdrSjVYYlIxMEZ2YXZVRm8yLXQ2TmZzY2ZGc2U1TmE4NERCSXEyaGpkbHFRN1Q0c2ZqNzdHRFUzQWRxUURLWE9FQkt6V05JOU1ZS3ZzRU1MZXowb0Q3NnJjME1nWm1HUXdsMkhFRXRlYXFJcFQ3VFF1Sk9nellGMVJLeVpIX1NxVkQ0aWZsRVp0bEoyOG02SDlKNXREdVpOd2Z0V01FMjdqemhwdnBiRDNQb1FWQWtGS1lKcjRrMVVOcDVKZ1FYS0pBd3BJVHJ0QXRtQXJGVE1SYWNEUXhXclp5ZEhqVUdhOVhwM1Nad0FVaG54Qk8xTzVObWt6VGZaTXNDWjRsNjFnMG9BdWpfUHRTMjlRR1hzUndPTWt6SDhQb2hkQ2dyTVBFYmVjZ214Rk81OF9DemZtXzNOVjhpZzduUDBxd09KTXgzLUNsYTVUN1ZyNm1HNm5mZkloWXZrWFlZc0dSYVo0NFh6SFlQcmh0YXR4Ym1ubXQyUXg1Zi1HcHh4WWo3OExnTzFUTDVlWmpDQXptc0Y0LWVyaGREanNYX0lzYm5USEdDZ1VDNV9qQmFtM0RGOTdBaFNjRTVBQ3dTM0Y2ZGs1SXBrY1Y0Y0RCS29WMmdNNXdtZw=="
            }
          }
        };

    const configuration = Utils.getAPARegionalized(metadataKey, 'request', defaultValue);
    let result = {};
    let actions = action.split('_');

    switch (action) {
      case 'create_client':
      result.server_url = configuration.server_url + '/cliente';
        break;
      case 'create_card':
        result.server_url = configuration.server_url + '/tarjeta';
        break;
      case 'update_card':
        result.server_url = configuration.server_url + '/tarjeta/{token}';
        break;
      default:
    };  
    result.header = configuration[action].header;
    result.action = actions[0];

    return result;
  }

  static getCreditCardByRegion = () => {
    const metadataKey = 'creditcard_by_region';
    const defaultValue = [
          {
            "id": "1",
            "code": "visa"
          },
          {
            "id": "2",
            "code": "mastercard"
          }];

    const creditcard_by_region = Utils.getAPARegionalized(metadataKey, 'creditcards', defaultValue);    
    return creditcard_by_region;

  }

  
}

export default UtilsClaroPagos;




