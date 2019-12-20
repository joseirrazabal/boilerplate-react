import System from '../System';

describe('[Sony] testing exit handler ', () => {
  test('has function',  () => {
    const onExit = new System().exit;
    expect(onExit).toBeDefined();
  });
});
