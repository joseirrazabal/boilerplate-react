import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';

export class EmptyContent extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  };

  static defaultProps = {
    title: '',
    message: '',
  };

  render() {
    const { title, message } = this.props;
    return (
      <div className="ribbon-root">
        <div className="ribbon-title">{title}</div>
        <div className="no-elements focusable">
          <span>{message}</span>
        </div>
      </div>
    )
  }
}

export default class MyRecordings extends PureComponent {
  static propTypes = {
    render: PropTypes.func.isRequired,
  };

  static defaultProps = {
    render: () => null
  };

  state = {
    limit: 0,
    used: 0,
  };

  componentDidUpdate(){
    window.SpatialNavigation.focus('.ribbon-items .focusable');
  }

  updateNpvrStorageUsed = ({limit, used}) => {
    this.setState({used, limit});
  };

  render() {
    const {used, limit} = this.state;
    const free = limit - used;
    const limitHours = Math.floor(limit / 60);
    const freeHours = Math.floor(free / 60);
    const freeMin = free % 60;
    const usedPerc = limit !== 0 ? (used / limit) * 100 : 0;
    return (
      <div id="myRecords" className="my-records-wrapper">
        <div className="time-recorded-wrapper">
          <div className="time-recorded-label">{
            `Disponible ${freeHours}hs. ${freeMin}mins. de un total de ${limitHours}hs.`
          }</div>
          <div className="time-recorded">
            <div className="time-recorded-used" style={{width: `${usedPerc}%`}}/>
          </div>
        </div>
        {this.props.render(this.updateNpvrStorageUsed)}
      </div>
    );
  }
}
