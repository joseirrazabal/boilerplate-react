import Device from "../../devices/device";
import Metadata from '../../requests/apa/Metadata';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';

let instanceActive=null;
class ActivesSingleton{

  constructor(){
    if(!instanceActive)
      instanceActive=this;
    return instanceActive;
  }

  getActives(){
    return this.actives;
  }

  setActives(actives){
    this.actives=actives;
  }

  getTree() {
    if(this.actives.length!==0){

      let tree=this.actives.map(i=>i.text)
        .reduce((current,previous)=>previous.concat('/').concat(current));
      return tree;
    }
  }

  setNav (nav) {
    this.navcodes = nav;
  }

  getNav () {
    return this.navcodes;
  }

  getTvNode () {
    let nodes = JSON.parse(Metadata.get("links_nav_configuration", "{}"));
    const region = DeviceStorage.getItem("region");
    var nodoTV = (nodes[region]) ? nodes[region].clarotv : nodes['default'].clarotv;
    return nodoTV;
    /** TODO Meanwhile Admin APA Test is broken

    if(this.nodeTV)
        return this.nodeTV;

    if (!this.navcodes) { return null; }
    const navi = this.navcodes;
    const apam_lncs = Metadata.get("layout_node_configuration", "{}");
    const apam_lnc = JSON.parse(apam_lncs);
    const region = DeviceStorage.getItem("region");
    const apam_lnc_region = apam_lnc[region] || apam_lnc["default"];
    for (let i = 0, len = navi.length; i < len; i++) {
      let node_code = navi [i];
      if (apam_lnc_region[node_code]
        && apam_lnc_region[node_code].type === "action"
        && apam_lnc_region[node_code].action === "live"
      ) {
        console.log("[getTvNode]", node_code);
        this.nodeTV = node_code;
        return this.nodeTV;
      }
    }
    return null;
     */
  }

  nodeTvExits(){
    if(this.navcodes.find(it=>it===this.getTvNode()))
      return true;
    return false;
  }

}
export default ActivesSingleton;

