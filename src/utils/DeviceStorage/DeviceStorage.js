/**
 * @fileoverview get/set/unset/clear de Storage
 * si el dispositivo soporta LocalStorage lo almacena ahi
 * de lo contrario la manda Cookies
 * @version   1.0
 *
 * @author    Guillermo Castro
 *
 * ---------------------------------------------------------------------
 * Ejemplo de implementacion para DeviceStorage
 * import DeviceStorage from './../../components/DeviceStorage/DeviceStorage';
 * DeviceStorage.setItem('test', '123');
 * var miValor = DeviceStorage.getItem('test');
 * DeviceStorage.unsetItem('test', '123');
 * DeviceStorage.clear()
 */


import LocalStorage from './LocalStorage'
import CookieStorage from './CookieStorage'
import ObjectStorage from './ObjectStorage'
import AbstractStorage from './AbstractStorage'

/** Class DeviceStorage abstraccion conjunta de LocalStorage y Cookies */
class DeviceStorage {

   /**
   * Regresa un string con los formatos de Storage soportados Local Storge/Cookies
   * @return  {string}
   */
    static getSupportlist() {
        return AbstractStorage.getSupportlist();
    };

   /**
   * Regresa true/false si el dispositivo soporta Local Storage
   * @return  {boolean}
   */
    static isLocalStorageSupported() {
        return AbstractStorage.getLocalStorageSupport();
    };

   /**
   * Regresa true/false si el dispositivo soporta Cookies
   * @return  {boolean}
   */
    static isCookieStorageSupported() {
        return AbstractStorage.getCookieStorageSupport();
    };

   /**
   * Guarda el value de key en el storage correspondiente
   * @param  {string} key
   * @param  {string} value
   */
    static setItem(key, value) {

        if (LocalStorage.checkSupport()) {
            LocalStorage.setItem(key, value);
        }
        else if (CookieStorage.checkSupport()) {
            CookieStorage.setItem(key, value);
        }
        else {
            ObjectStorage.setItem(key, value);
            //throw TypeError("Not support any device storage");
        }

    };

    /**
   * Obtiene el valor almacenado en storage del parametro key
   * @param  {string} key
   * @return  {string}
   */
    static getItem(key) {

        if (LocalStorage.checkSupport()) {
            return LocalStorage.getItem(key);
        }
        else if (CookieStorage.checkSupport()) {
            return CookieStorage.getItem(key);
        }
        else {
            return ObjectStorage.getItem(key);
            //throw TypeError("Not support any device storage");
        }

    };

    /**
   * Elimina del storage la llave key
   * @param  {string} key
   * @return  {string}
   */
    static unsetItem(key) {

        if (LocalStorage.checkSupport()) {
            LocalStorage.unsetItem(key);
        }
        else if (CookieStorage.checkSupport()) {
            CookieStorage.unsetItem(key);
        }
        else {
            ObjectStorage.unsetItem(key);
            //throw TypeError("Not support any device storage");
        }

    }

    /**
   * Elimina todos los datos almacenados en storage
   */
    static clear() {

        if (LocalStorage.checkSupport()) {
            LocalStorage.clear();
        }
        else if (CookieStorage.checkSupport()) {
            CookieStorage.clear();
        }
        else {
            ObjectStorage.clear();
            //throw TypeError("Not support any device storage");
        }

    }
}

export default DeviceStorage;
