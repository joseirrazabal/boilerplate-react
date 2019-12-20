import Metadata from '../../requests/apa/Metadata';
import getAppConfig from "../../config/appConfig";
import Utils from '../../utils/Utils';
import CounterValidEmailTask from '../../requests/tasks/user/CounterValidEmailTask';
import ModifyUserTask from '../../requests/tasks/user/ModifyUserTask';
import RequestManager from "../../requests/RequestManager";
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';

class UtilsIpTelmex {
    constructor() {

    }

    static async validateMail(userhash) {

        //Harcode para oblgar a mostrar el cambio de correo
        /*
        return new Promise((resolve, reject) => {
            resolve({
                        validEmail : false,
                        userDetectWS: {}
                    });
        });
        */

        const task = new CounterValidEmailTask({ userhash: userhash });
        const result = await RequestManager.addRequest(task);
        const user_mail_validation = JSON.parse(Metadata.get("user_mail_validation","{\"mexico\":{\"enable\":true,\"limit\":3},\"default\":{\"enable\":false,\"limit\":3}}"));
        const region = DeviceStorage.getItem('region');

        try {

            if ((user_mail_validation[region] && user_mail_validation[region].enable === false) || userhash === '' ) {
                return new Promise((resolve, reject) => {
                    resolve({
                        validEmail : true,
                        userDetectWS: {}
                    });
                });
            }

            if (result.response) {

                const limit = user_mail_validation[region] && user_mail_validation[region].limit ? user_mail_validation[region].limit : 0;

                if (result.response.counterValidEmail <= limit) {
                    return new Promise((resolve, reject) => {
                        resolve({
                            validEmail: true,
                            userDetectWS: {}
                        });
                    });
                } else
                {
                    return new Promise((resolve, reject) => {
                        resolve(result.response)
                    });
                }

            }
        } catch (err) {
            return new Promise((resolve, reject) => {
                resolve({
                    validEmail: true,
                    userDetectWS: {}
                });
            });
        }
    }

    static async userModifyMail(email, user_hash) {
        const task = new ModifyUserTask({ email: email, user_hash: user_hash});
        const result = await RequestManager.addRequest(task);
        return new Promise((resolve, reject) => {
            resolve(result.response);
        });
    }
}

export default UtilsIpTelmex;
