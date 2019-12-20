import CCOM from './CCOM';

class Volume {
  eventVolumeDown = null;
  eventVolumeUp = null;

  constructor() {
    this.createEvents();
    this.attachEvent();
  }

  createEvents() {
    this.eventVolumeDown = window.document.createEvent("Event");
    this.eventVolumeDown.initEvent("volumeDown", true, true);

    this.eventVolumeUp = window.document.createEvent("Event");
    this.eventVolumeUp.initEvent("volumeUp", true, true);
  }

  attachEvent() {
    window.document.addEventListener("volumeDown", function (e) {
      const volume = CCOM.System.volume - 1;

      if (volume >= 0) {
        CCOM.System.volume = volume;
        CCOM.ConfigManager.setValue("/applications/shared/system.current.volume", volume);
      }
    }, false);

    window.document.addEventListener("volumeUp", function (e) {
      const volume = CCOM.System.volume + 1;

      if (volume <= 100) {
        CCOM.System.volume = volume;
        CCOM.ConfigManager.setValue("/applications/shared/system.current.volume", volume);
      }
    }, false);
  }

  get() {
    return CCOM.System.volume;
  }

  up() {
    window.document.dispatchEvent(this.eventVolumeUp);
  }

  down() {
    window.document.dispatchEvent(this.eventVolumeDown);
  }

  mute() {
    switch (true) {
        case CCOM.System.volume > 0:
            this.currentVol = CCOM.System.volume;
            CCOM.System.volume = 0;
            CCOM.ConfigManager.setValue("/applications/shared/system.current.volume", 0);
            break;
        case CCOM.System.volume == 0:
            CCOM.System.volume = this.currentVol;
            CCOM.ConfigManager.setValue("/applications/shared/system.current.volume", this.currentVol);
            break;
    }

    return CCOM.System.volume;

  }
}

export default new Volume();
