import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from "react-redux";

import spaceIcon from './images/space.png';
import backSpaceIcon from './images/back-space.png';
import capitalLettersActive from './images/capital_letters_active.png';
import capitalLettersInactive from './images/capital_letters_inactive.png';
import Translator from './../../requests/apa/Translator';
import focusSettings from './../Focus/settings';
import KeyboardButton from './KeyboardButton';

import TvLatinLower from './layouts/tvLatinLower';
import TvLatinUpper from './layouts/tvLatinUpper';
import TvSymbolsLayout from './layouts/tvSymbols';
import AnalyticsDimensionSingleton from '../../components/Header/AnalyticsDimensionSingleton';
import DeviceStorage from '../../components/DeviceStorage/DeviceStorage';
import TvMailKeys from './layouts/tvMailKeys';
import Device from "../../devices/device";

// Styles
import './styles/Keyboard.css';

// Material Components
import Grid from "@material-ui/core/Grid";

class Keyboard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showSymbols: false,
      showUpper: false,
    };

    this.input = this.props && this.props.currentValue 
               ? this.props.currentValue : '';

    this.mailKeys = typeof TvMailKeys[DeviceStorage.getItem('region')] !== 'undefined' ? TvMailKeys[DeviceStorage.getItem('region')] : TvMailKeys['default'];
    this.keys = Device.getDevice().getKeys();
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }



  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
  }

  shouldComponentUpdate(nextProps, nextState) {
    this.input = nextProps.currentValue ? nextProps.currentValue : '';
    return (
      this.state.showSymbols !== nextState.showSymbols ||
      this.state.showUpper !== nextState.showUpper
    )
  }

  /**
   * Return the layout of keys
   *
   * @return {Array.Array.<string>} An array of keys for construct the keyboard
   */
  getKeysLayout() {
    let keysSet;
    if (this.state.showSymbols) {
      keysSet = TvSymbolsLayout.layoutSymbols;
    } else if (this.state.showUpper) {
      keysSet = typeof TvLatinUpper.layout[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinUpper.layout[DeviceStorage.getItem('region')] : TvLatinUpper.layout['default'];
    } else {
      keysSet = typeof TvLatinLower.layout[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinLower.layout[DeviceStorage.getItem('region')] : TvLatinLower.layout['default'];
    }
    return keysSet;
  }

  getKeysLayoutNumber() {
    let keysSet;
    if (this.state.showSymbols) {
      keysSet = typeof TvLatinLower.layoutNumber[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinLower.layoutNumber[DeviceStorage.getItem('region')] : TvLatinLower.layoutNumber['default'];
    } else {
      keysSet = typeof TvLatinLower.layoutNumber[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinLower.layoutNumber[DeviceStorage.getItem('region')] : TvLatinLower.layoutNumber['default'];
    }
    return keysSet;
  }

  getKeysLayoutHeader() {
    let keysSet;
    if (this.state.showSymbols) {
      keysSet = typeof TvLatinLower.layoutHeader[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinLower.layoutHeader[DeviceStorage.getItem('region')] : TvLatinLower.layoutHeader['default'];
    } else {
      keysSet = typeof TvLatinLower.layoutHeader[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinLower.layoutHeader[DeviceStorage.getItem('region')] : TvLatinLower.layoutHeader['default'];
    }
    return keysSet;
  }

  /**
   * Change the layout showing in the keyboard
   *
   * @param {null|string} type - The string can be lower|upper|symbols
   */
  handleLayoutClick(type) {
    let showSymbols = false;
    let showUpper = false;

    if (type === 'upper') {
      showUpper = true;
    } else if (type === 'symbols') {
      showSymbols = true;
    }

    this.setState({
      showSymbols,
      showUpper
    });
  };
  
  /**
   * @param {string} key
   */
  handleLetterButtonClick(key) {
    const nextValue = `${this.input}${key}`;

    if (this.props.onClick) {
      this.props.onClick(nextValue);
    }
  }

  handleBackspaceClick() {
    if(this.props.backspaceClick){
      this.props.backspaceClick();
      return;
    }
    if (!this.input) {
      return;
    }

    const value = this.input;
    const nextValue = value.substring(0, value.length - 1);

    if (this.props.onClick) {
      this.props.onClick(nextValue);
    }
  }

  handleSpaceButtonClick() {
    if (!this.input) {
      return;
    }

    const lastChar = this.input.slice(-1);
    let nextValue = this.input;

    if (lastChar !== ' ') {
      nextValue += ' ';
    }

    if (this.props.onClick) {
      this.props.onClick(nextValue);
    }
  }

  sendDimension(){
    const payload=new AnalyticsDimensionSingleton().getPayload();
    this.props.setMetricsEvent(payload);
    this.props.setMetricsEvent({ type: 'executor'});
  }

  sendMetric(){
    if(window.location.toString().indexOf('search')!==-1) {
      if (typeof this.props.setMetricsEvent === 'function' && typeof this.props.setMetricFlag === 'function' && typeof this.props.getMetricFlag === 'function') {
        const text = this.input;
        if (text !== '' && this.props.getMetricFlag() === false) {
          this.props.setMetricsEvent({
            hitType: 'event',
            eventCategory: 'busqueda',
            eventAction: 'palabra/frase buscada',
            eventLabel: text
          });
          this.props.setMetricsEvent({type: 'executor'});
          this.sendDimension();
          this.props.setMetricFlag(true);
        }
      }
    }
  }

  handleEmptyClick() {
    this.sendMetric();
    if (this.props.onClick) {
      this.props.onClick('');
    }
  }

  thereIsAnotherKeyboard() {
    let existModalKeyboard = document.getElementsByClassName("keyboard modal").length > 0;
    return existModalKeyboard && !this.props.modal ? true : false;
  }

  handleKeyPress(e){
    if(this.thereIsAnotherKeyboard()){
      return;
    }
    const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
    switch (currentKey){
      case 'ONE':
        this.handleLetterButtonClick('1');
        break;
      case  'TWO':
        this.handleLetterButtonClick('2');
        break;
      case 'THREE':
        this.handleLetterButtonClick('3');
        break;
      case 'FOUR':
        this.handleLetterButtonClick('4');
        break;
      case  'FIVE':
        this.handleLetterButtonClick('5');
        break;
      case 'SIX':
        this.handleLetterButtonClick('6');
        break;
      case 'SEVEN':
        this.handleLetterButtonClick('7');
        break;
      case  'EIGHT':
        this.handleLetterButtonClick('8');
        break;
      case 'NINE':
        this.handleLetterButtonClick('9');
        break;
      case 'ZERO':
        this.handleLetterButtonClick('0');
        break;
    }


  }

  render() {
    const keys = this.getKeysLayout();
    const keysNumber = this.getKeysLayoutNumber();
    const KeysHeader = this.getKeysLayoutHeader();
    //console.log('TRAEME LA CONSOLA >>>>>', this.props.activated);
    let forModal = this.props.modal ? "keyboard modal" : "keyboard notModal";
    return (
        <Grid container>
          {this.props.activated != '/search' ? 
          <Grid item xs={12} style={{ background: '#1C1D1E' }}>
            <div className={forModal} style={{maxWidth: 630}}>
              <div className="keyboard-header-horizontal">
                {KeysHeader.map((row, index) => (
                  <div className="keyboard-row" key={index}>
                    {row.map(button => (
                      <KeyboardButton
                        value={button}
                        className="keyboard-letter"
                        onClick={(key) => this.handleLetterButtonClick(key)}
                        key={button}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Grid>
          : null}
          <Grid container className={forModal}>
            <Grid item xs={8} style={{
              //borderRight: '3px solid rgba(29,29,32, 1)',
              margin: '0',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div className="form-col-left">
                {keys.map((row, index) => (
                  <div className="keyboard-row" key={index}>
                    {row.map(button => (
                      <KeyboardButton
                        value={button}
                        className="keyboard-letter"
                        onClick={(key) => this.handleLetterButtonClick(key)}
                        key={button}
                      />
                    ))}
                  </div>
                ))}
                <div className="keyboard-row keyboard-row-footer">
                  <KeyboardButton
                    value={!this.state.showSymbols ? TvSymbolsLayout.symbolsKeyValue : TvLatinLower.symbolsKeyValue}
                    className="keyboard-empty especial"
                    onClick={() => {!this.state.showSymbols ? this.handleLayoutClick('symbols') : this.handleLayoutClick() }}
                  />
                  <KeyboardButton
                    value={!this.state.showUpper ? <img alt="back-space-icon" className="keyboard-image-2" src={capitalLettersInactive} /> : <img alt="back-space-icon" className="keyboard-image-2" src={capitalLettersActive} />}
                    className="keyboard-empty btn-upper"
                    onClick={() => {!this.state.showUpper ? this.handleLayoutClick('upper') : this.handleLayoutClick()}}
                  />
                  <KeyboardButton
                    //value={(<img alt="space-icon" className="keyboard-image" src={spaceIcon} />)}
                    value="ESPAÇO"
                    className="keyboard-empty btn-espaco"
                    onClick={(key) => this.handleSpaceButtonClick()}
                    dataSnDown="none"
                  />
                  <KeyboardButton
                    value={(<img alt="back-space-icon" className="keyboard-image" src={backSpaceIcon} />)}
                    className="keyboard-empty borrar"
                    onClick={(key) => this.handleBackspaceClick()}
                    dataSnDown="none"
                  />
                  <KeyboardButton
                    value={Translator.get('empty', 'Vaciar')}
                    className="keyboard-empty upper"
                    onClick={(key) => this.handleEmptyClick()}
                    dataSnDown="none"
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={4} style={{ margin: '12px 0', borderLeft: '3px solid rgba(29,29,32, 1)', }}>
              <div className="form-col-right">
                {keysNumber.map((row, index) => (
                  <div className="keyboard-row number" key={index}>
                    {row.map(button => (
                      <KeyboardButton
                        value={button}
                        className="keyboard-letter"
                        onClick={(key) => this.handleLetterButtonClick(key)}
                        key={button}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Grid>
          </Grid>
        </Grid>
    );
  }
}

Keyboard.propTypes = {
  currentValue: PropTypes.string,
  onClick: PropTypes.func,
  backspaceClick: PropTypes.func,
  isFirstLetterUppercase: PropTypes.bool,
  modal: PropTypes.bool
};

Keyboard.defaultProps = {
  isFirstLetterUppercase: false,
  modal: false
};

const mapStateToProps = state => ({ activated: state.url.showUrlProps });

export default connect(
  mapStateToProps, null
)(Keyboard);
