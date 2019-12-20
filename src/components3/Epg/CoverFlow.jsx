import React, { Component } from 'react';
import PropTypes              from 'prop-types';
import Button from "../Button/index";
import Device from "../../devices/device";
import LayersControl from "../../utils/LayersControl";
import Utils from '../../utils/Utils';

class CoverFlow extends Component {

  constructor(props) {
    super(props);
    
    this.state = {};

    this.increment        = this.increment.bind(this);
    this.decrement        = this.decrement.bind(this);
    this.directionHandler = this.directionHandler.bind(this);
    this.keyPressHandler  = this.keyPressHandler.bind(this);

    this.channels = props.channels;
    this.index = null;
    this.keys = Device.getDevice().getKeys();
  }

  setInitialData(channels, current) {
    if (channels instanceof Array && current.hasOwnProperty('channel')) {
      const item = channels.find((channel) => {
        return channel.group_id === current.channel.group_id;
      });
      this.channels = channels;
      this.index = this.channels.indexOf(item);
    }
  }

  getIndexes(currentIndex, length) {
    const prevIndex = (currentIndex - 1 < 0) ? length - 1 : currentIndex - 1;
    const nextIndex = (currentIndex + 1 < length) ? currentIndex + 1 : 0;
    return {prevIndex, currentIndex, nextIndex}
  }

  increment() {
    const next = this.index + 1;
    this.index = (next < this.channels.length) ? next : 0;
    this.setCardData();
  }

  decrement() {
    const prev = this.index - 1;
    this.index = (prev < 0) ? this.channels.length - 1 : prev;
    this.setCardData();
  }

  setCardData() {
    const {prevIndex, currentIndex, nextIndex} = this.getIndexes(this.index, this.channels.length);
    if (this.refs.currentCard) {
      this.refs.prevCard.style.backgroundImage = `url(${this.channels[prevIndex].cover})`;
      this.refs.currentCard.style.backgroundImage = `url(${this.channels[currentIndex].cover})`;
      this.refs.currentNumber.innerHTML = this.channels[currentIndex].id || '';
      this.refs.currentName.innerHTML = this.channels[currentIndex].title;
      this.refs.nextCard.style.backgroundImage = `url(${this.channels[nextIndex].cover})`;
    }
  }

  directionHandler(e) {
    const direction = e.detail ? e.detail.direction : e;
    if(typeof this.props.delayCoverFlow !== 'undefined') {
      this.props.delayCoverFlow();
    }

    switch (direction) {
      case 'up':
        this.decrement();
        break;
      case 'down':
        this.increment();
        break;
      default:;
    }
  }

  keyPressHandler(e) {
    
    if(LayersControl.isUXVisible())
      return;
    if (this.props.show ) {
      const currentKey = this.keys ? this.keys.getPressKey(e.keyCode) : null;
      console.log('Enter to Listening [CoverFlow] keyPressHandler, currentKey:',currentKey);
      switch (currentKey) {
        case 'CH_UP':
          e.preventDefault();
          e.stopPropagation();
          if(this.props.channelControls) {
            this.directionHandler('up');
          }
          break;
        case 'CH_DOWN':
          e.preventDefault();
          e.stopPropagation();
          if(this.props.channelControls) {
            this.directionHandler('down');
          }
          break;
        case 'BACK':
          e.preventDefault();
          e.stopPropagation();
          this.backKeyHandler();
          break;
        case 'YELLOW':
          e.preventDefault();
          e.stopPropagation();
          this.yellowKeyHandler();
          break;
        case 'BLUE':
          e.preventDefault();
          e.stopPropagation();
          this.enterKeyHandler();
          if(this.props.onPressBlueButton && this.props.specialLoading!==true) {
            this.props.onPressBlueButton();
          }
          break;
        case 'OK':
          e.preventDefault();
          e.stopPropagation();
          this.changeChannel();
          break;
        default:
          break;
      }
    }
  }

  changeChannel(){
    const channel=this.channels[this.index];
        this.props.onChangeChannel(channel);
  }

  yellowKeyHandler() {
    this.props.onPressYellowButton();
  }

  backKeyHandler() {
    this.props.onPressBackButton();
  }

  close() {
    this.setState({show: false});
  }

  enterKeyHandler() {
    this.props.onSelect(this.channels[this.index],true);
  }

  addListeners() {
    if (this.refs.currentCard) {
     this.refs.currentCard.addEventListener('sn:willmove', this.directionHandler);
    }
  }

  componentDidMount() {
    this.setInitialData(this.props.channels, this.props.current);
    document.addEventListener('keydown', this.keyPressHandler, true);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({show: nextProps.show});
    this.setInitialData(nextProps.channels, nextProps.current);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.addListeners();

      if (Utils.isModalHide()) {
        window.SpatialNavigation.focus('.epg-cover-flow .focusable');
      }

    }, 500);
  }

  /* TODO this must be used instead of previous componentDidUpdate*/
  onRefCoverflowSucceded (div) {
    this.addListeners();

    if (Utils.isModalHide()) {
      window.SpatialNavigation.focus('.epg-cover-flow .focusable');
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyPressHandler, true);
  }

  render() {
    if (!this.channels.length || !this.state.show) {
      return null;
    }
    let {prevIndex, currentIndex, nextIndex} = this.getIndexes(this.index, this.channels.length);
    const okIcon = <span className="epg-cover-flow-ok-icon">OK</span>;

    return (
      <div className='epg-cover-flow'>
{/*         <div className='epg-cover-flow-container'>
          <div ref="prevCard" className="epg-cover-flow-card epg-cover-flow-prev" style={{backgroundImage: `url(${this.channels[prevIndex].cover})`}}>
            <span className='fa fa-2x fa-angle-up'/>
          </div>
          <div ref="currentNumber" className='epg-cover-flow-current-number'>{this.channels[currentIndex].id}</div>
          <div ref="currentCard" className="epg-cover-flow-card epg-cover-flow-current focusable" style={{backgroundImage: `url(${this.channels[currentIndex].cover})`}}/>
          <div ref="currentName" className='epg-cover-flow-current-name'>{this.channels[currentIndex].title}</div>
          <div ref="nextCard" className="epg-cover-flow-card epg-cover-flow-next" style={{backgroundImage: `url(${this.channels[nextIndex].cover})`}}>
            <span className='fa fa-2x fa-angle-down'/>
          </div>
        </div> */}
        <div className='epg-cover-flow-indicators'>
          <Button colorCode="yellow" text="Volver" order={['color', 'text']} focusable={false}/>
          {this.props.specialLoading!==true && <Button colorCode="blue" text="Ir a Guía" order={['color', 'text']} focusable={false}/>}
          <Button text="Ir al canal" iconElement={okIcon} focusable={false}/>
        </div>
      </div>
    );
  }
}

CoverFlow.propTypes = {
  channels  : PropTypes.array,
  current   : PropTypes.object,
  show      : PropTypes.bool,
  onSelect  : PropTypes.func,
  onPressYellowButton : PropTypes.func,
  onPressBackButton : PropTypes.func,
  onPressBlueButton : PropTypes.func,
  onChangeChannel: PropTypes.func,
};

CoverFlow.defaultProps = {
  channels  : [],
  current   : {},
  show      : false,
  onSelect  : () => {},
  onPressYellowButton : () => {},
  onPressBackButton : () => {},
  onPressBlueButton : () => {},
  onChangeChannel: () => {},
};


export default CoverFlow;
