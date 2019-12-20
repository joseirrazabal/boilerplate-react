import React, {Component} from 'react';
import PropTypes from 'prop-types';
import m from 'moment';
import Scrollable from '../../components/Scrollable';
import Ribbon from '../Ribbon/index';
import MyRecordings from "./MyRecordings";
import ChannelSingleton from "../Epg/ChannelsSingleton";

class MyContentSeries extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  componentDidUpdate() {
    window.SpatialNavigation.makeFocusable();
    window.SpatialNavigation.focus();
  }

  getSeries() {
    const {timeUsed, series} = this.props;
    return series.map(record => {
      const {channel, pack_id: packId, actions, status, date} = record;
      const {event} = channel;
      const title = event.name;
      const group_id = event.group_id;
      const limit = ChannelSingleton.getNpvrStorage(channel.group_id); // minutes
      const used = typeof timeUsed[packId] === 'number' ? timeUsed[packId] : 0; // minutes
      const dateOfRecord = m(date, 'YYYY-MM-DDThh:mm:ssZ').format('dddd DD/MM/YYYY [a las] hh:mm[hs.]');
      return {
        group_id: group_id,
        cover: channel.image.replace('https://', 'http://'),
        title,
        description: event.description,
        node: 'myRecords',
        record_id: record.record_id,
        status,
        actions: actions,
        used,
        limit,
        isRecord: true,
        dateOfRecord,
        clickHandler: (e) => {
          this.props.handleRecordingPlay(group_id, title, actions);
        }
      };
    });
  }

  render() {
    return (
      <Scrollable height={260}>
        <MyRecordings
        render={callback => (
          <Ribbon
            id={'recordings'}
            title={this.props.title}
            items={this.getSeries()}
            focusHandler={cardData => {
              cardData.showActionBtns=false;
              cardData.playButton=false;
              cardData.langButton=false;
              cardData.favouriteButton=false;
              cardData.purchaseButtonInfo=null;
              this.props.setResumeData(cardData);
              callback(cardData);
            }}
            setMetricsEvent={this.props.setMetricsEvent}
            user={this.props.user}
          />
        )}
      />
      </Scrollable>
    )
  }
}

MyContentSeries.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(PropTypes.object).isRequired,
  timeUsed: PropTypes.object.isRequired,
  setResumeData: PropTypes.func.isRequired,
  setMetricsEvent: PropTypes.func.isRequired,
  handleRecordingPlay: PropTypes.func.isRequired,
};

MyContentSeries.defaultProps = {
  title: 'Series',
  series: [],
  timeUsed: { 0: 0 },
  setResumeData: () => null,
  setMetricsEvent: () => null,
  handleRecordingPlay: () => null,
};

export default MyContentSeries
