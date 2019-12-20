import './old-button.css';
import React from 'react';
import focusSettings from '../Focus/settings';

const defaultOrder = ['icon', 'text', 'color'];
const ButtonOld = ({ leftText, text, rightText, className, iconClassName, colorCode, style, onClick, onFocus, iconElement, order, focusable, focusDown}) => {
  const orderElements = order ? order : defaultOrder;
  const children = [];
  if (iconElement) {
    children["icon"] = iconElement
  } else {
    children["icon"] = iconClassName ? <i className={iconClassName}></i> : null;
  }
  children["color"] = colorCode ?
    <span className={`color-ball ${colorCode}`}></span>
  : null;
  className = className ? className : "";
  children["text"] = text;
  children["left-text"] = leftText;
  children["right-text"] = rightText;
  focusable = (typeof focusable === 'undefined') ? true : focusable;
  return (
    <a
      style={style}
      className={`${(focusable) ? focusSettings.className : ''} action ${className}`}
      onClick={onClick}
      onFocus={onFocus}
      data-sn-down={focusDown ? focusDown : undefined}
      href="javascript:void(0)">
      {orderElements.map((item, index) => <span className={item + '-button'} key={index}>{children[item]}</span>)}
    </a>
  );
};

export default ButtonOld;
