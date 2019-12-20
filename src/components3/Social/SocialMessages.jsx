import React   from 'react';
import SocialMessage from '../../components/Social/SocialMessage';
import PropTypes from 'prop-types';
import DeviceStorage from '../DeviceStorage/DeviceStorage';
import Translator from "../../requests/apa/Translator";

const SocialMessages = (props) => {
	let messages;

	const filterByIdMethod = (data, id) => {
		const filterById = data.filter((it) => it == id )[0];
		return filterById;
	}

	const reading = (e) => {
		e.preventDefault();
		const container = DeviceStorage.getItem('nagra_messages') || '[]';
		let messagesContainer = JSON.parse(container);
		const filterById = filterByIdMethod(messagesContainer, e.currentTarget.dataset['id']);

		if(!filterById) {
			messagesContainer.push(e.currentTarget.dataset['id']);
			DeviceStorage.setItem('nagra_messages', JSON.stringify(messagesContainer));
		}

	}

	const DeviceStorage_messages = JSON.parse(DeviceStorage.getItem('nagra_messages'));

	if(props.messages.length === 0) {
	  return (
      <div className="social-messages-empty" style={{ fontSize: 18 }}>
        { Translator.get('social_empty_history') }
      </div>
    )
  }

	messages = props.messages.map((it, i) => {
		//Pintar mensajes no leidos
		const read = filterByIdMethod(DeviceStorage_messages, it.mailId);
		const readMessage = !read ? 'color-message': '';

		return (<SocialMessage
			key={i}
			message={it}
			colorMessage={ readMessage }
			reading={reading}
		/>)
	})

	return(<div className="social-messages">
		{messages}
	</div>)
}

SocialMessages.propTypes = {
  messages: PropTypes.array.isRequired,
};


export default SocialMessages;
