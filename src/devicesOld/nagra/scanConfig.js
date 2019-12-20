class ScanConfiguration {
  /**
   * 0 for satellite
   * 1 for cable
   */
  networkType = 1;

  /*
   * constants
   */
  NETWORK_CLASSES_PATH = '/network/siconfig/networkClasses/';
  SCANS_PATH = '/network/siconfig/scans/';

  /*
   * cable network class
   */

  // paths for cable network
  cable_network_class = 'my_cable_class';
  cable_scan_mode = 'my_cable_one_shot';
  cable_network_class_path = `${this.NETWORK_CLASSES_PATH}${this.cable_network_class}/`;
  cable_tp0_delivery_path = `${this.NETWORK_CLASSES_PATH}${this.cable_network_class}/transponders/0/dvbc/'`;
  cable_scan_mode_path = `${this.SCANS_PATH}${this.cable_scan_mode}/'`;

  // cable class info
  cab_class = [
    ['tunerType', 1],
    ['siNetworkType', 256],
    ['SISources', ['dvbSvlSource', 'dvbEITPFSource', 'dvbEITSSource']]
  ];

  // cable delivery info
  cab_delivery = [
    ['frequency', 519000],  // khz
    ['fecInner', 2],        // 2/3
    ['symbolRate', 5361],   // kbaud
    ['fecOuter', 0],        // not defined
    ['modulation', 5],      // 256QAM
    ['networkId', 1],
    ['isDvbC2', false],
    ['endFrequency', 0]
  ];

  // cable scan mode info
  cab_mode = [
    ['useConnectedTuners', true],
    ['automatic', true],
    ['networkClass', this.cable_network_class],
    ['enabled', true],
    ['scanType', 2],
    ['persistent', true]
  ];

  /*
   * satellite network class
   */

  // pathes for satellite network
  satellite_network_class = 'my_satellite_class';
  satellite_scan_mode = 'my_satellite_one_shot';
  satellite_network_class_path = `${this.NETWORK_CLASSES_PATH}${this.satellite_network_class}/`;
  satellite_tp0_delivery_path = `${this.NETWORK_CLASSES_PATH}${this.satellite_network_class}/transponders/0/dvbs/'`;
  satellite_scan_mode_path = `${this.SCANS_PATH}${this.satellite_scan_mode}/`;
  dvbsLnbProfilePath = '/system/devices/tnrmgr/';

  // satellite class info
  sat_class = [
    ['tunerType', 0],
    ['siNetworkType', 256],
    ['SISources', ['dvbSvlSource', 'dvbEITPFSource', 'dvbEITSSource']]
  ];

  // sat delivery info
  sat_delivery = [
    ['frequency', 11170000],  // khz
    ['fecInner', 2],
    ['symbolRate', 27500],   // kbaud
    ['modulation', 1],
    ['lnbPolarization', 1],
    ['rollOff', 2],
    ['isDVBS2', false],
    ['networkId', 2]
  ];

  dvbsLnbParameters = [
    ['lnbFreqLoKhz', 9750000],
    ['lnbFreqHiKhz', 10600000],
    ['lnbFreqSwKhz', 11700000],
    ['lnbPower', false]
  ];

  // sat scan mode info
  sat_mode = [
    ['useConnectedTuners', false],
    ['automatic', false],
    ['networkClass', this.satellite_network_class],
    ['enabled', true],
    ['scanType', 2],
    ['persistent', false]
  ];

  cableConfig = {};
  satConfig = {};

  constructor() {
    this.setSatellitSettings();
    this.setCableSettings();
  }

  // cable configman settings
  setCableSettings() {
    this.cableConfig[this.cable_network_class_path] = this.cab_class;
    this.cableConfig[this.cable_tp0_delivery_path] = this.cab_delivery;
    this.cableConfig[this.cable_scan_mode_path] = this.cab_mode;
  }

  // satellite configman settings
  setSatellitSettings() {
    this.satConfig[this.satellite_network_class_path] = this.sat_class;
    this.satConfig[this.satellite_tp0_delivery_path] = this.sat_delivery;
    this.satConfig[this.satellite_scan_mode_path] = this.sat_mode;
    this.satConfig[this.dvbsLnbProfilePath] = this.dvbsLnbParameters;
  }

  /* Satellite */
  getSatConfiguration() {
    return this.satConfig;
  }

  getSatScanMode() {
    return this.satellite_scan_mode;
  }

  /* Cable */
  getCableConfiguration() {
    return this.cableConfig;
  }

  getCableScanMode() {
    return this.cable_scan_mode;
  }
}

export default new ScanConfiguration();
