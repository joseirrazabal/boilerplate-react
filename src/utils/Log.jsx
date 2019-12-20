/**
 * Class Log
 * Manejo de log de errores para NewRelic
 */

class Log {

    /**
     * Logs an error into NewRelic
     * @param {Error} err error object
     * @param {Object} data datos extra (tag,params,url,etc.)
     */
    static error(err,tag,data={}){
        // Into NewRelic
        if (typeof window.newrelic === 'object') {
            window.newrelic.noticeError(err,{tag:tag,data:data});
        }    
    }

}

export default Log;
