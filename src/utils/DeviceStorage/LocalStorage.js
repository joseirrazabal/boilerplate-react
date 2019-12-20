import AbstractStorage from './AbstractStorage';

class LocalStorage extends AbstractStorage {

    static checkSupport() {
        if (AbstractStorage.prototype.getLocalStorageSupport) {
            return AbstractStorage.prototype.getLocalStorageSupport.call(this);
        }

    }

    static setItem(key, value) {

        if (window.localStorage) {
            localStorage.setItem(key, value);
        }
        else {
            throw new TypeError("localStorage is not supported :(");
        }

    }

    static getItem(key) {

        if (window.localStorage) {
            return localStorage.getItem(key);
        }
        else {
            throw new TypeError("localStorage is not supported :(");
        }

    }

    static unsetItem(key) {

        if (window.localStorage) {
            localStorage.removeItem(key);
        }
        else {
            throw new TypeError("localStorage is not supported :(");
        }

    }

    static clear() {

        if (window.localStorage) {
            localStorage.clear();
        }
        else {
            throw new TypeError("localStorage is not supported :(");
        }

    }
}

export default LocalStorage;
