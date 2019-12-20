/**
 * Stub for CCOM 2.0 IpNetwork, CCOM.IpNetwork, for managing IP networks
 * This singleton object has been added since OTV v5.0.0
 */


var CCOM = window.CCOM || {};
CCOM.IpNetwork = CCOM.IpNetwork || (function () {
    "use strict";
    var _MY_NAME_SPACE = "CCOM.IpNetwork",
        _id = CCOM.stubs.uuid(),

        _EVENT_CONNECT_TO_WIRELESS_NETWORK_FAILED = "connectToWirelessNetworkFailed",
        _EVENT_CONNECT_TO_WIRELESS_NETWORK_OK = "connectToWirelessNetworkOk",
        _EVENT_CONNECT_TO_WPS_NETWORK_FAILED = "connectToWpsNetworkFailed",
        _EVENT_CONNECT_TO_WPS_NETWORK_OK = "connectToWpsNetworkOk",
        _EVENT_CONTROL_INTERFACE_FAILED = "controlInterfaceFailed",
        _EVENT_CONTROL_INTERFACE_OK = "controlInterfaceOk",
        _EVENT_GET_INTERFACE_CONFIG_OK = "getInterfaceConfigOK",
        _EVENT_GET_INTERFACE_CONFIG_FAILED = "getInterfaceConfigFailed",
        _EVENT_REDISCOVER_ACS_URL_FAILED = "rediscoverAcsUrlFailed",
        _EVENT_REDISCOVER_ACS_URL_OK = "rediscoverAcsUrlOk",
        _EVENT_PING_FAILED = "pingFailed",
        _EVENT_PING_OK = "pingOk",
        _EVENT_SCAN_FOR_WIRELESS_NETWORKS_FAILED = "scanForWirelessNetworksFailed",
        _EVENT_SCAN_FOR_WIRELESS_NETWORKS_OK = "scanForWirelessNetworksOk",
        _EVENT_SET_INTERFACE_CONFIG_OK = "setInterfaceConfigOK",
        _EVENT_SET_INTERFACE_CONFIG_FAILED = "setInterfaceConfigFailed",
        _EVENT_SET_WIRELESS_CONFIG_FAILED = "setWirelessConfigFailed",
        _EVENT_SET_WIRELESS_CONFIG_OK = "setWirelessConfigOk",
        _EVENT_SET_WIRELESS_STATE_FAILED = "setWirelessStateFailed",
        _EVENT_SET_WIRELESS_STATE_OK = "setWirelessStateOk",
        _EVENT_WAKE_DEVICE_FAILED = "wakeDeviceFailed",
        _EVENT_WAKE_DEVICE_OK = "wakeDeviceOk",
        _EVENT_GET_ACS_URL_FAILED = "getAcsUrlFailed",
        _EVENT_GET_ACS_URL_OK = "getAcsUrlOk",
        _EVENT_GET_GATEWAY_IDENTITY_FAILED = "getGatewayIdentityFailed",
        _EVENT_GET_GATEWAY_IDENTITY_OK = "getGatewayIdentityOk",
        _EVENT_GET_PROVISIONING_CODE_FAILED = "getProvisioningCodeFailed",
        _EVENT_GET_PROVISIONING_CODE_OK = "getProvisioningCodeOk",
        _EVENT_REFRESH_DEVICE_INFO_FAILED = "refreshDeviceInfoFailed",
        _EVENT_REFRESH_DEVICE_INFO_OK = "refreshDeviceInfoOk",
        _EVENT_SET_INTERFACE_STATE_OK = "setInterfaceStateOK",
        _EVENT_SET_INTERFACE_STATE_FAILED = "setInterfaceStateFailed",
        _EVENT_GET_IPV6_ACS_URL_FAILED = "getIpv6AcsUrlFailed",
        _EVENT_GET_IPV6_ACS_URL_OK = "getIpv6AcsUrlOk",
        _EVENT_GET_IPV6_GATEWAY_IDENTITY_FAILED = "getIpv6GatewayIdentityFailed",
        _EVENT_GET_IPV6_GATEWAY_IDENTITY_OK = "getIpv6GatewayIdentityOk",
        //_EVENT_GET_INTERFACE_CONFIG_FAILED = "getIpv6InterfaceConfigFailed",
        //_EVENT_GET_INTERFACE_CONFIG_OK = "getIpv6InterfaceConfigOk",
        _EVENT_GET_IPV6_PROVISIONING_CODE_FAILED = "getIpv6ProvisioningCodeFailed",
        _EVENT_GET_IPV6_PROVISIONING_CODE_OK = "getIpv6ProvisioningCodeOk",

        _supportedEvents = [_EVENT_CONNECT_TO_WIRELESS_NETWORK_FAILED,
                            _EVENT_CONNECT_TO_WIRELESS_NETWORK_OK,
                            _EVENT_CONNECT_TO_WPS_NETWORK_FAILED,
                            _EVENT_CONNECT_TO_WPS_NETWORK_OK,
                            _EVENT_CONTROL_INTERFACE_FAILED,
                            _EVENT_CONTROL_INTERFACE_OK,
                            _EVENT_GET_INTERFACE_CONFIG_FAILED,
                            _EVENT_GET_INTERFACE_CONFIG_OK,
                            _EVENT_REDISCOVER_ACS_URL_FAILED,
                            _EVENT_REDISCOVER_ACS_URL_OK,
                            _EVENT_GET_INTERFACE_CONFIG_FAILED,
                            _EVENT_GET_INTERFACE_CONFIG_OK,
                            _EVENT_PING_FAILED,
                            _EVENT_PING_OK,
                            _EVENT_SCAN_FOR_WIRELESS_NETWORKS_FAILED,
                            _EVENT_SCAN_FOR_WIRELESS_NETWORKS_OK,
                            _EVENT_SET_INTERFACE_CONFIG_FAILED,
                            _EVENT_SET_INTERFACE_CONFIG_OK,
                            _EVENT_SET_INTERFACE_CONFIG_FAILED,
                            _EVENT_SET_INTERFACE_CONFIG_OK,
                            _EVENT_SET_WIRELESS_CONFIG_FAILED,
                            _EVENT_SET_WIRELESS_CONFIG_OK,
                            _EVENT_SET_WIRELESS_STATE_FAILED,
                            _EVENT_SET_WIRELESS_STATE_OK,
                            _EVENT_WAKE_DEVICE_FAILED,
                            _EVENT_WAKE_DEVICE_OK,
                            _EVENT_GET_ACS_URL_FAILED,
                            _EVENT_GET_ACS_URL_OK,
                            _EVENT_GET_GATEWAY_IDENTITY_FAILED,
                            _EVENT_GET_GATEWAY_IDENTITY_OK,
                            _EVENT_GET_PROVISIONING_CODE_FAILED,
                            _EVENT_GET_PROVISIONING_CODE_OK,
                            _EVENT_REDISCOVER_ACS_URL_FAILED,
                            _EVENT_REDISCOVER_ACS_URL_OK,
                            _EVENT_REFRESH_DEVICE_INFO_FAILED,
                            _EVENT_REFRESH_DEVICE_INFO_OK,
                            _EVENT_SET_INTERFACE_STATE_FAILED,
                            _EVENT_SET_INTERFACE_STATE_OK,
                            _EVENT_GET_IPV6_ACS_URL_FAILED,
                            _EVENT_GET_IPV6_ACS_URL_OK,
                            _EVENT_GET_IPV6_GATEWAY_IDENTITY_FAILED,
                            _EVENT_GET_IPV6_GATEWAY_IDENTITY_OK,
                            _EVENT_GET_INTERFACE_CONFIG_FAILED,
                            _EVENT_GET_INTERFACE_CONFIG_OK,
                            _EVENT_GET_IPV6_PROVISIONING_CODE_FAILED,
                            _EVENT_GET_IPV6_PROVISIONING_CODE_OK,
                            _EVENT_SET_INTERFACE_CONFIG_FAILED,
                            _EVENT_SET_INTERFACE_CONFIG_OK
                           ],

        _ver = CCOM.stubs.getCurrentMWVersion(),
        _obj = {},

        _DOMAIN = "com.opentv.IpNetwork";


    _obj = {
		//WirelessEncryption
        ENCRYPT_DEFAULT: 0,
        ENCRYPT_WEP: 1,
        ENCRYPT_TKIP: 2,
        ENCRYPT_AES: 3,
        ENCRYPT_TKIPAES: 4,
        ENCRYPT_NONE: 5,

		//WirelessSecurity
        WEP: 0,
        WPA: 1,
        WPA2: 2,
        OPEN: 3,

         //InterfaceType
        INTERFACE_TYPE_WIRED: 0,
        INTERFACE_TYPE_WIRELESS: 1,
		INTERFACE_TYPE_DOCSIS: 2,
        INTERFACE_TYPE_VIRTUAL: 3,

        //WirelessProtocol
        A: 1,
        B: 2,
        G: 4,
        N: 8,

        //WpsMode
        WPS_MODE_PBC_ENROLLEE: 0,
        WPS_MODE_PBC_REGISTRAR: 1,
        WPS_MODE_PIN_ENROLLEE: 2,
        WPS_MODE_PIN_REGISTRAR: 3,

		//DslModemMode
        BRIDGING: 0,
        ROUTING: 1,

		//DslModemProtocol
        PPPOE: 0,
        PPPOA: 1,

		//WirelessApFrequency
		"2400MHZ": 0,
		"5000MHZ": 1,

        //WirelessApConnType
        MANUAL: 0,
        WPS: 1,

        //DeviceType
        CABLE_MODEM: 0,
        DSL_MODEM: 1,
        WIRELESS_AP: 2,

        //InterfaceProtocol
        IPV4: 0,
        IPV6: 1,
        BOTH: 2,

        //AddressAssignMode
        STATELESS: 0,
        STATELFUL: 1,
        DHCPV6: 2,
        STATIC: 3,

        //MulticastType
        MULTICAST_NONE: 0,
        MULTICAST_AVAILABLE: 1,
        MULTICAST_CURRENT: 2,


        //Methods
        connectToWirelessNetwork: function (id, ssid, security, key, encryp_mode) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CONNECT_TO_WIRELESS_NETWORK_FAILED, {
                target: this,
                handle: 1,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        connectToWpsNetwork: function (id, mode) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CONNECT_TO_WPS_NETWORK_FAILED, {
                target: this,
                handle: 1,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        controlInterface: function (id, state) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_CONTROL_INTERFACE_FAILED, {
                target: this,
                handle: 1,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        getInterfaceConfig: function (id) {
            var hdl = CCOM.stubs.getHandle(), ifs = this["interface"][0];
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_INTERFACE_CONFIG_OK, {
                target: this,
                handle: hdl,
                id: ifs.id,
                ip: ifs.ip,
                mac: ifs.mac,
                netmask: ifs.netmask,
                gateway: ifs.gateway
            });
            return hdl;
        },
        getWirelessConfig: function (id) {
            var hdl = CCOM.stubs.getHandle();
            if (id >= this.wireless.length) {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REDISCOVER_ACS_URL_FAILED, {
                    target: this,
                    handle: hdl,
                    error: {
                        domain: _DOMAIN,
                        name: "wrongID",
                        message: "error"
                    }
                });
                return hdl;
            }
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_INTERFACE_CONFIG_OK, {
                target: this,
                handle: hdl,
                details: this.wireless[id]
            });
            return hdl;
        },
        ping: function (ip) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_PING_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        scanForWirelessNetworks: function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SCAN_FOR_WIRELESS_NETWORKS_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "wrongID",
                    message: "error"
                }
            });
            return hdl;
        },
        setInterfaceConfig: function (id, ip, mac, netmask, gateway) {
            var hdl = CCOM.stubs.getHandle(), ifs;
            if (id < this["interface"].length) {
                ifs = this["interface"][id];
                ifs.ip = ip;
                ifs.mac = mac;
                ifs.netmask = netmask;
                ifs.gateway = gateway;
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_INTERFACE_CONFIG_OK, {
                    target: this,
                    handle: 1
                });
                return hdl;
            } else {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_INTERFACE_CONFIG_FAILED, {
                    target: this,
                    handle: hdl,
                    error: {
                        domain: _DOMAIN,
                        name: "wrongID",
                        message: "error"
                    }
                });
                return hdl;
            }
        },
        setInterfaceDns: function (id, dns_list) {
            var i;
            for (i = 0; i < dns_list.length; i++) {
                this.dns[i] = dns_list[i];
            }
        },
        setIpAddress: function (id, ip, netmask) {
            if (id < this["interface"].length) {
                var ifs = this["interface"][id];
                ifs.ip = ip;
                ifs.netmask = netmask;
            } else {
                return {
                    error: {
                        domain: _DOMAIN,
                        name: "invalidParams",
                        message: "error"
                    }
                };
            }
        },
        setIpAddressAndGateway: function (id, ip, netmask, gateway) {
            if (id < this["interface"].length) {
                var ifs = this["interface"][id];
                ifs.ip = ip;
                ifs.netmask = netmask;
                ifs.gateway = gateway;
            } else {
                return {
                    error: {
                        domain: _DOMAIN,
                        name: "invalidParams",
                        message: "error"
                    }
                };
            }
        },
        setWakeOnLan: function (id, enable) {
            if (id < this["interface"].length) {
                this["interface"][id].wolEnabled = enable;
            } else {
                return {
                    error: {
                        domain: _DOMAIN,
                        name: "invalidParams",
                        message: "error"
                    }
                };
            }
        },
        setWirelessConfig: function (id, details) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_WIRELESS_CONFIG_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        getWirelessState: function (id) {
            return true;
        },
        setWirelessState: function (id, state) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_WIRELESS_STATE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        wakeDevice: function (uuid) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_WAKE_DEVICE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        },
        addEventListener: function (event, callback) {
            if (-1 === _supportedEvents.indexOf(event)) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }

            return CCOM.stubs.addEventListener(_id, _MY_NAME_SPACE, event, callback);
        },
        removeEventListener: function (event, callback) {
            if (-1 === _supportedEvents.indexOf(event)) {
                return CCOM.stubs.ERROR_INVALID_EVENT;
            }

            return CCOM.stubs.removeEventListener(_id, _MY_NAME_SPACE, event, callback);
        },

        /*
         * properties
         */
        dns: [ "192.168.1.1", "192.168.1.10" ],
        gateway: "192.168.1.1",
        "interface": [ {
            dhcpEnabled: true,
            gateway: "192.168.1.1",
            id: 0,
            ip: "192.168.1.110",
            linkUp: true,
            mac: "00:08:64:00:00:00",
            name: "eth0",
            netmask: "255.255.255.0",
            state: true,
            //type: CCOM.IpNetwork.INTERFACE_TYPE_WIRED,
            type: 1,
            wolEnabled: true,
            toSource: function () {
                return "";
            }
        } ],
        wireless : [ {
            //encryp_mode: CCOM.IpNetwork.ENCRYPT_AES,
            encryp_mode: 101,
            key: "Nagra_Opentv_AP",
            //protocol: CCOM.IpNetwork.A,
            protocol: 201,
            quality: 100,
            //security: CCOM.IpNetwork.WPA2,
            security: 303,
            ssid: "super_password"
        } ]
    };

    /*
     * Changes introduced in v5.1.1
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_1) {
        _obj.getAcsUrl = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_ACS_URL_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "wrongID",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.getGatewayIdentity = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_GATEWAY_IDENTITY_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "wrongID",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.getInterfaceState = function (id) {
            if (id < this["interface"].length) {
                var ifs = this["interface"][id];
                return ifs.state;
            }
            return {
                error: {
                    domain: _DOMAIN,
                    name: "wrongID",
                    message: "error"
                }
            };
        };
        _obj.getProvisioningCode = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_PROVISIONING_CODE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.rediscoverAcsUrl = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REDISCOVER_ACS_URL_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "wrongID",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.refreshDeviceInfo = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_REFRESH_DEVICE_INFO_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "wrongID",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.resetDefault = function (id) {
            return {
                error: {
                    domain: _DOMAIN,
                    name: "generic",
                    message: "error"
                }
            };
        };
        _obj.setInterfaceState = function (id, state) {
            var hdl = CCOM.stubs.getHandle(), ifs;
            if (id < this["interface"].length) {
                ifs = this["interface"][id];
                ifs.state = state;
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_INTERFACE_STATE_OK, {
                    target: this,
                    handle: 1
                });
                return hdl;
            } else {
                CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_INTERFACE_STATE_FAILED, {
                    target: this,
                    handle: hdl,
                    error: {
                        domain: _DOMAIN,
                        name: "wrongID",
                        message: "error"
                    }
                });
                return hdl;
            }
        };
        delete _obj.getWirelessState;
        delete _obj.setWirelessState;

        /*
         * added properties
         */
        _obj.cableModem = { connectedToCMTS: false,
                            dhcpEnabled: false,
                            firewallEnabled: false,
                            hardwareVersion: "-1",
                            ipAddressExternal: "0.0.0.0",
                            ipAddressInternal: "0.0.0.0",
                            ipv6Enabled: false,
                            macAddressExternal: "00:00:00:00:00:00",
                            macAddressInternal: "00:00:00:00:00:00",
                            serialNumber: "000000",
                            softwareVersion: "-1",
                            standardsCompliancy: "none",
                            wannetworkAccess: false
                          };
        _obj.deviceTypes = _obj.WIRELESS_AP;
        _obj.dslModem = { accountName: "nobody",
                          dhcpEnabled: false,
                          dnsNameServer: "0.0.0.0",
                          gateway: "0.0.0.0",
                          hardwareVersion: "-1",
                          ipAddressWan: "0.0.0.0",
                          ipv6Enabled: false,
                          macAddress: "00:00:00:00:00:00",
                          mode: _obj.ROUTING,
                          netmask: "255.255.255.255",
                          password: "none",
                          protocol: _obj.PPPOE,
                          serialNumber: "00000",
                          softwareVersion: "-1",
                          status: false
                        };
        _obj.revision = "0";
        _obj.wirelessAp = { channel: 0,
                            connectionType: _obj.MANUAL,
                            encryption: _obj.ENCRYPT_NONE,
                            frequency: 0,
                            numberOfRadio: 0,
                            protocol: _obj.A,
                            securityKey: "none",
                            securityMode: _obj.OPEN,
                            ssid: "none",
                            wirelessStatus: false
                          };
    }

    /*
     * Changes introduced in v5.1.2
     */
    if (_ver >= CCOM.stubs.MW_VER_5_1_2) {
        _obj.getIpv6AcsUrl = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_IPV6_ACS_URL_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.getIpv6GatewayIdentity = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_IPV6_GATEWAY_IDENTITY_FAILED, {
                target: this,
                handle: {},
                error: {
                    domain: _DOMAIN,
                    name: "notSupportedMethod",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.getIpv6InterfaceConfig = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_INTERFACE_CONFIG_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "getInterfaceListError",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.getIpv6ProvisioningCode = function (id) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_GET_IPV6_PROVISIONING_CODE_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "noDataAvailabel",
                    message: "error"
                }
            });
            return hdl;
        };
        _obj.setInterfaceIpv6Dns = function (id, dnsList) {
            return {
                error: {
                    domain: _DOMAIN,
                    name: "interfaceDisabled",
                    message: "error"
                }
            };
        };
        _obj.setIpv6InterfaceConfig = function (id, ip, prefixLength, gateway) {
            var hdl = CCOM.stubs.getHandle();
            CCOM.stubs.raiseEvent(_id, _MY_NAME_SPACE, _EVENT_SET_INTERFACE_CONFIG_FAILED, {
                target: this,
                handle: hdl,
                error: {
                    domain: _DOMAIN,
                    name: "setIDError",
                    message: "error"
                }
            });
            return hdl;
        };
    }

    return _obj;
}());