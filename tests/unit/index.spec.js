import SickoStorage from '@sicko-storage/index';
import BaseStorage from '@sicko-storage/storage/base-storage';
import DefaultableStorage from '@sicko-storage/storage/defaultable-storage';
import NamespaceableStorage from '@sicko-storage/storage/namespaceable-storage';
import SerializableStorage from '@sicko-storage/storage/serializable-storage';
import ExpirableStorage from '@sicko-storage/storage/expirable-storage';

jest.mock('@sicko-storage/storage/base-storage');
jest.mock('@sicko-storage/storage/defaultable-storage');
jest.mock('@sicko-storage/storage/namespaceable-storage');
jest.mock('@sicko-storage/storage/serializable-storage');
jest.mock('@sicko-storage/storage/expirable-storage');

describe('SickoStorage', () => {
  describe('.storages', () => {
    it('only contains one element', () => {
      expect(SickoStorage.prototype.storages.length).toEqual(1);
    });

    it('contains only the BaseStorage', () => {
      expect(SickoStorage.prototype.storages[0]).toEqual(BaseStorage);
    });
  });

  describe('.use', () => {
    it('pushes elements to the storages array', () => {
      SickoStorage.use(DefaultableStorage);

      expect(SickoStorage.prototype.storages.length).toEqual(2);
      expect(SickoStorage.prototype.storages[0]).toEqual(BaseStorage);
      expect(SickoStorage.prototype.storages[1]).toEqual(DefaultableStorage);
    });

    it('does not push if already present', () => {
      SickoStorage.use(DefaultableStorage);
      SickoStorage.use(DefaultableStorage);

      expect(SickoStorage.prototype.storages.length).toEqual(2);
      expect(SickoStorage.prototype.storages[0]).toEqual(BaseStorage);
      expect(SickoStorage.prototype.storages[1]).toEqual(DefaultableStorage);
    });

    it('keeps the storages array sorted by storage position', () => {
      SickoStorage.use(ExpirableStorage);
      SickoStorage.use(DefaultableStorage);

      expect(SickoStorage.prototype.storages.length).toEqual(3);
      expect(SickoStorage.prototype.storages[0]).toEqual(BaseStorage);
      expect(SickoStorage.prototype.storages[1]).toEqual(DefaultableStorage);
      expect(SickoStorage.prototype.storages[2]).toEqual(ExpirableStorage);
    });
  });

  describe('.build', () => {
    let underlyingStorage;

    beforeEach(() => {
      SickoStorage.prototype.storages = [BaseStorage]

      underlyingStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };

      window.localStorage = underlyingStorage;

      BaseStorage.build.mockReturnValue({ underlyingStorage, type: 'BaseStorage' });
      ExpirableStorage.build.mockReturnValue({ underlyingStorage, type: 'ExpirableStorage' });
      DefaultableStorage.build.mockReturnValue({ underlyingStorage, type: 'DefaultableStorage' });
      NamespaceableStorage.build.mockReturnValue({ underlyingStorage, type: 'NamespaceableStorage' });
      SerializableStorage.build.mockReturnValue({ underlyingStorage, type: 'SerializableStorage' });
    });

    describe('when using all the storages', () => {
      it('chains the storages altogether', () => {
        SickoStorage.use(ExpirableStorage);
        SickoStorage.use(DefaultableStorage);
        SickoStorage.use(NamespaceableStorage);
        SickoStorage.use(SerializableStorage);

        const options = {
          storage: window.localStorage,
          defaultValue: 123,
          ttl: 5000,
          namespace: 'test',
        }

        const storage = SickoStorage.build(options);

        expect(BaseStorage.build).toHaveBeenCalledWith(null, options);
        expect(DefaultableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'ExpirableStorage' }, options);
        expect(ExpirableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'BaseStorage' }, options);
        expect(NamespaceableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'DefaultableStorage' }, options);
        expect(SerializableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'NamespaceableStorage' }, options);

        expect(storage).toEqual({ underlyingStorage, type: 'SerializableStorage' });
      });
    })

    describe('when using some of the storages', () => {
      it('chains the storages altogether', () => {
        SickoStorage.use(ExpirableStorage);
        SickoStorage.use(NamespaceableStorage);

        const options = {
          storage: window.localStorage,
          defaultValue: 123,
          ttl: 5000,
          namespace: 'test',
        }

        const storage = SickoStorage.build(options);

        expect(BaseStorage.build).toHaveBeenCalledWith(null, options);
        expect(ExpirableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'BaseStorage' }, options);
        expect(NamespaceableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'ExpirableStorage' }, options);

        expect(storage).toEqual({ underlyingStorage, type: 'NamespaceableStorage' });
      });
    })
  });
});
