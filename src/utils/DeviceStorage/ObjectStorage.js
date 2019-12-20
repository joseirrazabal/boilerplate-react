import AbstractStorage from './AbstractStorage';

class ObjectStorage extends AbstractStorage {
    constructor() {
        super();
        this.config = {};
    }

    getItem(key = "") {
        const value = this.config[key];
        return value;
    }

    setItem(key = "", value = "", persist = false) {
        this.config[key] = value;

        // if(persist && isLocalStorageAvaliable()) {
        //     localStorage.setItem(key, value);
        // }
    }

    extend(newConfig = {}) {
        const prevConfig = this.config;
        this.config = Object.assign({}, prevConfig, newConfig);
    }

    unsetItem(key = "") {
        delete this.config[key];
    }

    clear() {
        this.config = {};
    }

}

export default new ObjectStorage();