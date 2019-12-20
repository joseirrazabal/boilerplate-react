import AbstractDataModel from './../devices/all/AbstractDataModel';

/*
* Cache of live channels, para combine streams
*/
class ChannelBlockedUtil extends AbstractDataModel {
  constructor() {
    super();
  }
}
const channelBlockedUtil = new ChannelBlockedUtil();
export default channelBlockedUtil;