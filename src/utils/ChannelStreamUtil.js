import AbstractDataModel from './../devices/all/AbstractDataModel';

/*
* Cache of live channels, para combine streams
*/
class ChannelStreamUtil extends AbstractDataModel {
  constructor() {
    super();
  }
}
const channelStreamUtil = new ChannelStreamUtil();
export default channelStreamUtil;