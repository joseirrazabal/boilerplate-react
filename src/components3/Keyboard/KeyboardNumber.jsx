import './styles/Keyboard.css';
// TODO change images for apa assets
import spaceIcon from './images/space.png';
import backSpaceIcon from './images/back-space.png';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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
      keysSet = TvSymbolsLayout.layout;
    } else if (this.state.showUpper) {
      keysSet = typeof TvLatinUpper.layout[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinUpper.layout[DeviceStorage.getItem('region')] : TvLatinUpper.layout['default'];
    } else {
      keysSet = typeof TvLatinLower.layout[DeviceStorage.getItem('region')] !== 'undefined'? TvLatinLower.layout[DeviceStorage.getItem('region')] : TvLatinLower.layout['default'];
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
    let forModal = this.props.modal ? "keyboard modal" : "keyboard notModal";
    return (
      <div className={forModal}>
        <div className="form-col-left">
          <div className="keyboard-row keyboard-row-header"  >
            <KeyboardButton
              value={TvLatinUpper.symbolsKeyValue}
              className="keyboard-layouts-first"
              onClick={() => this.handleLayoutClick('upper')}
            />
            <KeyboardButton
              value={TvLatinLower.symbolsKeyValue}
              className="keyboard-layouts"
              onClick={() => this.handleLayoutClick()}
            />
            <KeyboardButton
              value={TvSymbolsLayout.symbolsKeyValue}
              className="keyboard-layouts-last"
              onClick={() => this.handleLayoutClick('symbols')}
            />
          </div>
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
          <div className="keyboard-row keyboard-row-domains">
            {
              this.mailKeys.map(button => (
                <KeyboardButton
                  value={button}
                  className="keyboard-domains"
                  onClick={(key) => this.handleLetterButtonClick(key)}
                  key={button}
                />
              ))
            }
          </div>
          <div className="keyboard-row keyboard-row-footer">
          <KeyboardButton
            value={(<img alt="space-icon" className="keyboard-image" src={spaceIcon} />)}
            className="keyboard-empty"
            onClick={(key) => this.handleSpaceButtonClick()}
            dataSnDown="none"
          />
          <KeyboardButton
            value={(<img alt="back-space-icon" className="keyboard-image" src={backSpaceIcon} />)}
            className="keyboard-empty"
            onClick={(key) => this.handleBackspaceClick()}
            dataSnDown="none"
          />
          <KeyboardButton
            value={Translator.get('empty', 'Vaciar')}
            className="keyboard-empty"
            onClick={(key) => this.handleEmptyClick()}
            dataSnDown="none"
          />
        </div>
        </div>
        <div className="form-col-right">
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
        </div>
      </div>
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

export default Keyboard;
