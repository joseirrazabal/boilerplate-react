import './ribbongrid.css';
import focusSetting from './../Focus/settings';
import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import Ribbon from './../Ribbon';

class RibbonGrid extends Component {
  constructor(props) {
    super(props);
    this.focusOutSelector = `#root ${focusSetting.selector}`;
    this.state = {
      ribbons: props.ribbons,
      index: 0,
      size: 2,
      totalRibbons: props.ribbons,
      rows: props.rows,
    };
    this.addScrollListenerToLoadMore = this.addScrollListenerToLoadMore.bind(this);
    this.getLocalRibbons = this.getLocalRibbons.bind(this);
  }
  getLocalRibbons(){
    let ribbons = this.state.ribbons;
    ribbons = ribbons.concat(this.state.totalRibbons.slice(this.state.index, this.state.index + this.state.size));
    this.setState({
      ribbons,
      index: this.state.index + this.state.size,
    });
  }
  componentDidMount() {
    setTimeout(function() { window.SpatialNavigation.focus('.ribbon-music .focusable'); }, 300);
    window.SpatialNavigation.makeFocusable();
  }
  addScrollListenerToLoadMore() {

    const divToScroll = document.getElementById('home-music');
    let eventToBind = 'scroll';
    divToScroll.addEventListener(eventToBind, () => {
      const executeLater = () => {
        this.scrollTimeout = null;
      };
      const getMore = divToScroll.scrollHeight - divToScroll.scrollTop <= divToScroll.clientHeight + 60 ;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = (setTimeout(executeLater, 30));
      if (getMore) {
        this.getLocalRibbons();
      }
    });
  }


  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state;
  }

  render() {
    return (
      <div className="ribbongrid-wrapper home-music" id="home-music">
          <div className="ribbongrid-container" id="ribbongrid-container">
            {
              this.state.ribbons.map((row, rowIndex) => {
                const aytems = row.elements;
                let titleRibbon = row.ribbontitles.medium;
                let typeRibbon = '';
                switch(row.type2)
                {
                  case 'Highlight':
                    typeRibbon = 'highlight';
                    break;
                  case 'square':
                    typeRibbon = 'square';
                    break;
                  case 'circle':
                    typeRibbon = 'circle';
                    break;
                  default:
                    typeRibbon = 'landscape';
                }

                return (
                  <div key={rowIndex} className="ribbongrid-row ribbon-music">
                    <Ribbon
                      id={ row.rowIndex }
                      type={ typeRibbon }
                      title={ titleRibbon }
                      items={ aytems }
                      focusable={ true }
                      focusHandler={ this.props.onFocusHandler }
                      visibleNumber={this.props.visibleNumber}
                      onClickHandler={this.props.onClickHandler}
                      setMetricsEvent={this.props.setMetricsEvent}
                      carruselTitle={titleRibbon}
                    />
                  </div>
                )
              })
            }
          </div>

      </div>
    );
  }
}
export default RibbonGrid;
