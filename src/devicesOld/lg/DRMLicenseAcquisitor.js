
const LICENSE_MESSAGE_TYPE = "application/vnd.ms-playready.initiator+xml";

class DRMLicenseAcquisitor {
  constructor(DrmObject, DrmSystemID, OnSuccess, OnFail) {
    this.drmObject = DrmObject;
    this.drmSystemID = DrmSystemID;
    this.OnSuccess = OnSuccess;
    this.OnFail = OnFail;

    this.drmServiceCounter = 0;

    this.requestForLicense = this.requestForLicense.bind(this);
    this.sendDRMMessage = this.sendDRMMessage.bind(this);
    this.onDRMMessageResult = this.onDRMMessageResult.bind(this);
    this.onLicenseAcquired = this.onLicenseAcquired.bind(this);
    this.onDRMRightsError = this.onDRMRightsError.bind(this);


    DrmObject.onDRMMessageResult = this.onDRMMessageResult;
    DrmObject.onDRMRightsError = this.onDRMRightsError;
  }

  requestForLicense(laUrl, customData) {
    this.drmServiceCounter = 0; // For playready there are 2 calls/request
    this.sendDRMMessage(laUrl, customData);
  }

  sendDRMMessage(laUrl, customData) {
    let xmlLicenseAcquisition;
    //laUrl = 'https://tve.hbopaseo.com/DRM-Web/pr/entitlement/LicenseService?h=6869643a42363134333539303648445f3131457c64726d3a506c617952656164792d536d6f6f746853747265616d696e677c636c693a416c6c7c6461743a31302f32302f32303137';
    try {
      // 1/2 DRM URL
      if (laUrl) {
        console.debug("sendDRMMessage to laUrl: ", laUrl, this.drmObject);
        this.drmServiceCounter++;
        xmlLicenseAcquisition = "<?xml version='1.0' encoding='utf-8'?>" +
                "<PlayReadyInitiator xmlns='http://schemas.microsoft.com/DRM/2007/03/protocols/'>" +
                    "<LicenseServerUriOverride>" +
                        "<LA_URL>" + laUrl + "</LA_URL>" +
                    "</LicenseServerUriOverride>" +
                "</PlayReadyInitiator>";
        this.drmObject.sendDRMMessage(LICENSE_MESSAGE_TYPE, xmlLicenseAcquisition, this.drmSystemID);
      }
      // 2/2 Custom Data
      if (customData) {
        console.debug("sendDRMMessage CustomData: " + customData);
        this.drmServiceCounter++;
        xmlLicenseAcquisition = "<?xml version='1.0' encoding='utf-8'?>" +
                "<PlayReadyInitiator xmlns='http://schemas.microsoft.com/DRM/2007/03/protocols/'>" +
                    "<SetCustomData>" +
                        "<CustomData>" + customData + "</CustomData>" +
                    "</SetCustomData>" +
                "</PlayReadyInitiator>";
        this.drmObject.sendDRMMessage(LICENSE_MESSAGE_TYPE, xmlLicenseAcquisition, this.drmSystemID);
      }
    } catch (e) {
        console.warn("[DrmAgent] ERROR: sendDRMMessage (" + e + ")");          
    }
  }

  /**
   * CALLBACKS
   */
  onDRMMessageResult(msgId, resultMsg, resultCode) {

    console.debug("[DrmLicense] ENTER onDRMMessageResult: ", msgId, resultMsg, resultCode);

    let description;
    this.drmServiceCounter--; // we have a response, 1 or 2 of 2 ¿?

    switch (resultCode) {
        case 0:
            description = "Successful";
            if (this.drmServiceCounter > 0) {
                description += ", but not ready yet, await for another request (requesting to drm server and to customData)";
            }
            break;
        case 1:
            if (resultMsg === "0x8004C600") {
                description = "Server could not deliver a license (server internal error)";
            } else if (resultMsg === "0x8004C580") {
                description = "Acquired license successfully but domain certificate missing on device";
            }
            break;
        case 2:
            description = "Cannot process request";
            break;
        case 3:
            description = "Unknown MIME type";
            break;
        case 4:
            description = "User consent needed";
            break;
    }
    console.debug("[DrmLicense] onDRMMessageResult: resultCode:" + resultCode + " - " + description);
    console.debug("[DrmLicense] counter down to " + this.drmServiceCounter);

    // Notify if success
    if (this.drmServiceCounter === 0) {
      this.onLicenseAcquired();
    }
  }

  onLicenseAcquired() {
    // At this point we have the player ready
    console.debug("[DrmLicense] license acquired");
    if(this.OnSuccess) {
      this.OnSuccess("[DrmLicense] license acquired");
    }  
  }

  /**
   * Callback to be called by the native drm agent when license acquisition fails.
   */
  onDRMRightsError(errorState, contentId, drmSystemId, rightsIssuerUrl) {
    let systemName = '';
    let description;

    switch(errorState) {
      case 0:
        description = "ErrorState 0 no license, consumption of the content is blocked";
        break;
      case 1:
        description = "ErrorState 1 invalid License, consumption of the content is blocked";
        break;
      case 2:
        description = "ErrorState 2 valid License, consumption of the content is unblocked";
        break;
      default:
        description = "Unknown (" + errorState + ")";
        break;
    }

    if (drmSystemId) {
        if (drmSystemId.indexOf("19188") !== -1) {
            systemName = 'Marlin';
        } else if (drmSystemId.indexOf("19219") !== -1) {
            systemName = 'PlayReady';
        } else {
            systemName = drmSystemId;
        }
    }

    let errMessage = "[DrmAgent] onDRMRightsError (from " + systemName + "): " + description + "; contentId:" + contentId + "; rightsIssuerUrl: " + rightsIssuerUrl;
    console.warn(errMessage);

    if(this.OnFail) {
      this.OnFail(errMessage);
    }
  }
}

export default DRMLicenseAcquisitor;