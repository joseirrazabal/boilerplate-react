import DeviceStorage from './../../../components/DeviceStorage/DeviceStorage';
import AbstractStorage from './../../../components/DeviceStorage/AbstractStorage';


describe('[Device Storage]', () => {
    test('Store values correctly set/get', () => {

        let keyStorage = 'testStorage';
        let actual = 'testok';
        let expected = 'testok';

        DeviceStorage.setItem(keyStorage, actual);
        actual = DeviceStorage.getItem(keyStorage);
        
        expect(actual).toBe(expected);

    });
    test('unset store values', () => {

        let keyStorage = 'testStorage';
        let actual;
        let expected = undefined;

        DeviceStorage.unsetItem(keyStorage);
        actual = DeviceStorage.getItem(keyStorage);

        expect(actual).toBe(expected);

    });

    test('clerar stored values', () => {

        
        let actual;
        let expected = undefined;
        let total = 2;
       

        for (var i = 0; i < total; i++) {
            DeviceStorage.setItem('test' + i, i);
        }       

        DeviceStorage.clear();   

        for (var i = 0; i < total; i++) {
            var res = DeviceStorage.getItem('test' + i);

            if (res!=undefined) {
                actual += res;
            }
        } 

        expect(actual).toBe(expected);

    });
});