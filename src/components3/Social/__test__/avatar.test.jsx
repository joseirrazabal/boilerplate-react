import React from 'react';
import { shallow, render, mount } from 'enzyme';
import  Avatar from './../Avatar';
import SocialAvatar from './../SocialAvatar';

describe('<Avatar/>', function () {
	it('should have an image to display the avatar', () => {
		const wrapper = shallow(<Avatar />);
		expect((wrapper.find('img').length)).toBe(1);
	});

	it('should have props and src', function () {
	    const wrapper = shallow(<Avatar/>);
	    expect(wrapper.props().src).toBeDefined;
	});
});

describe('<SocialAvatar/>', function () {
	it('should have an <Avatar /> Component', () => {
		const userSocial = { metadatas: 'name' }
		const wrapper = shallow(<SocialAvatar userSocial={ userSocial }/>);
		expect((wrapper.find('Avatar').length)).toBe(1);
	});
});	
