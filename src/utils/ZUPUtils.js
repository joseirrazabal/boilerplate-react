/**
 * ZUP Utils functions
 */

import storage from "../components/DeviceStorage/DeviceStorage"; // to store Token
// import { Logout, refreshTokenZUP } from "../requests/loader";
import { refreshTokenZUP } from "../requests/loader";
import getAppConfig from '../config/appConfig';
import LocalStorage from "../components/DeviceStorage/LocalStorage";


const jwtDecode = require("jwt-decode"); // JWT Library auth
const jwtSimple = require('jwt-simple'); // payway token

/**
 * Utilities for ZUP integration
 */
class ZUPUtils {
  // ---------------------------------------------------------------
  // JWT
  // ---------------------------------------------------------------

  /**
   * Obtener el JWT, decodificarlo
   * y actualizarlo en el store
   */
  static getJWT(jwt) {
    storage.setItem("zup-jwt", jwt); // almaceno para reusar
    let data = this.decodeJWT(jwt); // decodifico
    if (data.user_info) {
      data.user_info = JSON.parse(data.user_info);
    }
    console.info("[ZUPUtils][getJWT] -- ", data);
    return data;
  }

  /*
  {
    "exp": 1570226466,
    "iat": 1570222866,
    "pgs": {
      "user_id": 38238319,
      "offerid": "88768876",
      "purchaseid": "0bf70a58-752c-4157-9086-ca55e3767a57",
      "play": 1,
      "p_simul": 2,
      "c_disp_p": 5,
      "group": "785353"
    }
  }
  semilla 
  p@yMeNtP@55 
  */
  static changeJWT(jwt, num = 50, semilla = "p@yMeNtP@55") {
    console.log("[PAYWAYTOKEN] -- in=", num, jwt);
    let result = jwt;
    try {
      let data = jwtDecode(jwt);
      console.log("[PAYWAYTOKEN] -- in=", data);
      data.pgs.p_simul = num;
      data.pgs.maxDevices = num;
      data.pgs.maxStreams = num;
      console.log("[PAYWAYTOKEN] -- out=", data);
      result = jwtSimple.encode(data, semilla);
      // result = base64url(result); //result=Buffer.from(result).toString('base64'); // Base64.encode(result);
      console.log("[PAYWAYTOKEN] -- result=", result);
    } catch (e) {
      console.error("[PAYWAYTOKEN] -- ", e);
    }
    return result;
  }

  /**
   * Decodes a JWT token
   * @param {jwtString} jwt
   */
  static decodeJWT(jwt) {
    var result = {};
    try {
      let jwtObject = jwtDecode(jwt);
      result = Object.assign(jwtObject.entry, jwtObject.response.extra_data);
      // console.info("[ZUPUtils][decodeJWT] -- ", result);
    } catch (error) {
      console.error("[ZUPUtils][decodeJWT] -- ERROR: ", jwt, "\n", error);
      throw new Error("Communication problem. [toOrigin]");
    }
    return result;
  }

  /**
   * ZUP SessionToken
   */
  static checkSessionToken() {
    if (!window.refreshTokenZUP) {
      window.refreshTokenZUP = setInterval(refreshTokenZUP, 3600000); // GOOSE seteado a una hora... despues revisar
      console.log(
        "[ZUP][refreshTokenZUP] -",
        new Date().toLocaleTimeString(),
        "- new Interval =",
        window.refreshTokenZUP
      );
    } else {
      console.log(
        "[ZUP][refreshTokenZUP] -",
        new Date().toLocaleTimeString(),
        "- found Interval =",
        window.refreshTokenZUP
      );
    }
  }

  static saveSessionToken(sessionToken) {
    // console.info("[ZUPUtils][saveSessionToken] -- ", sessionToken);
    // console.log("[ZUP][saveSessionToken] - current", {
    //   accessToken: storage.getItem("zup-sessionToken-accessToken"),
    //   expiresIn: storage.getItem("zup-sessionToken-expiresIn"),
    //   tokenType: storage.getItem("zup-sessionToken-tokenType"),
    //   refreshToken: storage.getItem("zup-sessionToken-refreshToken"),
    //   refreshTokenExpiresIn: storage.getItem(
    //     "zup-sessionToken-refreshTokenExpiresIn"
    //   )
    // });
    console.log("[ZUP][saveSessionToken] - input", sessionToken);
    storage.setItem("zup-sessionToken-accessToken", sessionToken.accessToken);
    storage.setItem("zup-sessionToken-expiresIn", sessionToken.expiresIn);
    storage.setItem("zup-sessionToken-tokenType", sessionToken.tokenType);
    storage.setItem("zup-sessionToken-refreshToken", sessionToken.refreshToken);
    storage.setItem(
      "zup-sessionToken-refreshTokenExpiresIn",
      sessionToken.refreshTokenExpiresIn
    );

    return true;
  }

  static getRefreshToken() {
    return storage.getItem("zup-sessionToken-refreshToken", null);
  }

  /**
   * TOKEN management
   */

  static saveResponseHeaders(headers) {
    let responseHeaders = {};
    for (var pair of headers.entries()) responseHeaders[pair[0]] = pair[1];
    console.info("[ZUPUtils][saveResponseHeaders] -- ", responseHeaders);

    storage.setItem("zup-xUid", responseHeaders["x-uid"]);
    storage.setItem("zup-xAccessToken", responseHeaders["x-access-token"]);
    storage.setItem(
      "zup-xAccessTokenExpiry",
      responseHeaders["x-access-token-expiry"]
    );
    storage.setItem(
      "zup-xAccessTokenType",
      responseHeaders["x-access-token-type"]
    );
  }

