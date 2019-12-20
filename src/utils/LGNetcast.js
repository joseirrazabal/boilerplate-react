import Utils from './Utils';

const netcast_object_id = 'CV_netcast_object';

class LGNetcast {

  constructor() {
    this.LGNetcastObject = this.ifLGObject();
    if(!this.LGNetcastObject) {
        this.LGNetcastObject = this.init();
    }
  }

  init() {
    let LGObj;
    let LGNetcastInfo;

    LGObj = document.createElement("div");
    LGObj.style.width = '0px';
    LGObj.style.height = '0px';
    LGObj.id = netcast_object_id;

    //let reactRoot = document.getElementById('root');
    //reactRoot.parentNode.insertBefore(LGObj, reactRoot);
    document.body.appendChild(LGObj);
    LGObj.innerHTML = "<object type='application/x-netcast-info' id='netcastDevice' width='0px' height='0px'></object>";

    LGNetcastInfo = {
        info: document.getElementById("netcastDevice")
    };

    return LGNetcastInfo;
  }

  ifLGObject() {
    return document.getElementById(netcast_object_id);      
  }

  getDeviceInfo() {
      return this.LGNetcastObject; // info/api access in this.LGNetcastObject.info
  }

}

export default LGNetcast;