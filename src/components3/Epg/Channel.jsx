import React from 'react'
import PropTypes from 'prop-types'

const Channel = (props) => {
  const image = (typeof props.image === 'undefined' || !props.image.length)
    ? '/images/epg_thumb_default.png'
    : props.image;
  
  return (
    <div id={`epg-channel-item-${props.id}`} className='epg-channel-item-image-container'>
      <div className='epg-channel-item-id'>
        <span>{props.id}</span>
      </div>
      <div className='epg-channel-item-image'>
        <img src={image} alt="channel cover"/>
      </div>
    </div>
  );
};

Channel.propTypes = {
  id: PropTypes.string,
  image: PropTypes.string.isRequired
};

Channel.defaultProps = {
  id: ''
};

export default Channel;