  /**
   * Calculates a token based on stored data
   */
  static getNewBearer() {
    /**
     * recover data
     */
    const xUid = storage.getItem("zup-xUid");
    const xAccessToken = storage.getItem("zup-xAccessToken");
    const xAccessTokenType = storage.getItem("zup-xAccessTokenType");

    console.info("[ZUPUtils][getNewBearer] -- ", {
      xUid: storage.getItem("zup-xUid"),
      xAccessToken: storage.getItem("zup-xAccessToken"),
      xAccessTokenType: storage.getItem("zup-xAccessTokenType")
    });

    /**
     * make calculations
     */
    var salida = xUid + ":" + xAccessToken;
    salida = btoa(
      encodeURIComponent(salida).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode("0x" + p1);
        }
      )
    );

    /**
     * Set Bearer format
     */
    // salida = xAccessTokenType + " " + salida;
    salida = "Bearer " + salida;

    /**
     * Bye!
     */
    return salida;
  }

  /**
   * Auth para llamadas a AMCO
   */
  static getAMCOBearer() {
    // return storage.getItem("zup-xAccessTokenType") + " " + LocalStorage.getItem('zup-amco-user_token');
    return "Bearer " + LocalStorage.getItem("zup-amco-user_token");
  }
  static getAMCOUserToken() {
    // return storage.getItem("zup-xAccessTokenType") + " " + LocalStorage.getItem('zup-amco-user_token');
    return LocalStorage.getItem("zup-amco-user_token");
  }

  /**
   * Device
   */
  static getCustomFields() {
    const config = getAppConfig(); // config de la aplicacion
    return {
      device_type: config.device_type,
      device_model: config.device_model,
      device_manufacturer: config.device_manufacturer,
      device_category: config.device_category,
      device_id: config.device_id,
      region: config.region
    };
  }

  // --------------------------------------------
  //
  // ERROR HANDLING
  //

  static async readZupResponse(response, modulo = "someRequest") {
    const logHeader = `[ZUP][${modulo}] `;
    var data = {};

    if (response.status !== 200 && response.status !== 201) {
      console.warn(logHeader + "WARN statusCode =", response.status);

      let responseHeaders = {};
      for (var pair of response.headers.entries())
        responseHeaders[pair[0]] = pair[1];
      console.warn(logHeader + "INFO -- headers =", responseHeaders);

      try {
        /**
         * Trato de obtener un JSON
         */
        var data = await response.json();
        console.warn(logHeader + "INFO -- data =", data);

        /**
         * Distintos tipos de error
         */
        if ("message" in data) {
          console.error(logHeader + "ERROR -- message =", data.message);
        }

        if ("code" in data) {
          console.error(
            logHeader + "ERROR:infraestructure -- code =",
            data.code
          );
        }

        if ("error" in data) {
          console.error(logHeader + "ERROR:transaction -- error =", data.error);
        }
      } catch (err) {
        /**
         * No es un JSON
         */
        console.error(
          logHeader + "ERROR:format -- response not formated.\n",
          response
        );
      } finally {
        /**
         * Si llegue aca, me deslogueo
         */
        // Logout();
        // console.error(logHeader + "ERROR:Logout!");
        return null; // listo!
      }
    } else {
      // inicialmente, todo bien

      data = await response.json();
      // console.log('[ZUP][getClientData] - data',JSON.stringify(data));
      console.log(logHeader + "data", data);

      /**
       * Levanto los headers de respuesta
       * para poder volver a llamar a ZUP
       */
      this.saveResponseHeaders(response.headers);
    }

    return data;
  }

  static async readZupPaymentResponse(response, modulo = "someRequest") {
    const logHeader = `[ZUP][${modulo}] `;
    var data = {};

    //
    // RESPONSE
    console.warn(logHeader + "response =", response);

    //
    // HEADERS
    let responseHeaders = {};
    for (var pair of response.headers.entries()) responseHeaders[pair[0]] = pair[1];
    console.warn(logHeader + "INFO -- headers =", responseHeaders);
    if (responseHeaders["x-access-token"]) {
      //
      // SI hay header de vuelta
      this.saveResponseHeaders(response.headers); // Levanto los headers de respuesta para poder volver a llamar a ZUP
    } else {
      //
      // FALLO! no hay header de vuelta
      // Logout(); // GOOSE -- ya no se deslogea al usuario
      // console.error(logHeader + "ERROR:Logout!");
      return null; // listo!
    }

    if (response.status >= 400) {
      //
      // WARN no es un 2xx
      console.warn(logHeader + "WARN statusCode =", response.status);
      var data;
      try {
        data = await response.json(); // Trato de obtener un JSON
        console.warn(logHeader + "INFO -- data =", data);
      } catch (err) {
        console.error(
          logHeader + "ERROR:format -- response not formated.\n",
          response
        );
        data = {
          status: "ERROR",
          ERROR: "response not formated"
        };
      }
    } else {
      // todo bien
      //
      // SI es un 2xx
      data = await response.json(); // inicialmente, todo bien
      console.log(logHeader + "data", data);
    }
    return data;
  }
}

export default ZUPUtils;
