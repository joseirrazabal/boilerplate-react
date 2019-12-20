import AbstractRequestTask from '../../requests/AbstractRequestTask';

class ManifestTask extends AbstractRequestTask {

  constructor(url, params = {}, config = {}) {
    super();
    this.url = url;
    this.config = config;
    this.params = params;
  }

  getUrl() {
    return this.url;
  }
}

export default ManifestTask;
