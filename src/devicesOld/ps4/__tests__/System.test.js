import System from '../System';

describe('[PS4] testing exit handler ', () => {
  test('has function',  () => {
    const onExit = new System().exit;
    expect(onExit).toBeDefined();
  });
});
