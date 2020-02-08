import { when } from 'jest-when'

import NamespaceableStorage from '@sicko-storage/storage/namespaceable-storage';

describe('NamespaceableStorage', () => {
  let validStorage;
  let namespaceableStorage1;
  let namespaceableStorage2;
  let namespaceableStorage3;

  beforeEach(() => {
    validStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };

    when(validStorage.getItem)
      .calledWith('namespace1:someKey').mockReturnValue('value1')
      .calledWith('namespace2:someKey').mockReturnValue('value2')
      .calledWith('someKey').mockReturnValue('value3')

    namespaceableStorage1 = new NamespaceableStorage(validStorage, 'namespace1');
    namespaceableStorage2 = new NamespaceableStorage(validStorage, 'namespace2');
    namespaceableStorage3 = new NamespaceableStorage(validStorage, null);
  });

  describe('#getItem', () => {
    it('returns the value from the namespaced storage', () => {
      expect(namespaceableStorage1.getItem('someKey')).toEqual('value1');
      expect(namespaceableStorage2.getItem('someKey')).toEqual('value2');
      expect(namespaceableStorage3.getItem('someKey')).toEqual('value3');
    });
  });

  describe('#setItem', () => {
    it('calls the underlying storage with the namespaced key/value', () => {
      namespaceableStorage1.setItem('someKey', 'value1');
      namespaceableStorage2.setItem('someKey', 'value2');
      namespaceableStorage3.setItem('someKey', 'value3');

      expect(validStorage.setItem).toHaveBeenCalledWith('namespace1:someKey', 'value1');
      expect(validStorage.setItem).toHaveBeenCalledWith('namespace2:someKey', 'value2');
      expect(validStorage.setItem).toHaveBeenCalledWith('someKey', 'value3');
    });
  });

  describe('#removeItem', () => {
    it('calls the underlying storage with the namespaced key', () => {
      namespaceableStorage1.removeItem('someKey');
      namespaceableStorage2.removeItem('someKey');
      namespaceableStorage3.removeItem('someKey');

      expect(validStorage.removeItem).toHaveBeenCalledWith('namespace1:someKey');
      expect(validStorage.removeItem).toHaveBeenCalledWith('namespace2:someKey');
      expect(validStorage.removeItem).toHaveBeenCalledWith('someKey');
    });
  });

  describe('.build', () => {
    describe('when no namespace option is provided', () => {
      it('throws an error', () => {
        expect(
          () => NamespaceableStorage.build(validStorage, {})
        ).toThrowError(new TypeError('Please provide a valid namespace option'));
      });
    });

    describe('when a namespace option is provided', () => {
      it('returns a new instance with the namespace value configured', () => {
        const instance = NamespaceableStorage.build(validStorage, { namespace: 'namespace1' });

        expect(instance._underlyingStorage).toBe(validStorage);
        expect(instance._namespace).toBe('namespace1');
        expect(instance instanceof NamespaceableStorage).toBe(true);
      });
    });
  });

  describe('.position', () => {
    it('returns 2', () => {
      expect(NamespaceableStorage.build(validStorage, { namespace: 'namespace1' }).position).toBe(2);
    });
  });
});
