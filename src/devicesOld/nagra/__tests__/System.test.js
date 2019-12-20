import System from '../System';

describe('[Nagra] testing exit handler ', () => {
  test('has function',  () => {
    const onExit = new System().exit;
    expect(onExit).toBeDefined();
  });
});
