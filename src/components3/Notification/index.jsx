import './styles.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Assets from './../../requests/apa/Asset';
import { hideNotification } from './../../actions/notification';
import ApaMetadata from './../../requests/apa/Metadata';

class Notification extends Component {
  constructor(props) {
    super(props);
  }

  setTimeShowing = () => {

    switch (this.props.type){
      case 'notification':
        this.timeShowing = ApaMetadata.get('notification_viewing_time', 30000);
        break;
      case 'message':
        this.timeShowing = ApaMetadata.get('message_viewing_time', 3000);
        break;
      default:
        this.timeShowing = ApaMetadata.get('notification_viewing_time', 30000);
    }
  }

  componentDidUpdate(prevProps) {
    this.setTimeShowing();
    if(!prevProps.show)this.closeNotification()
  }

  closeNotification = () => {
    const that = this;
    this.refTimeout = setTimeout(() => {
      /*if (that.refTimeout) {
        clearTimeout(this.refTimeout);
      }*/
      this.props.hideNotification({
        show: false,
        title: '',
        msg: ''
      })
    }, this.timeShowing);
  }

  makeIcon = () => {
    let icon = null;

    if (this.props.faClass) {
      icon = <i className={`fa ${this.props.faClass}`} />
    } else if (this.props.apaAsset) {
      icon = <img src={Assets.get(this.props.apaAsset)} alt="icon"/>;
    }

    return icon;
  }

  render() {
    return (
      <div className={`app-notification ${this.props.show || 'hide'}`}>
        <div className="app-notification-wrapper">
          <div className="app-notification-icon">
            {this.makeIcon()}
          </div>
          <div className="app-notification-body">
            <div className="app-notification-title">{this.props.title}</div>
            <div className="app-notification-message">{this.props.msg}</div>
          </div>
        </div>
      </div>
    )
  }
}

Notification.propTypes = {
  title: PropTypes.string,
  msg: PropTypes.string,
  show: PropTypes.bool,
  faClass: PropTypes.string,
  apaAsset: PropTypes.string,
};

Notification.defaultProps = {
  title: '',
  msg: '',
  show: false,
  faClass: null,
  apaAsset: null,
};

const mapStateToProps = state => ({ ...state.notification.notificationProps });
const mapDispatchToProps = (dispatch) => bindActionCreators({
  hideNotification
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
