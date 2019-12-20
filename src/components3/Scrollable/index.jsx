import './scrollable.css';
import React  from 'react';
import PropTypes from 'prop-types';
import utils from '../../utils/Utils';

function Scrollable(props) {
  return (
    <div style={{ height: props.height, width: props.width }}
         className={ utils.getToggleFunctionsFromMetadata().transition ? 
         `transition-active scroller-container  ${props.className}` : 
         `scroller-container  ${props.className}` 
    }>
      <div className="scroll-children">
        { props.children }
      </div>
    </div>
  )
}

Scrollable.propTypes = {
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string
};

Scrollable.defaultProps = {
  className: '',
  height: '100%',
  width: '100%'
};

export default Scrollable;
