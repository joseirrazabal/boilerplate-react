import React from 'react';

const isFunction = callback => typeof callback === 'function';

const Event = (props) => {
  const {duration_text, finished, active, styles, data, listeners, attributes} = props;
  const classNames = ['epg-event','focusable'];
  (active)    ? classNames.push('epg-event-active')   : null;
  (finished)  ? classNames.push('epg-event-finished') : null;console.error(attributes);
  return (
    <div className={classNames.join(' ')} {...attributes} style={Object.assign({},styles)} ref={(element) => {
      listeners.map((item) => {
        if (isFunction(item.callback) && element) {
          element.addEventListener(item.action, item.callback);
        }
      });
      /*attributes.map((item) => {
        if(element) {
          element.setAttribute(item.name, item.value);
        }
      });*/
    }}>
      <div className='epg-event-item-label'>
        <div className='epg-event-item-title'>
          <span title={data.name}>{data.name}</span>
        </div>
        <div className='epg-event-item-info'>
          <span title={duration_text}>{duration_text}</span>
        </div>
      </div>
    </div>
  );
};

export default Event;
