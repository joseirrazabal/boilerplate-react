import './spinner.css';
import spinnerImg from './claro-spritesheet.png'
import React  from 'react';
import PropTypes from 'prop-types';

const Spinner = ({className}) => {
  const classM = className ? className : '';

  return (
    <div className={`spinner-container ${classM}`} >
      <div className="spinner" style={{background:`url('${spinnerImg}') left center`}}/>
    </div >
  )
};

Spinner.propTypes = {
  classM: PropTypes.string,
};

export default Spinner;
