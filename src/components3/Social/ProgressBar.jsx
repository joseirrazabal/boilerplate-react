import React, { Component }  from 'react';

const ProgressBar = (props) => {
	return(<div className="progressBar"> 
			<div className="progressBar_div" style={{width: `${props.percentage}%`}}></div>
		</div>)
}

export default ProgressBar;