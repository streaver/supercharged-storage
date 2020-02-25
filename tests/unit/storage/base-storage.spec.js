import BaseStorage from '@supercharged-storage/storage/base-storage';

describe('BaseStorage', () => {
  const validStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };
  const noSetStorage = { getItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };
  const noGetStorage = { setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };
  const noRemoveStorage = { setItem: jest.fn(), getItem: jest.fn(), clear: jest.fn() };
  const noClearStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
  const invalidStorage = {};

  beforeEach(() => {
    console.assert = jest.fn();
  });

  afterEach(() => {
    console.assert.mockRestore();
  })

  describe('constructor', () => {
    it('throws an error when invalid storage is provided', () => {
      expect(
        () => new BaseStorage(invalidStorage)
      ).toThrowError(new TypeError('Please provide a valid underlying storage object'));
    });

    it('does not throw error if storage is valid', () => {
      expect(
        () => new BaseStorage(validStorage)
      ).not.toThrowError(new TypeError('Please provide a valid underlying storage object'));
    });
  });

  describe('#getItem', () => {
    it('calls the underlying storage with the same key', () => {
      const baseStorage = new BaseStorage(validStorage);

      baseStorage.getItem('someKey');

      expect(validStorage.getItem).toHaveBeenCalledWith('someKey');
    });
  });

  describe('#setItem', () => {
    it('calls the underlying storage with the same key/value', () => {
      const baseStorage = new BaseStorage(validStorage);

      baseStorage.setItem('someKey', 123);

      expect(validStorage.setItem).toHaveBeenCalledWith('someKey', 123);
    });
  });

  describe('#removeItem', () => {
    it('calls the underlying storage with the same key', () => {
      const baseStorage = new BaseStorage(validStorage);

      baseStorage.removeItem('someKey');

      expect(validStorage.removeItem).toHaveBeenCalledWith('someKey');
    });
  });

  describe('#clear', () => {
    it('calls the underlying storage', () => {
      const baseStorage = new BaseStorage(validStorage);

      baseStorage.clear();

      expect(validStorage.clear).toHaveBeenCalled();
    });
  });

  describe('.build', () => {
    describe('when no storage option is provided', () => {
      it('returns a new instance using window.localStorage as a default', () => {
        const instance = BaseStorage.build(null, {});

        expect(instance._underlyingStorage).toBe(window.localStorage);
        expect(instance instanceof BaseStorage).toBe(true);
      });
    });

    describe('when a storage option is provided', () => {
      it('returns a new instance using the provided storage', () => {
        expect(BaseStorage.build(null, { storage: window.sessionStorage })._underlyingStorage).toBe(window.sessionStorage);
      });
    });
  });

  describe('.position', () => {
    it('returns 0', () => {
      expect(BaseStorage.build(null, {}).position).toBe(0);
    });
  });
});
