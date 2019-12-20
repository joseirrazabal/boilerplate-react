import React, { Component }  from 'react';
import ProgressBar from './ProgressBar';
import Points from './Points';
import PropTypes from 'prop-types';

const Levels = (props) => {
	const text_points = `${props.translations.get('social_profile_card_other_points', 'Puntos')} :`;

	return(<div className="levels-info">
		<div className="levels_div"> 
			<span style={{fontSize: '18px', fontWeight:'bolder'}}>
			{props.translations.get('sc_level', 'Puntos')} {props.gamesArray.level.number}
			</span> - { props.gamesArray.level.name }
		</div>
		<div className="levels_div">
			<ProgressBar percentage={props.percentage}/>
		</div>
		<div className="levels_div">
			<Points
				textPoints={text_points}
				points={props.gamesArray.points} 
			/>
		</div> 
	</div>)
}

Levels.propTypes = {
  	translations: PropTypes.object.isRequired,
  	gamesArray:PropTypes.object,
};

export default Levels;