import React from 'react';
import { shallow, render, mount } from 'enzyme';
import  SocialInfo from './../SocialInfo';
import Translator from './../../../requests/apa/Translator';

const userSocial = { metadatas: 'name'}
const wrapper = shallow(<SocialInfo userSocial={ userSocial } translations={Translator}/>)

describe('<SocialInfo />', function () {
	test('should userSocial to be defined', () => {		
		expect(wrapper).toBeDefined;	
	});
	
	test('should have a <Settings /> Component', () => {
		expect(wrapper.find('Settings').length).toBe(1);	
	});
});
