import React, { Component } from 'react';
import './debugger.css';
import settings from './../../devices/all/settings';


// TODO agregar mapeo de teclas
// para scroll y reload

class Debugger extends Component
{
  constructor() {
    super();
    this.debuggerContainer =null;
    this.scrollElement = null;
    this.scrollTo = 0;

    this.__debuggerEnabled = settings.debugger_enabled;
    this.visualConsole = null;

    this.debugger_initialized = false;

    this.keySequence = '';
    // Number of seconds the user have to enter his key command
    this.__keySequenceInterval = 5;
    this.__lastTimeKeyPressed = null;

    this.state = {searchstring: '', visible: false};

    console.log('DEBUGGER CONSTRUCTOR');

    this.onKeyHandler = this.onKeyHandler.bind(this);

    /*   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
    document.addEventListener('keypress', this.onKeyHandler);
     */   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
  }

  componentDidMount() {
    console.log('DEBUGGER CONSTRUCTOR 2');
    if(this.__debuggerEnabled && this.debugger_initialized === false) {
      this.debugger_initialized = !this.debugger_initialized;
      this.visualConsole = document.getElementById('debuggerDiv');
      this.load();
    }

    this.setState({searchstring: this.props.searchstring, visible: this.props.visible});
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.visible != nextProps.visible)
      this.setState({visible: nextProps.visible});
  }


  load() {
    this.overrideConsoleLog();
    this.scrollable();
    this.clean();
    this.reload();
  }

  createDebuggerContainer() {
    if (this.visualConsole === null) {
      this.visualConsole = document.createElement('div');
      this.visualConsole.setAttribute('id', 'debuggerDiv');
      document.body.appendChild(this.visualConsole);
    }

    return this.visualConsole;
  }

  overrideConsoleLog() {
    let that = this;

    let visualConsole = null;
    if (typeof console !== "undefined") {
      if (typeof console.log !== 'undefined') {
        console.olog = console.log;
      } else {
        console.olog = function () { };
      }
    }

    console.log = console.debug = this.getConsole('log');
    console.warn = this.getConsole('warn');
    console.error = this.getConsole('error');
    console.info = this.getConsole('info');

      /*function (message) {
      console.olog(message);
      let message_to_show = '';

      if(typeof message === "string")
        message_to_show = message;
      if(has_string_to_search && message_to_show !== '')
      {
        if(message_to_show.indexOf(string_to_search) === -1)
          message_to_show = '';
      }

      if(message_to_show !== '') {
        var visualConsole = that.createDebuggerContainer();

        var tempC = document.createTextNode(message);
        var tempCC = document.createElement('div');
        tempCC.appendChild(tempC);
        visualConsole.insertBefore(tempCC, visualConsole.childNodes[0]);

        if(visualConsole.childNodes.length > 62) {
          visualConsole.removeChild(visualConsole.childNodes[visualConsole.childNodes.length-1]);
          visualConsole.removeChild(visualConsole.childNodes[visualConsole.childNodes.length-1]);
        }
      }
    };*/

    //console.error = console.debug = console.warn = console.info = console.log;
  }

  // console type = error, debug, warn, info, log
  getConsole(console_type)
  {
    let string_to_search = this.props.searchstring;
    let has_string_to_search = string_to_search ? true : false;

    let that = this;
    let message_type = '';
    switch(console_type)
    {
      case 'error':
        message_type = 'debugger-error';
        break;
      case 'info':
        message_type = 'debugger-info';
        break;
      case 'warn':
        message_type = 'debugger-warn';
        break;
      default:
        message_type = 'debugger-log'
        break;
    }

    return (message) => {
      console.olog(message);
      let message_to_show = '';

      if(typeof message === "string")
        message_to_show = message;
      if(has_string_to_search && message_to_show !== '')
      {
        if(message_to_show.indexOf(string_to_search) === -1)
          message_to_show = '';
      }

      if(message_to_show !== '') {
        let visualConsole = that.createDebuggerContainer();

        let tempC = document.createTextNode(message);
        let tempCC = document.createElement('div');
        tempCC.className = message_type;

        tempCC.appendChild(tempC);
        visualConsole.insertBefore(tempCC, visualConsole.childNodes[0]);

        if(visualConsole.childNodes.length > 62) {
          visualConsole.removeChild(visualConsole.childNodes[visualConsole.childNodes.length-1]);
          visualConsole.removeChild(visualConsole.childNodes[visualConsole.childNodes.length-1]);
        }
      }
    };
  }

  scrollable() {
    /*   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
    document.addEventListener("keypress", (e) => {
      let key = e.keyCode;

      if (this.scrollElement === null) {
        this.scrollElement = document.getElementById('debuggerDiv');
      }

      if (key === 17 || key === 403) {
        this.scrollTo += 50;

        if (this.scrollTo > this.scrollElement.offsetHeight) {
          this.scrollTo = this.scrollElement.offsetHeight;
        }

        this.scrollElement.scrollTop = this.scrollTo;
      }

      if (key === 18 || key === 406) {
        this.scrollTo -= 50;

        if (this.scrollTo < 0) {
          this.scrollTo = 0;
        }

        this.scrollElement.scrollTop = this.scrollTo;
      }
    });*/
    // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
  }

  clean() {
    if (this.scrollElement === null) {
      this.scrollElement = document.getElementById('debuggerDiv');
    }
    /*   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
    document.addEventListener("keypress", (e) => {
      let key = e.keyCode;

      if (key === 32 || key === 404) {
        this.scrollElement.innerHTML = '';
      }
    });*/   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
  }

  reload() {
/*   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
    document.addEventListener("keypress", (e) => {
      let key = e.keyCode;
      if (key === 9 || key === 405) {
        //location.reload();
      }
    }); */   // Por favor no usemos el addeventlister sobre el documento y platiquemos de la forma de hacerlo
  }

  onKeyHandler(evt) {
    console.log('KEYDOWN DEBUGGER');
    console.log(evt );
    // Current time, now
    let now_timestamp = (new Date()).getTime();
    console.log('__lastTimeKeyPressed: '  + this.__lastTimeKeyPressed);
    console.log('now_timestamp: '  + now_timestamp);
    console.log('now_timestamp-this.__lastTimeKeyPressed: '  + (now_timestamp - this.__lastTimeKeyPressed));
    console.log('this.__keySequenceInterval * 1000: '  + (this.__keySequenceInterval * 1000));
    console.log((now_timestamp - this.__lastTimeKeyPressed) > (this.__keySequenceInterval * 1000));
    // Key pressed must be in sequence..if not, reinit. Users have `this.__keySequenceInterval` seconds to enter their key command.
    if(!this.__lastTimeKeyPressed || ((now_timestamp - this.__lastTimeKeyPressed) > (this.__keySequenceInterval * 1000))) {
      this.__lastTimeKeyPressed = now_timestamp;
      this.keySequence = '';
    }

    //0 = 48
    //1 = 49
    //2 = 50
    //3 = 51
    const key = evt.keyCode;
    // TODO ajustar códigos de teclas cuando se tenga el mapeo...
    switch (key) {
      case 48: // cero
        this.keySequence = 'Cero' + this.keySequence;
        break;
      case 49: // uno
        this.keySequence = 'Uno' + this.keySequence;
        break;
      case 50: // dos
        this.keySequence = 'Dos' + this.keySequence;
        break;
      case 51: // tres
        this.keySequence = 'Tres' + this.keySequence;
        break;
      default:
        break;
    }

    console.log(this.keySequence);
    console.log(this.keySequence.substring(0, 'TresDosUnoCeroCero'.length));
    if (this.keySequence.substring(0, 'TresDosUnoCeroCero'.length) === "TresDosUnoCeroCero" && this.__debuggerEnabled) {
      // Show console
      this.toggleDebugger();
      this.keySequence = '';
    }
  }

  toggleDebugger() {
    if(this.__debuggerEnabled) {
      this.setState((prevState, props) => ({
        visible: !prevState.visible
      }));
    }
  }

  render() {
    return (
      <div id="debuggerDiv" style={{
        display: this.state.visible ? 'block' : 'none', position: 'absolute', zIndex: 999999
      }}>
      </div>
    )
  }

}

export default Debugger;
