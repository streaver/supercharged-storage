import DefaultableStorage from '@sicko-storage/storage/defaultable-storage';

describe('DefaultableStorage', () => {
  let validStorage;
  let defaultableStorage;

  beforeEach(() => {
    validStorage = { getItem: jest.fn().mockReturnValue(null), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };
    defaultableStorage = new DefaultableStorage(validStorage, 'default value');
  });

  describe('#getItem', () => {
    it('returns the default value when no value is set', () => {
      expect(defaultableStorage.getItem('someKey')).toEqual('default value');
    });

    it('returns the storage value when it is set', () => {
      validStorage.getItem.mockReturnValue('storage value');

      expect(defaultableStorage.getItem('someKey')).toEqual('storage value');
    });
  });

  describe('#setItem', () => {
    it('calls the underlying storage with the same key/value', () => {
      defaultableStorage.setItem('someKey', 123);

      expect(validStorage.setItem).toHaveBeenCalledWith('someKey', 123);
    });
  });

  describe('.build', () => {
    describe('when no defaultValue option is provided', () => {
      it('throws an error', () => {
        expect(
          () => DefaultableStorage.build(validStorage, {})
        ).toThrowError(new TypeError('Please provide a valid defaultValue option'));
      });
    });

    describe('when a defaultValue option is provided', () => {
      it('returns a new instance with the default value configured', () => {
        const instance = DefaultableStorage.build(validStorage, { defaultValue: 123 });

        expect(instance._underlyingStorage).toBe(validStorage);
        expect(instance._defaultValue).toBe(123);
        expect(instance instanceof DefaultableStorage).toBe(true);
      });
    });
  });

  describe('.position', () => {
    it('returns 3', () => {
      expect(DefaultableStorage.build(validStorage, { defaultValue: 123 }).position).toBe(3);
    });
  });
});
