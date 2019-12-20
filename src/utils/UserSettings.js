import Metadata from "../requests/apa/Metadata";
import DeviceStorage from "../components/DeviceStorage/DeviceStorage";

const DEFAULT_TABSUBSCRIPTIONVISIBILITY = JSON.stringify({
  "default": {
    "enable": false
  }
});

class UserSettings {
  static getTabSubscriptionVisibility() {

        const region = DeviceStorage.getItem('region');
        let tabSubscriptionVisibility = Metadata.get('tab_subscription_visibility', DEFAULT_TABSUBSCRIPTIONVISIBILITY);
        tabSubscriptionVisibility = JSON.parse(tabSubscriptionVisibility);
        return tabSubscriptionVisibility[region] || tabSubscriptionVisibility['default'];
      }
}
export default UserSettings;
