import React, { Component }  from 'react';
import SocialAvatar from './SocialAvatar';
import Social from '../../utils/social/Social';
import SocialCardInfo from './SocialCardInfo';
import SocialCardButton from './SocialCardButton';

const SocialUserCard = (props) => {

	let gamesArray = Object.assign([], props.gamesArray);

	let isFollow = props.following ? 'card-following': 'card-follower';
	let action = props.following ?
		props.translations.get('social_profile_card_following', 'siguiendo') :
		props.translations.get('social_follow', 'seguir');


	return(<div className="social-card">
		<div className="social-card_div">
			<div className="social-card-image">
				<SocialAvatar
          userSocial={props.card}
          href={`/socialProfile/${props.card.id}`}
          focusUp={null}
        />
			</div>
			<div className="social-card-info">
				{gamesArray && <SocialCardInfo
					card={props.card}
					gamesArray={gamesArray}
					translations={props.translations}
				/>}
			</div>
		</div>
		<div className="social-card_div-button">
			<SocialCardButton
				action={action}
				className={isFollow}
				callToAction={props.callToAction}
				card={props.card}
			/>
		</div>
	</div>)
}

export default SocialUserCard;
