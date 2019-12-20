import Metadata from "./../requests/apa/Metadata";
import storage from '../components/DeviceStorage/DeviceStorage';

class FilterList {

  /*
  * Return object = {filterlist: 'filter_list_value'}
  */
  getFilter() {
    let filterlist = null;
    let metadata_filterlist = Metadata.get('byr_filterlist_configuration');

    if (metadata_filterlist != 'byr_filterlist_configuration') {
      metadata_filterlist = JSON.parse(metadata_filterlist);

      let region = storage.getItem('region');
      let filterlistID = metadata_filterlist[region];

      if (filterlistID == undefined) {
        filterlistID = metadata_filterlist["default"];
      }

      if (filterlistID && filterlistID.filterlist) {
        filterlist = {filterlist: filterlistID.filterlist};
      }
    }

    return filterlist;
  }
}

export default new FilterList();
