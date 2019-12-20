import React, { Component }  from 'react';
import Avatar from './Avatar';
import PropTypes from 'prop-types';
import Assets from '../../requests/apa/Asset'

const SocialAvatar = props => {

	//Esta va en una funcion de utils
	const placeholder = props.large ? Assets.get('social_placeholder_menu') : Assets.get('social_placeholder_header');
	let socialImage = null;
	let facebookId = null;
	if(props.userSocial && props.userSocial.metadatas) {
		socialImage = `https://graph.facebook.com/${props.userSocial.metadatas.facebookId}/picture?type=large`;
		facebookId = props.userSocial.metadatas.facebookId || props.userSocial.metadatas.facebookID;
	}

	const validateImage = facebookId ? socialImage : placeholder;

	return (
		<Avatar
			icons={props.icons}
			avatarImage={validateImage}
			handlerFunction={props.handlerFunction}
			href={props.href}
			focusUp={props.focusUp}
		/>
	)
}

export default SocialAvatar;
