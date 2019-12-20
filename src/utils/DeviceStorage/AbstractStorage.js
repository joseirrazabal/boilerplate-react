class AbstractStorage {

    constructor() {
        if (this.constructor === AbstractStorage) {
            throw new TypeError("Can not construct abstract class");
        }
    }

    static getSupportlist() {

        var supported = '';

        if (this.getLocalStorageSupport() ) {
            supported += 'Local Storage';
        }

        if (this.getCookieStorageSupport()) {
            supported += ', Cookies';
        }

        return supported;
    }

     getLocalStorageSupport() {
        if (typeof (window.localStorage) === "undefined" || typeof window.localStorage.setItem !== 'function') {
            return false;
        } else {
            return true;
        }

    }

     getCookieStorageSupport() {

        var cookieEnabled = navigator.cookieEnabled;

        if (!cookieEnabled) {
            document.cookie = "testcookie";
            cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
        }

        return cookieEnabled;
    }


    //Abstract Method
    static setItem() {
        throw new TypeError("Can not call static abstract method");
    };

    //Abstract Method
    static getItem() {
        throw new TypeError("Can not call statict abstract method");
    };

    //Abstract Method
    static unsetItem() {
        throw new TypeError("Can not call static abstract method");
    };

    //Abstract Method
    static clear() {
        throw new TypeError("Can not call static abstract method");
    }
}

export default AbstractStorage;
