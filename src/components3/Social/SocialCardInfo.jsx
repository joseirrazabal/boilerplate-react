import './social.css'
import React from 'react'

const SocialProfile = (props) => {
	return(<div className="card-info">
			<div className="card-name">{ props.card.metadatas.name}</div>
			<div className="card-follow">{ props.card.followers} { props.translations.get('social_followers', 'Seguidores') }</div>
			<div>
				<span>
					{ props.translations.get('sc_level', 'Nivel')}: {props.gamesArray.level.number}
				</span>
				<span>
					{props.gamesArray.points}{props.translations.get('social_profile_points_postfix', 'pts')}
				</span>
			</div>
		</div>)
}

export default SocialProfile;