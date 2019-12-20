import Utils from './Utils';

class LGWeb0s {

  constructor() {
    this.escript = '/webOS.js';
    this.loadWeb0sLibs = this.loadWeb0sLibs.bind(this);
    this.web0sIsLoaded = this.web0sIsLoaded.bind(this);

    if(!this.web0sIsLoaded()) {
      this.loadWeb0sLibs();
    }
  }

  web0sIsLoaded() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length; i--;) {
        if (scripts[i].src.indexOf('webOS') !== -1) {
          return true;
        }
    }

    return false;
  }

  loadWeb0sLibs() { 
    Utils.loadScript(this.escript).then((responses) => {
      this.web0sSetup();
    }).catch((e) => {console.log(e);console.log('ERRRR init LGweb0s');});
  }

  // web0sSetup() {
  //   console.log('[Web0s] Web0s Setup....');
  // }
  // HACK! goose
  // se cambia en nombre de la funcion y se la convierte en promesa,
  // sino da error cuando se llama.
  setup() {
    return new Promise((resolve,reject)=>{
        resolve(console.log('[Web0s] Web0s Setup....'));
    });
  }

}

export default LGWeb0s;