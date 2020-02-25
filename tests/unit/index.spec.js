import SuperchargedStorage from '@supercharged-storage/index';
import BaseStorage from '@supercharged-storage/storage/base-storage';
import DefaultableStorage from '@supercharged-storage/storage/defaultable-storage';
import NamespaceableStorage from '@supercharged-storage/storage/namespaceable-storage';
import SerializableStorage from '@supercharged-storage/storage/serializable-storage';
import ExpirableStorage from '@supercharged-storage/storage/expirable-storage';

jest.mock('@supercharged-storage/storage/base-storage');
jest.mock('@supercharged-storage/storage/defaultable-storage');
jest.mock('@supercharged-storage/storage/namespaceable-storage');
jest.mock('@supercharged-storage/storage/serializable-storage');
jest.mock('@supercharged-storage/storage/expirable-storage');

describe('SuperchargedStorage', () => {
  describe('.storages', () => {
    it('only contains one element', () => {
      expect(SuperchargedStorage.prototype.storages.length).toEqual(1);
    });

    it('contains only the BaseStorage', () => {
      expect(SuperchargedStorage.prototype.storages[0]).toEqual(BaseStorage);
    });
  });

  describe('.use', () => {
    it('pushes elements to the storages array', () => {
      SuperchargedStorage.use(DefaultableStorage);

      expect(SuperchargedStorage.prototype.storages.length).toEqual(2);
      expect(SuperchargedStorage.prototype.storages[0]).toEqual(BaseStorage);
      expect(SuperchargedStorage.prototype.storages[1]).toEqual(DefaultableStorage);
    });

    it('does not push if already present', () => {
      SuperchargedStorage.use(DefaultableStorage);
      SuperchargedStorage.use(DefaultableStorage);

      expect(SuperchargedStorage.prototype.storages.length).toEqual(2);
      expect(SuperchargedStorage.prototype.storages[0]).toEqual(BaseStorage);
      expect(SuperchargedStorage.prototype.storages[1]).toEqual(DefaultableStorage);
    });

    it('keeps the storages array sorted by storage position', () => {
      SuperchargedStorage.use(ExpirableStorage);
      SuperchargedStorage.use(DefaultableStorage);

      expect(SuperchargedStorage.prototype.storages.length).toEqual(3);
      expect(SuperchargedStorage.prototype.storages[0]).toEqual(BaseStorage);
      expect(SuperchargedStorage.prototype.storages[1]).toEqual(DefaultableStorage);
      expect(SuperchargedStorage.prototype.storages[2]).toEqual(ExpirableStorage);
    });
  });

  describe('.build', () => {
    let underlyingStorage;

    beforeEach(() => {
      SuperchargedStorage.prototype.storages = [BaseStorage]

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
        SuperchargedStorage.use(ExpirableStorage);
        SuperchargedStorage.use(DefaultableStorage);
        SuperchargedStorage.use(NamespaceableStorage);
        SuperchargedStorage.use(SerializableStorage);

        const options = {
          storage: window.localStorage,
          defaultValue: 123,
          ttl: 5000,
          namespace: 'test',
        }

        const storage = SuperchargedStorage.build(options);

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
        SuperchargedStorage.use(ExpirableStorage);
        SuperchargedStorage.use(NamespaceableStorage);

        const options = {
          storage: window.localStorage,
          defaultValue: 123,
          ttl: 5000,
          namespace: 'test',
        }

        const storage = SuperchargedStorage.build(options);

        expect(BaseStorage.build).toHaveBeenCalledWith(null, options);
        expect(ExpirableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'BaseStorage' }, options);
        expect(NamespaceableStorage.build).toHaveBeenCalledWith({ underlyingStorage, type: 'ExpirableStorage' }, options);

        expect(storage).toEqual({ underlyingStorage, type: 'NamespaceableStorage' });
      });
    })
  });
});
