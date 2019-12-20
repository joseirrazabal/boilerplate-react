import './styles/KeyboardButton.css';
import React from 'react';
import PropTypes from 'prop-types';
import focusSettings from '../Focus/settings';

const KeyboardButton = props => {
  const handleClick = () => {
    props.onClick(props.value);
  }
  return (
    <a id={props.value}
      className={`kbd-btn ${props.isDisabled ? focusSettings.nonfocusable : focusSettings.className} ${props.className}`}
      onClick={props.isDisabled ? null : handleClick}
       href="javascript:void(0)"
       data-sn-down={props.dataSnDown}
    >
      {props.value}
    </a>
  );
}

KeyboardButton.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.node.isRequired]),
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  dataSnDown: PropTypes.string,
};

KeyboardButton.defaultProps = {
  className: '',
  isDisabled: false,
  dataSnDown: null,
};

export default KeyboardButton;
