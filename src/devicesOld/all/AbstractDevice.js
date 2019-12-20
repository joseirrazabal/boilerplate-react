import WorkstationKeys from "../workstation/Keys";
const NICE_MESSAGE_NOTIMPLEMENTED = 'This method is not implemented';

class AbstractDevice {

  constructor(platform, id, player, playerutil, config, keys, networkstatus, system, subplatform) {

    this.platform = platform;
    this.subplatform = subplatform;
    this.id = id;
    this.player = player;
    this.playerUtil = playerutil;
    this.config = config;
    this.keys = (window.location.search.indexOf('QAKeyboard')>-1)? new WorkstationKeys(): keys;
    this.networkstatus = networkstatus;
    this.system = system;
  }

  getPlatform () {
    return this.platform;
  }

  getSubplatform() {
    return this.subplatform;
  }

  getId () {
    return this.id;
  }

  getPlayer () {
    return this.player;
  }

  getPlayerUtil () {
    return this.playerUtil;
  }

  getConfig () {
    return this.config;
  }

  getKeys () {
    return this.keys;
  }

  getNetworkStatus() {
    return this.networkstatus;
  }

  getSystem() {
    return this.system;
  }

  getStorage () {
    throw new Error(NICE_MESSAGE_NOTIMPLEMENTED);
  }

  update_launcher (region, result) { }

  getUserInfo () { }
}

export default AbstractDevice;
