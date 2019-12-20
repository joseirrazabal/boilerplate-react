import './badge.css'
import React from 'react'
import PropTypes from 'prop-types'

const Badge = (props) => {
  return (
    <div className={`badge badge-${props.type}`} style={props.style}>
      {
        (props.type === 'text')
          ? props.label
          : <img src={props.src} alt="badge" />
      }
    </div>
  )
};

Badge.propTypes = {
  type: PropTypes.oneOf(['text', 'image']).isRequired,
  label: PropTypes.string,
  src: PropTypes.string,
  style: PropTypes.object
};

Badge.defaultProps = {
  label: '',
  src: null,
  style: {}
};

export default Badge;
