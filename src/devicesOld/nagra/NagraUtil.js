class NagraUtil {
    static getNagraUriByChannelKey(channelKey) {
        let sourceUri = null;
        try {
            let resultSet = window.CCOM.EPG.getServicesRSByQuery('serviceId,uri,name,access,channelKey', 'channelKey=' + channelKey, null);
            let resultArray = resultSet.getNext(1); // Only expects one result
            let /* i = 0, */ lg = resultArray.length;
            resultSet.reset();

            if(lg > 0 && resultArray[0]) {
                console.log('[RESULTSET getServicesRSByQuery] SUCCESS> ' +  resultArray[0].uri + ', channelKey: ' + resultArray[0].channelKey + ', name: ' + resultArray[0].name);
                sourceUri = resultArray[0].uri;
                // Yes, it may happen :/
                if(channelKey !== resultArray[0].channelKey) {
                console.log('[RESULTSET getServicesRSByQuery] playing channel from cable may be fails, because we need channelKey: ' + channelKey + ' but NAGRA return channelKey: ' + resultArray[0].channelKey);
                }
            } 
            else {
                console.log('[RESULTSET getServicesRSByQuery] FAILS, channelKey: ' + channelKey);
            }
        }
        catch(e) {
            console.log('[RESULTSET] error ');
            console.log(e);
        }

        return sourceUri;
    }
}

export default NagraUtil;