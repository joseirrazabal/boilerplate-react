
import { remindControlPin } from '../../requests/loader';


class UtilsPin {

  static sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  static async sendRemind() {
    let requestParams = {};
    let functionToRequest = () => {
    };
    functionToRequest = this.performRemindControlPin;
    const response = await functionToRequest(requestParams);
    console.log(response);
  }

  static async performRemindControlPin(params = {}) {
    const response = {success: false};
    try {
      const result = await remindControlPin(params);
      if (result && result.status == '0') {
        response.success = true;
      }
    } catch (error) {
      response.error = error;
    }
    return response;
  }

}

export default UtilsPin;
