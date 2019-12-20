import React, { Component }  from 'react';

const SocialMessage = (props) => {
	return(<div>
		{props.message && <div
			data-id={props.message.mailId}
			className={`social-message ${props.colorMessage} focusable`}
			onClick={props.reading.bind(this)}
		> 
			<span className="social-message_msg"><p>{ props.message.message }</p></span>
		</div>}
	</div>)
}

SocialMessage.defaultProps = {
	message: {}
}

export default SocialMessage;