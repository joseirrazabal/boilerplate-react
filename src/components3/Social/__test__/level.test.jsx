import React from 'react';
import { shallow, render, mount } from 'enzyme';
import  Levels from './../Levels';
import Translator from './../../../requests/apa/Translator';

describe('<Levels />', function () {
	it('should have an gamesArray props Object', () => {
		const wrapper = shallow(<Levels 
			translations={Translator}
			gamesArray={ { level: { name: 'Nivel 1' } } }
		/>);

		expect(typeof(wrapper.props('gamesArray'))).toBe('object');

	});


	it('should have an Translations props Object', () => {
		const wrapper = shallow(<Levels 
			translations={Translator}
			gamesArray={ { level: { name: 'Nivel 1' } } }
		/>);

		expect(typeof(wrapper.props('translations'))).toBe('object');

	});

	it('should have an <ProgressBar /> Component', () => {
		const wrapper = shallow(<Levels 
			translations={Translator}
			gamesArray={ { level: { name: 'Nivel 1' } } }
		/>);

		expect((wrapper.find('ProgressBar').length)).toBe(1);
	});

	it('should have an <ProgressBar /> Component', () => {
		const wrapper = shallow(<Levels 
			translations={Translator}
			gamesArray={ { level: { name: 'Nivel 1' } } }
		/>);

		expect((wrapper.find('Points').length)).toBe(1);
	});

});

