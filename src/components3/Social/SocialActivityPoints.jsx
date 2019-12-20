import React from 'react'
import Points from './Points'

const SocialActivityPoints = (props) => {
	const color = '#60a9f4';

	return(<Points 
		points={`+${props.gamesArray.activityRule.points}`}
		color={color}
		unique={props.unique}
		isCurrentUser={props.isCurrentUser}
		translations={props.translations}
	/>)
}

export default SocialActivityPoints;