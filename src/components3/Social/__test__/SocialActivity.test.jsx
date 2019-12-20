import React from 'react';
import { shallow, render, mount } from 'enzyme';
import SocialActivity from './../SocialActivity';
import SocialActivityImage from './../SocialActivityImage';
import SocialActivityText from './../SocialActivityText';
import Social from '../../../utils/social/Social';

const wrapper = shallow(<SocialActivity activity={ { games: '4566565456'} }/>);
const wrapperImg = shallow(<SocialActivityImage entity={ { metadatas: 'name'} }/>);

describe('<Avatar/>', function () {
	it('should be defined the component', () => {
		expect(wrapper).toBeDefined;
	});

	it('should have a SocialActivityImageManager Component', function () {
	    expect(wrapper.find('SocialActivityImageManager').length).toBe(1);
	});

	it('should have a SocialActivityText Component', function () {
	    expect(wrapper.find('SocialActivityText').length).toBe(1);
	});

	it('should have a SocialActivityPoints Component', function () {
	    expect(wrapper.find('SocialActivityPoints').length).toBe(1);
	});

});

describe('<SocialActivityImage />', function () {
	it('should be defined component', () => {
		expect(wrapperImg).toBeDefined;
	});

	it('should have an image to display', () => {
		expect((wrapperImg.find('img').length)).toBe(1);
	});

	it('should have an href to redirect', () => {
		expect((wrapperImg.props().href)).toBeDefined;
	});
});	
	