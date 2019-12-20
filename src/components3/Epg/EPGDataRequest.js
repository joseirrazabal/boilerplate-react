import Metadata from '../../requests/apa/Metadata';
import DeviceStorage from "../DeviceStorage/DeviceStorage";

var EPGDataRequest = (
    function() {
        
        var _region = DeviceStorage.getItem('region');
        var _totalRequestGroups = 10;
        var _requestGroupsDefault = ['0','1','2','3','4','5','6','7','8','9'];

        var _currentRequestGroups = [];
        var _currentRequestInterval;

        var _calculateStartIndex = function (idx, groupArray) {
            var start = 0;
            var i = 0;
            while(i < idx) {
                start = start + parseInt(groupArray[i]);
                i++;
            }
        
            return start;
        };

        var _initialiseEPGDataRequestGroups = function() {
            var _epgDataRequestGroups = JSON.parse(Metadata.get("epg_data_request_groups",'{"default":{"groups":"2,2,3,3", "request_interval": "120000"}}'));
            var _requestGroups = _epgDataRequestGroups[_region] ? _epgDataRequestGroups[_region].groups : _epgDataRequestGroups['default'].groups;

            _currentRequestInterval = _epgDataRequestGroups[_region] ? _epgDataRequestGroups[_region].request_interval : _epgDataRequestGroups['default'].request_interval;

            var _requestGroupsElements = _requestGroups.split(',');
            if(_requestGroupsElements && Array.isArray(_requestGroupsElements)) {
                var sum = 0;
                for(var i = 0, len = _requestGroupsElements.length; i < len; i++) {
                    sum = sum + parseInt(_requestGroupsElements[i]);
                }

                // Para protección :/, deben sumar 10 (son 10 terminaciones, del 0 al 9)
                if(sum !== _totalRequestGroups) {
                    _currentRequestGroups = [
                        {
                            values: [0,1],
                            request_interval: 0
                        },
                        {
                            values: [2,3],
                            request_interval: 120000
                        },
                        {
                            values: [4,5,6],
                            request_interval: (120000 * 2)
                        },
                        {
                            values: [7,8,9],
                            request_interval: (120000 * 3)
                        },
                    ];
                }
                else {
                    for(var i = 0, len = _requestGroupsElements.length; i < len; i++) {
                        var startIndex = _calculateStartIndex(i, _requestGroupsElements);
                        //console.log('[AAF] EPGDataRequest Slice de inicio en ', startIndex, 'con longitud ',  _requestGroupsElements[i], 'en array ', _requestGroupsDefault, 'fin: ', (startIndex + _requestGroupsElements[i]) );
                        var resgroup = _requestGroupsDefault.slice(startIndex, (startIndex + parseInt(_requestGroupsElements[i])));

                        var _requestInterval = _currentRequestInterval * i;
                         
                        //console.log('[AAF] EPGDataRequest Result:', resgroup);   
                        _currentRequestGroups.push({
                            values: resgroup,
                            request_interval: _requestInterval
                        });
                    }
                }
            }
        };

        var _getUserLastDigit = function(user_id) {
            
            if(!user_id) return null;

            var lastDigit = null;
            user_id = user_id.toString();
            if(user_id.length > 0) {
                lastDigit = user_id.slice(-1);
            }

            return lastDigit;
        };

        var _getRequestInterval = function(user_id) {
            //console.log('[AAF] EPGDataRequest _getRequestInterval con user_id: ', user_id);

            var defl = {
                values: [],
                msg: 'user id no es válido',
                request_interval: (12000 * 3)
            };

            if(isNaN(user_id)) return defl;

            if(!user_id) return defl;

            var last_digit = _getUserLastDigit(user_id);

            //console.log('[AAF] EPGDataRequest _getRequestInterval con last_digit: ', last_digit, _currentRequestGroups);
            var userGroup = null;
            if(_currentRequestGroups.length > 0) {
                for(var i = 0, len = _currentRequestGroups.length; i < len; i++) {
                    if(_currentRequestGroups[i].values.indexOf(last_digit) !== -1) {
                        userGroup = _currentRequestGroups[i]
                        break;
                    }   
                }             
            }

            //console.log('[AAF] EPGDataRequest _getRequestInterval con userGroup: ', userGroup);
            return userGroup;
        };

        return {
            initialise: function() {
                _initialiseEPGDataRequestGroups();
            },
            getRequestInterval: _getRequestInterval
        };
    }
)();

export default EPGDataRequest;