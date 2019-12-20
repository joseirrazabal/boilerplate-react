import AbstractDataModel from './../devices/all/AbstractDataModel';

/*
* Cache of ribbons grid cards (cards/items per ribbon)
*/
class RibbonsGridCache extends AbstractDataModel {
  constructor() {
    super();
  }
}

const ribbonsGridCache = new RibbonsGridCache();
Object.freeze(ribbonsGridCache);

export default ribbonsGridCache;
