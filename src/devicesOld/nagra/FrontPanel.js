import CCOM from './CCOM';

class FrontPanel {

    constructor() {
        //Inicializando uso de front panel
        CCOM.System.frontPanelControl(true);
        console.log('EDM: FRONT PANEL ACTIVADO');
    }

    clearDisplay() {
        CCOM.System.setFrontPanelString("");
    }

    setFrontPanel(string) {
        CCOM.System.setFrontPanelString(string);
    }

    showTime() {
        let that = this,
            clock = new Date(),
            hours = clock.getHours(),
            minutes = clock.getMinutes();

        minutes = this.addZero(minutes);

        CCOM.System.setFrontPanelString( hours + ":" + minutes );
        this.clockId = setTimeout(function(){that.showTime()}, 60000);
    }

    /*Método para agregar un 0
    si los minutos son menores a 10*/
    addZero(i)
    {
    if (i<10) {
        i="0" + i;
    }
    return i;
    }

    launchVirtualKey() {
        let e = new Event("keydown");
            e.key = "play";
            e.keyCode = 179;
            e.which = e.keyCode;
        document.dispatchEvent(e);
    }

    standByBox(isLive) {
        CCOM.Pwrmgr.userModeSet(CCOM.Pwrmgr.STANDBY_ON);
        CCOM.System.setFrontPanelIntensityLevel(1);
        this.showTime();

        if (isLive) this.launchVirtualKey();
    }

    turnOnBox(isLive) {
        CCOM.Pwrmgr.userModeSet(CCOM.Pwrmgr.STANDBY_OFF);
        CCOM.System.setFrontPanelString("");
        CCOM.System.setFrontPanelIntensityLevel(8);

        if (this.clockId) clearInterval(this.clockId);

        if (isLive) this.launchVirtualKey();
    }
}

export default new FrontPanel();
