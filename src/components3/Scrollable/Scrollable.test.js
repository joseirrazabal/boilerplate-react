import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Scrollable from './';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Scrollable />, div);
});

it('render with custom class name', () => {
  const wrapper = shallow(<Scrollable className="class-name-demo" />);
  expect(wrapper.find('.class-name-demo')).to.have.length(1);
});

it('render with custom height', () => {
  const wrapper = shallow(<Scrollable height="60%" />);
  expect(wrapper.find('[style]')).to.have.length(1);
  expect(wrapper.props().style.height).to.equal('60%');
});
