import AbstractDataModel from './../devices/all/AbstractDataModel';

/*
* Cache of ribbons grids (ribbons per node)
*/
class RibbonsCache extends AbstractDataModel {
  constructor() {
    super();
  }
}

const ribbonsCache = new RibbonsCache();
Object.freeze(ribbonsCache);

export default ribbonsCache;
