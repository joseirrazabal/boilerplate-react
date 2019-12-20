import Metadata from "../requests/apa/Metadata";
import DeviceStorage from "../components/DeviceStorage/DeviceStorage";


const DEFAULT_CONTENTCLASSIFICATION = JSON.stringify({
  "default":
  [
    {
      "option": "Puede contener escenas no aptas para todo público",
      "value": 20,
      "acronym": "PG",
      "active":false
    },
    {
      "option": "Apta para mayores de 13",
      "value": 30,
      "acronym": "PG-13",
      "active":false
    },
    {
      "option": "Puede contener escenas no aptas para adolescentes",
      "value": 40,
      "acronym": "R",
      "active":false
    },
    {
      "option": "Apta para mayores de 18",
        "value": 50,
      "acronym": "NC-17",
      "active":false
    }
   ]
});

class ParentalControl {
  static getContentClassification() {
    const region = DeviceStorage.getItem('region');
    let contentClassification = Metadata.get('content_classification', DEFAULT_CONTENTCLASSIFICATION);
    contentClassification = JSON.parse(contentClassification);
    return contentClassification[region] || contentClassification['default'];
  }
}


export default ParentalControl;
