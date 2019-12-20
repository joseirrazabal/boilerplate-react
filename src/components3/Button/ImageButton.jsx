import './button.css';
import React from 'react';
import focusSettings from '../Focus/settings';

const ImageButton = ({ className, style, onClick, onFocus, focusable, onBlur, focusDown, imgSrc, imgId, imgClassName }) => {
  
  className = className ? className : "";
  
  focusable = (typeof focusable === 'undefined') ? true : focusable;
  return (
    <a
      style={style}
      className={`${(focusable) ? focusSettings.className : ''} action ${className}`}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={e => onBlur(e, imgId)}
      data-sn-down={focusDown ? focusDown : undefined}
      href={`javascript:void(0)`}>
      <img alt={imgId} id={imgId} src={imgSrc} className={imgClassName} />
    </a>
  );
};

export default ImageButton;
