import './social.css';
import React  from 'react';

const SocialCardButton = (props) => {
	return (
	  <button
			className={`card_button ${props.className} focusable`}
			onClick={(evt) => props.callToAction(evt, props.card)}
		>
      <span className="card-button_following">{props.action}</span>
      <i className="fa fa-bookmark"></i>
	  </button>
  )
}

export default SocialCardButton;
