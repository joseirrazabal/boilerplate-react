import React, {Component} from 'react';
import Device from "../../devices/device";

export default class KeyLogger extends Component {
  constructor() {
    super();

    this.container = null;
    this.visibleTimeoutId = null
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  clear = () => {
    clearTimeout(this.visibleTimeoutId);
    this.container.innerHTML = null;
  };

  log = msg => {
    console.log(`[KeyLogger] ${msg}`);
    this.clear();
    this.container.innerHTML = msg;
  };

  handleKeyPress = e => {
    console.log(`[KeyLogger]`, e);
    const key = e.key || e.char || e.code;
    const code = e.keyCode || e.which;
    const keys = Device.getDevice().getKeys();
    const mapped = keys.getPressKey(e.keyCode);
    const msg = ` mapped: ${mapped} code: ${code} key: ${key}`;
    console.log('Pasamos por el logger');
    this.log(msg);

    this.visibleTimeoutId = setTimeout(this.clear, 5000);
  };

  render() {
    return(
      <div
        id={"keyLogger"}
        style={{
          left: 0,
          bottom: 0,
          zIndex: 9999,
          color: '#fff',
          width: 'auto',
          height: 'auto',
          fontSize: 52,
          fontWeight: 500,
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0, 0.5)',
        }}
        ref={div => this.container = div}
      />
    )
  }
}
