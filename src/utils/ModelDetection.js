import Device from "../devices/device";

class ModelDetection {
  constructor() {
    this.DEVICE_STV_MODEL = {
      sony: [
        {
          device: "sony-bravia",
          modelId:  "KDL-32W700B",
          description: "32in",
          userAgent: "Opera/9.80 (Linux armv7l) Presto/2.12.407 Version/12.50 SonyCEBrowser/1.0 (DTV14/KDL-32W700B; CTV/PKG3.004AAA; MEX; es;)",
        }, {
          device: "sony-bravia",
          modelId: "KDL-40W600B",
          description: "40in",
          userAgent: "Opera/9.80 (Linux armv7l) Presto/2.12.407 Version/12.50 SonyCEBrowser/1.0 (DTV13/KDL-40W600B; CTV/PKG3.004AAA; MEX; es;)",
        }
      ],
      tizen: [
        {
          device: "samsung-tizen",
          userAgent: "Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/2.4.0 TV Safari/538.1",
        },
        {
          device: "samsung-hybrid",
          userAgent: "Mozilla/5.0 (Linux; Tizen 2.3) AppleWebKit/538.1 (KHTML, like Gecko)Version/2.3 TV Safari/538.1",
        },
      ],
    };
  }

  getDeviceDescription() {
    const platform = Device.getDevice().platform;
    const userAgent = Device.getDevice().getId().getUserAgent();
    const deviceType = Device.getDevice().getId().getDeviceType();
    let modelSTV = {
      deviceType,
      platform,
      modelDevice: null,
    };

    if(Object.keys(this.DEVICE_STV_MODEL).indexOf(platform) > -1 ){
      const device_models = this.DEVICE_STV_MODEL[platform];

      const model_object = device_models.filter(device => userAgent === device.userAgent.toLowerCase());
      if(model_object.length > 0) {
        modelSTV = {
          ...modelSTV,
          modelDevice: model_object[0].device,
          modelId: model_object[0].modelId,
          description: model_object[0].description,
        };
      }
    }

    return modelSTV;
  }
}

export default new ModelDetection();
