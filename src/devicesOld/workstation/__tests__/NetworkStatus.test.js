import NetworkStatus from '../NetworkStatus';

describe('[Workstation] testing network status ', () => {
  test('networkstatus',  () => {
    let elementToString = Object.prototype.toString;
    NetworkStatus.isOnline().then((isonline) => {
        expect(elementToString.call(isonline)).toEqual('[object Boolean]');
      }
    );
  });
});
