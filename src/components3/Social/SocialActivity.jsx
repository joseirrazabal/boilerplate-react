import React, { Component }  from 'react';
import SocialActivityImageManager  from './SocialActivityImageManager';
import SocialActivityText  from './SocialActivityText';
import SocialActivityPoints  from './SocialActivityPoints';
import Social from '../../utils/social/Social';

const SocialActivity = (props) => {
	const gamesArray = Social.filterGamesArray(props.gameId, props.activity.games);

	let hideActivity = false;
	let activity = null;
	if(props.activity && props.activity.entity) {
			switch (props.activity.entity.type) {
				case 'allserie':
					hideActivity = true;
					break;
				case 'allseason':
					hideActivity = true;
					break;
				default:
					hideActivity = false;
			}
	}

	if(!hideActivity) {
			activity = (<div className="social-activity">
				<div className="social-activity_image-manager">
					<div className="image-manager">
						<SocialActivityImageManager
		          id={props.id}
		          className={props.className}
							activity={props.activity}
							index={props.key}
		          focusUp={props.focusUp}
						/>
					</div>
				</div>
				<div className="social-activity_text">
					<SocialActivityText
						activity={props.activity}
						translations={props.translations}
						isCurrentUser={props.isCurrentUser}
					/>
				</div>
				<div className="social-activity_points">
					{gamesArray &&<SocialActivityPoints
						gamesArray={gamesArray}
						translations={props.translations}
						unique={props.activity.unique}
						isCurrentUser={props.isCurrentUser}
					/>}
				</div>
			</div>);
	}

	return activity;
}

export default SocialActivity;
