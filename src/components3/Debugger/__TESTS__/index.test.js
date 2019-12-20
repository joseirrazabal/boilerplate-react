import React from 'react';
import ReactDOM from 'react-dom';
import Debugger from './../../Debugger';

describe('[Debugger] testing network status ', () => {
  test('debugger',  () => {

    it('renders without crashing', () => {
      const div = document.createElement('div');
      ReactDOM.render(<Debugger />, div);
    });

  });
});
