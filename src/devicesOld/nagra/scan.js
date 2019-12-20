import configuration from './scanConfig';
import CCOM from './CCOM';
import Device from "../device";

class Scan {
  /* private variables */
  _scanHandle = null; //handle returned from CCOM.SINetwork.scan()
  _scanError = null; //error condition from "onScanError" event
  _lockAgain = true; //boolean value whether relock after lock failed or not
  _onLockOk = null; //callback of lockconfiguration success
  _isInited = false; // am I initialized?
  _isNagra = false;

  constructor() {
    if (this._isInited) {
      console.log("Nagra:scan -- already inited. ignore the call.");
      return;
    }

    this.isNagra();

    this._isInited = true;

    this.isNagra = this.isNagra.bind(this);
    this.start = this.start.bind(this);
    this.init = this.init.bind(this);
    this.cancel = this.cancel.bind(this);
    // this.destructor = this.destructor.bind(this);
    this.scanCompleteListener = this.scanCompleteListener.bind(this);
    this.scanErrorListener = this.scanErrorListener.bind(this);
    this.scanProgressListener = this.scanProgressListener.bind(this);
    this.scanProgressFailedListener = this.scanProgressFailedListener.bind(this);
    this.lockConfigurationOKListener = this.lockConfigurationOKListener.bind(this);
    this.lockConfigurationFailedListener = this.lockConfigurationFailedListener.bind(this);

    CCOM.SINetwork.addEventListener("onScanComplete", this.scanCompleteListener);
    CCOM.SINetwork.addEventListener("onScanError", this.scanErrorListener);
    CCOM.SINetwork.addEventListener("onScanProgress", this.scanProgressListener);
    CCOM.SINetwork.addEventListener("getScanProgressOK", this.scanProgressListener);
    CCOM.SINetwork.addEventListener("getScanProgressFailed", this.scanProgressFailedListener);
    CCOM.SINetwork.addEventListener("lockConfigurationOK", this.lockConfigurationOKListener);
    CCOM.SINetwork.addEventListener("lockConfigurationFailed", this.lockConfigurationFailedListener);
  }

  /**
   *  Start scan operation
   *  @method start
   *  @public
   *  @param None
   *  @retur None
   */
  start() {
    if (!this._isNagra) {
      return;
    }

    const type = configuration.networkType;

    /*
     * choose cable or satellite network to scan
     */
    if (type === 0) { // satellite
      this.init(configuration.getSatConfiguration(), configuration.getSatScanMode());
    } else if (type === 1) { // cable
      this.init(configuration.getCableConfiguration(), configuration.getCableScanMode());
    } else {
      console.log(`Nagra -- not supported network type: ${type}`);
    }
  }

  /**
   * Cancel scan operation;
   * @method cancelScan
   * @public
   * @param None
   * @return None
   */
  cancel() {
    if (!this._isNagra) {
      return;
    }

    if (this._scanHandle) {
      CCOM.SINetwork.cancelScan(this._scanHandle);
      this._scanHandle = null;
    }

    this._scanError = null;
    this._lockAgain = false;
    this._onLockOk = null;
  }

  /**
   * Release all the resources occupied by scan object;
   * @method cancelScan
   * @public
   * @param None
   * @return None
   */
  /*
  destructor() {
    if (!this._isNagra) {
      return;
    }

    if (!this._isInited) {
      console.log("Nagra:scan -- not yet initialized, do nothing.");
      return;
    }

    this._isInited = false;

    this.cancel();
    CCOM.SINetwork.removeEventListener("onScanComplete", this.scanCompleteListener);
    CCOM.SINetwork.removeEventListener("onScanError", this.scanErrorListener);
    CCOM.SINetwork.removeEventListener("onScanProgress", this.scanProgressListener);
    CCOM.SINetwork.removeEventListener("getScanProgressOK", this.scanProgressListener);
    CCOM.SINetwork.removeEventListener("getScanProgressFailed", this.scanProgressFailedListener);
    CCOM.SINetwork.removeEventListener("lockConfigurationOK", this.lockConfigurationOKListener);
    CCOM.SINetwork.removeEventListener("lockConfigurationFailed", this.lockConfigurationFailedListener);
  }
  */

  /* private functions - all event listeners*/
  isNagra() {
    const device = Device.getDevice().getPlatform();

    if (device === 'nagra') {
      this._isNagra = true;
    }

    return this._isNagra;
  }

  /**
   * Initialization of scan operation: binding some event listeners;
   * @method startScan
   * @public
   * @param {Object} param ConfigMan configuration to be set before scan
   * @param {string} mode Scan mode
   * @return None
   */
  init(param, mode) {
    this._onLockOk = function () {
      let prop,
        result,
        setvalue = function (x) { CCOM.ConfigManager.setValue(prop + x[0], x[1]); };

      console.log("Nagra:scan -- step 2 -- CCOM.ConfigManager.setValue() ");

      for (prop in param) {
        if (param.hasOwnProperty(prop)) {
          param[prop].forEach(setvalue);
          // debug version
          /*
          param[prop].forEach(function(x) {
              var obj = CCOM.ConfigManager.setValue(prop + x[0], x[1]);
              if (obj.error) {
                  _log("setValue(" + x[0] + ": " + x[1] +") failed: " + err.error.message);
              } else {
                  _log("setValue(" + x[0] + ": " + x[1] +") ok");
              }
          });
          */
        }
      }

      console.log("Nagra:scan -- step 3 -- CCOM.SINetwork.unlockConfiguration ");
      this._onLockOk = null;
      CCOM.SINetwork.unlockConfiguration();

      console.log("Nagra:scan -- step 4 -- CCOM.SINetwork.scan ");
      result = CCOM.SINetwork.scan(mode);

      if (result.error) {
        console.log("scan -- CCOM.SINetwork.scan failed -- Misc error -1");
      } else {
        this._scanHandle = result.scanHandle;
        CCOM.SINetwork.getScanProgress(this._scanHandle);
      }
    }; /* _onLockOk end */

    console.log("Nagra:scan -- step 1 -- CCOM.SINetwork.lockConfiguration ");

    this._lockAgain = true;
    CCOM.SINetwork.lockConfiguration();
  }

