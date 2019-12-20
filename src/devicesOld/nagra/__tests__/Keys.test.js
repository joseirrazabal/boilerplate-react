import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import AbstractTvKey from '../../all/AbstractKeys';
import Keys from '../Keys';


describe('Key Press', () => {
    it('should return the correct key pressed', () =>{
         const onKeyDown = sinon.spy();
        const wrapper = shallow(<div onKeyDown={onKeyDown}/>);
        wrapper.simulate('keyDown', {keyCode: 458});
        expect(Keys.getPressKey(onKeyDown.args[0][0].keyCode)).toBe("GUIDE");
    })
});

describe('unknow Key Press', () => {
    it('should return the unknow key pressed', () =>{
         const onKeyDown = sinon.spy();
        const wrapper = shallow(<div onKeyDown={onKeyDown}/>);
        wrapper.simulate('keyDown', {keyCode: 200});
        expect(Keys.getPressKey(onKeyDown.args[0][0].keyCode)).toBe("UNKNOW_KEY");
    })
});
