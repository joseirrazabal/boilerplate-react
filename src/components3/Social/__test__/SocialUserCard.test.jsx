import React from 'react';
import { shallow, render, mount } from 'enzyme';
import SocialUserCard from './../SocialUserCard';
import Translator from './../../../requests/apa/Translator';

const card = {
	gamesArray: [{
		level: {
			number: 10, 
			name: 'protagonista',
		},
		id: '585997d2c39004e67987c60d',
	}]
}

const wrapper = shallow(<SocialUserCard 
	card={card} 
	gameId='585997d2c39004e67987c60d'
	translations={Translator}
/>);


describe('<SocialUserCard/>', function () {
	it('should be defined the Component', () => {	
		expect(wrapper).toBeDefined;	
	});

	it('should have an <SocialAvatar /> Component', () => {
		expect(wrapper.find('SocialAvatar').length).toBe(1);
	});

});

