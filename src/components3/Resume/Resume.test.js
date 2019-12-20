import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Resume from './';

it('renders without crashing with all properties', () => {
  const wrapper = shallow(<Resume title="Title demo" schedule="Schedule demo" year={2000} category="Category demo" description="lorem ipsum dolor sit amet" />);
  const title = <div className="resume-title">Title demo</div>;
  const schedule = <span className="resume-meta">Schedule demo</span>;
  const year = <span className="resume-meta">{ 2000 }</span>;
  const category = <span className="resume-meta">Category demo</span>;
  const description = <div className="resume-description">lorem ipsum dolor sit amet</div>;

  expect(wrapper.contains(title)).to.equal(true);
  expect(wrapper.contains(schedule)).to.equal(true);
  expect(wrapper.contains(year)).to.equal(true);
  expect(wrapper.contains(category)).to.equal(true);
  expect(wrapper.contains(description)).to.equal(true);
});
