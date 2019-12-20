class AbstractDataModel {

  constructor() {
    this.__elements = {}; //Es un arreglo o un objeto?
  }

  // if time = false => there is not time to expire data
  createExpireTime(time) {
    
    const expireTime = time === false ? false : (new Date()).getTime() + time * 1000;
    return expireTime;
  }

  checkExpireTime(time) {
    return time === false ? true : time > (new Date()).getTime();
  }

  releaseMemory() {

    //Quita de memoria los elementos que ya han expirado
    const ahora = (new Date()).getTime();

    let filtered = Object.keys(this.__elements)
      .filter(k => this.__elements[k] && this.__elements[k].expiretime > ahora)
      .reduce((obj, key) => {
        obj[key] = this.__elements[key];
        return obj;
      }, {});
       
    //console.log('GCR release memory to ', filtered, ahora);
    this.__elements = null;
    this.__elements = filtered;

  }

  get(element) {
    
    let data_obj = this.__elements[element];
    
    //Elimina el objeto de memoria si ya ha expirado
    if (data_obj && data_obj.expiretime && this.checkExpireTime(data_obj.expiretime)) {
      this.__elements[element] = null; //Preguntar a PAO si es necesario undefined
      return undefined;
    }
    else {
      return data_obj && data_obj.data ? data_obj.data : undefined;
    }
  }

  set(element, value, timeToExpire) {

    //Valida que si un objeto ya ha expirado lo elimine
  

    var data_obj = {};
    var data_obj_aux = this.get(element);
    data_obj.expiretime = this.createExpireTime(timeToExpire || data_obj_aux && data_obj_aux.expiretime || false);
    data_obj.data = value;

    if(typeof value === 'undefined') {
      delete this.__elements[element];
    }
    else {
      this.__elements[element] = data_obj;
    }

    return this;
  }

  has(element) {
    return this.__elements.hasOwnProperty(element);
  }

  unset(element) {
    if(this.has(element)) {
      delete this.__elements[element];
    }

    return this;
  }

  clear() {
    //let i;
    //for(i in this.__elements) {
    //  delete this.__elements[i];
    //}

    this.__elements = null;
    this.__elements = {};

    return this;
  }
}

export default AbstractDataModel;
