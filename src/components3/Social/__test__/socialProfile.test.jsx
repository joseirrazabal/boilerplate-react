import React from 'react';
import { shallow, render, mount } from 'enzyme';
import  SocialProfile from './../SocialProfile';
import Translator from './../../../requests/apa/Translator';

const userSocial = {

}


describe('<SocialProfile />', function () {
	test('should userSocial to be defined', () => {
		const wrapper = shallow(<SocialProfile  userSocial={userSocial}/>)
		expect((wrapper.props().userSocial)).toBeDefined;	
	});
	
	test('should have a socialAvatar Component', () => {
		const wrapper = shallow(<SocialProfile  userSocial={userSocial}/>)
		expect(wrapper.find('SocialAvatar').length).toBe(1);	
	});

	test('should have a SocialInfo Component', () => {
		const wrapper = shallow(<SocialProfile  userSocial={userSocial}/>)
		expect(wrapper.find('SocialInfo').length).toBe(1);	
	});
});
