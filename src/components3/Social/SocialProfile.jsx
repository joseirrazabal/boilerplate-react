import './social.css';
import React from 'react';
import SocialAvatar from './SocialAvatar';
import SocialInfo  from './SocialInfo';

const SocialProfile = (props) => {
	return(<div className="personal-info_div">
			<div className="social-avatar">
				<SocialAvatar userSocial={props.userSocial} large={props.large}/>
			</div>
			<div className="social-info">
				<SocialInfo
					user={props.user}
					userSocial={ props.userSocial }
          isCurrentUser={ props.isCurrentUser }
          ownFollowings={ props.ownFollowings }
          gamificationIdUserlogged={ props.gamificationIdUserlogged }
          incOwnFollowings={ props.incOwnFollowings }
          decOwnFollowings={ props.decOwnFollowings }
          nameFromisloggedin={props.nameFromisloggedin}
				/>
			</div>
		</div>)
}

export default SocialProfile;
