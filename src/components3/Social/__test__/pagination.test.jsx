import React from 'react';
import { shallow, render, mount } from 'enzyme';
import  Pagination from './../Pagination';
import social_utils from './../../../utils/social/Social';
import Translator from './../../../requests/apa/Translator';


describe('<Pagination />', function () {
	it('should return string con max(+20) and min(+20)', function () {
		
		const min = 0;
		const max= 20;
		const num = 20;
		const expected = '20-40';

	    expect(social_utils.next(min, max, num)).toEqual(expected);
	});

	it('should return string con max(-20) and min(-20)', function () {
		const min = 20;
		const max= 40;
		const num = 20;

		const expected = '0-20';
	    expect(social_utils.previous(min, max, num)).toEqual(expected);
	});
});
