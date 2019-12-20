import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import VirtualSubtitles from '../VirtualSubtitles';

const vsProps = {
    currentTime: 100,
    subtitle: 'mock....................',
    className: 'test',
    isPaused: false,
}

sinon.spy(VirtualSubtitles.prototype, 'componentDidMount');

const wrapper = mount(
    <VirtualSubtitles {...vsProps} />
);

it('renders without crashing', () => {
    expect(wrapper);
});

it('should have subtitles', () => {
    const div = wrapper.find('.subtitles');
    expect(div.length == 1).toBe(true);
});

it('calls componentDidMount', () => {
    expect(VirtualSubtitles.prototype.componentDidMount.calledOnce).toBe(true);
});

it('should not be paused', () => {
    expect(wrapper.node.isPaused).toBe(false);
});

it('should have timeToChange', () => {
    expect(wrapper.node._timeToChange).toBeTruthy();
});

it('should have chunkSize', () => {
    expect(wrapper.node._chunkSize).toBeTruthy();
});

it('should have indexChunk', () => {
    expect(wrapper.node._indexChunk).toBeTruthy();
});

it('should have chunk', () => {
    expect(Array.isArray(wrapper.node._chunk)).toBe(true);
});
