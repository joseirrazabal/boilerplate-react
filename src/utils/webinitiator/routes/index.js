import { Router }             from 'express';
import validate               from 'express-validation';
import axios                  from 'axios';
import Utils                  from '../requests/Utils';
import Minimize               from 'minimize';


import webInitiatorValidationRules from './validation/web-initiator';

const router = new Router();

router.get("/", validate(webInitiatorValidationRules), (req, res)  => {
  const {challenge, deviceid, manifest, laurl, provider} = req.query;
  axios.get(manifest).then((result) => {
    const xml = result.data;
    const object = Utils.xmlToObject(xml);
    const protectionObject = Utils.getProtectionData(object);
    let header = {
      LA_URL: protectionObject.DATA.LA_URL,
      KID: protectionObject.DATA.KID,
      CHECKSUM: protectionObject.DATA.CHECKSUM,
    }, customString;
    switch (provider) {
      case 'HBO':
        customString = challenge;
        header.LA_URL = protectionObject.DATA.LA_URL;
        break;
      default:
        customString = JSON.stringify({
          customdata: JSON.parse(challenge),
          device_id: deviceid
        });
        header.LA_URL = laurl;
        break;
    }
    const xmlResponse = Utils.createXMLFromObject(Utils.createPlayReadyInitiator(header, manifest, Buffer(customString).toString('base64')));
    const minimize = new Minimize({dom: {xmlMode: true, lowerCaseTags: false}, quotes: true});
    minimize.parse(xmlResponse, (error, data) => {
      res = Utils.setCacheHeader(res);
      res.set('Content-Type', 'application/vnd.ms-playready.initiator+xml');
      res.set('Access-Control-Allow-Origin', '*');
      res.send(data);
    });
  });
});


export default router;
