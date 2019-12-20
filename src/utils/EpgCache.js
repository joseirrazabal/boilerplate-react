import AbstractDataModel from './../devices/all/AbstractDataModel';

/*
* Cache of ribbons grids (ribbons per node)
*/
class EpgCache extends AbstractDataModel {
  constructor() {
    super();
  }
}

const epgCache = new EpgCache();
//Object.freeze(epgCache);

export default epgCache;
