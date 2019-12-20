class AbstractKeys {
    constructor(){
        this.keys = {};
    }

    getPressKey(keyPress) {
        for (var keyName in this.keys) {
            if (this.keys[keyName] === keyPress){
               return keyName;
            }
        }
        return 'UNKNOW_KEY';
    }
}

export default AbstractKeys;
