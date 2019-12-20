import React, { Component }  from 'react';
import Asset from './../../requests/apa/Asset';

const Points = (props) => {
	const textPoints = (text) => {
		if(text) return text;
		else return null;
	}

	return(<div className="levels-points"> 
		{props.unique && props.unique.first === true && <div className="levels-points_img">
			<img 
				src={Asset.get('social_star')}
				width="100%"
			/>
		</div>}
		{props.unique && props.unique.first === true &&<div className="levels-points_points">
			<span>{ textPoints(props.textPoints) } </span>
			<span style={{marginLeft: '5px', fontWeight:'bolder', color: props.color}}>{ props.points }</span>
		</div>}
		{ props.unique && props.unique.first === false && props.isCurrentUser == true &&<div>
			{ props.translations.get('owm_social_duplicated_activity', 'Ya haz ganado puntos por esta acción') }
		</div>}
		{ props.unique && props.unique.first === false && props.isCurrentUser == false &&<div>
			{ props.translations.get('other_social_duplicated_activity', 'Ya ha ganado puntos por esta acción') }
		</div>}

		{!props.unique && <div className="levels-points_img">
			<img 
				src={Asset.get('social_star')}
				width="100%"
			/>
			</div>}
		{!props.unique && <div className="levels-points_points">
				<span>{ textPoints(props.textPoints) } </span>
				<span style={{marginLeft: '5px', fontWeight:'bolder', color: props.color}}>{ props.points }</span>
			</div>
		}
	</div>)
}

Points.defaultProps = {
	color: '#fdfdfd',
}

export default Points;