  /**
   * Event listener of onScanComplete
   * @method scanCompleteListener
   * @private
   * @param None
   * @return None
   */
  scanCompleteListener() {
    if (this._scanError) {
      console.log("Nagra:scan -- 'onScanComplete' event received -- Failed -- Press OK to rescan.");
    } else {
      console.log("Nagra:scan -- 'onScanComplete' event received -- OK");

      const resultSet = CCOM.EPG.getServicesRSByQuery("*", null, null);
      const resultArray = resultSet.getNext(999);
      const len = resultArray.length;
      let tvServiceCount = 0;
      let radioServiceCount = 0;
      let otherServiceCount = 0;

      console.log("Nagra:scan -- resultArray.length = " + resultArray.length);

      resultSet.reset();

      console.log("Nagra:scan -- resultSet.reset() done.");

      for (let i = 0; i < len; i++) {
        if (resultArray[i].type === 1) {
          tvServiceCount++;
        } else if (resultArray[i].type === 2) {
          radioServiceCount++;
        } else {
          otherServiceCount++;
        }
      }

      console.log("Nagra:scan -- resultArray.forEach() done.");
      console.log("Nagra:scan Total service: " + len + ", TV:" + tvServiceCount + ", Radio:" + radioServiceCount + ", Other:" + otherServiceCount);

      console.log("Nagra:scan -- start to play services.");

      // play_init();
    }

    this._scanHandle = null;
    this._scanError = null;
  }

  /**
   * Event listener of onScanError
   * @method scanErrorListener
   * @private
   * @param {Object} the return object have two properties.
   *          target: Object on which the event handler was registered. The scan handle that was returned from scan().
   *          condition: reason resulted in error.
   * @return None
   */
  scanErrorListener(result) {
    let reason;

    switch (result.condition) {
      case CCOM.SINetwork.UNKNOWN_ERROR:
        reason = "UNKNOWN_ERROR";
        break;
      case CCOM.SINetwork.DATABASE_FULL:
        reason = "DATABASE_FULL";
        break;
      case CCOM.SINetwork.TIMEOUT_OCCURRED:
        reason = "TIMEOUT_OCCURRED";
        break;
      case CCOM.SINetwork.SI_ERROR:
        reason = "SI_ERROR";
        break;
      case CCOM.SINetwork.RESOURCE_UNAVAILABLE:
        reason = "RESOURCE_UNAVAILABLE";
        break;
      case CCOM.SINetwork.CONNECTION_ERROR:
        reason = "CONNECTION_ERROR";
        break;
      case CCOM.SINetwork.BUSY:
        reason = "BUSY";
        break;
      case CCOM.SINetwork.SCAN_CANCELED:
        reason = "SCAN_CANCELED";
        break;
      case CCOM.SINetwork.CONFIGURATION_LOCKED:
        reason = "CONFIGURATION_LOCKED";
        break;
      default:
        reason = "UNKNOWN_ERROR";
    }

    this._scanError = result.condition;
    console.log("Nagra:scan -- 'onScanError' event received -- "  + result.condition + ", " + reason);
  }

  /**
   * Event listener of onScanProgress and getScanProgressOK
   * @method scanProgressListener
   * @private
   * @param {Object} the return object have two properties.
   *          target: Object on which the event handler was registered.
   *          progressInfo: An object contain progress info, check the ProgressInfo for more details in CCOM API doc.
   * @return None
   */
  scanProgressListener(result) {
    console.log("Nagra:scan -- 'onScanProgress' or 'getScanProgressOK' event received -- "  + result.progressInfo.scannedPercent);
  }

  /**
   * Event listener of getScanProgressFailed
   * @method scanProgressFailedListener
   * @private
   * @param {Object} Please check the part of getScanProgress - getScanProgressFailed  for more details in CCOM API doc.
   * @return None
   */
  scanProgressFailedListener(result) {
    console.log("Nagra:scan -- 'getScanProgressFailed' event received -- " + result.error.message);
  }

  /**
   * Event listener of lockConfigurationOK
   * @method lockConfigurationOKListener
   * @private
   * @param None
   * @return None
   */
  lockConfigurationOKListener() {
    console.log("Nagra:scan -- 'lockConfigurationOK' event received -- ");

    this._lockAgain = false;
    if (this._onLockOk) {
      this._onLockOk();
    }
  }

  /**
   * Event listener of lockConfigurationFailed
   * @method lockConfigurationFailedListener
   * @private
   * @param None
   * @return None
   */
  lockConfigurationFailedListener() {
    console.log("Nagra:scan -- 'lockConfigurationFailed' event received -- ");

    if (this._lockAgain) {
      console.log("Nagra:scan -- lockConfigurationFailed -- try again 1 sec later.");
      setTimeout(function () {
        CCOM.SINetwork.lockConfiguration();
      }, 1000);
    }
  }
}

export default new Scan();
