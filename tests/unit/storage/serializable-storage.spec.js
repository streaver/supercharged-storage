import SerializableStorage from '@sicko-mode-storage/storage/serializable-storage';

describe('SerializableStorage', () => {
  let underlyingStorage;
  let serializableStorage;

  beforeEach(() => {
    underlyingStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() };
  });

  describe('#getItem', () => {
    describe('when no deserializer is provided', () => {
      const data = { test: 1 };

      beforeEach(() => {
        serializableStorage = new SerializableStorage(underlyingStorage);
      });

      it('parses storage data as JSON', () => {
        underlyingStorage.getItem.mockReturnValue(JSON.stringify(data));

        expect(serializableStorage.getItem('someKey')).toEqual(data);
      });

      it('returns raw data if parsing fails', () => {
        const badData = `${JSON.stringify(data)} bad data`;

        underlyingStorage.getItem.mockReturnValue(badData);

        expect(serializableStorage.getItem('someKey')).toEqual(badData);
      });
    });

    describe('when a deserializer is provided', () => {
      it('returns the deserializer return value', () => {
        const csv = '1,2,3';
        const csvDeserializer = (data) => data.split(',');

        serializableStorage = new SerializableStorage(underlyingStorage, {
          deserializer: csvDeserializer
        });

        underlyingStorage.getItem.mockReturnValue(csv);

        expect(serializableStorage.getItem('someKey')).toEqual(["1", "2", "3"]);
      });
    });
  });

  describe('#setItem', () => {
    describe('when no serializer is provided', () => {
      it('serializes data as JSON', () => {
        const data = { test: 1 };

        serializableStorage = new SerializableStorage(underlyingStorage);
        serializableStorage.setItem('someKey', data);

        expect(underlyingStorage.setItem).toBeCalledWith('someKey', JSON.stringify(data));
      });
    });

    describe('when a serializer is provided', () => {
      it('saves the data as returned by the serializer', () => {
        const csvArray = [1, 2, 3];
        const csvSerializer = (data) => data.join(',');

        serializableStorage = new SerializableStorage(underlyingStorage, {
          serializer: csvSerializer
        });

        serializableStorage.setItem('someKey', csvArray);

        expect(underlyingStorage.setItem).toBeCalledWith('someKey', csvArray.join(','));
      });
    });
  });

  describe('.build', () => {
    describe('when no serializer/deserializer option is provided', () => {
      it('uses the default serializer/deserializer', () => {
        const instance = SerializableStorage.build(underlyingStorage, {});

        expect(instance._underlyingStorage).toBe(underlyingStorage);
        expect(instance._serializer).toBe(SerializableStorage.prototype.defaultSerializer);
        expect(instance._deserializer).toBe(SerializableStorage.prototype.defaultDeserializer);
        expect(instance instanceof SerializableStorage).toBe(true);
      });
    });

    describe('when a serializer/deserializer option is provided', () => {
      it('returns a new instance with the serializer/deserializer value configured', () => {
        const serializer = jest.fn();
        const deserializer = jest.fn();
        const instance = SerializableStorage.build(underlyingStorage, { serializer, deserializer });

        expect(instance._underlyingStorage).toBe(underlyingStorage);
        expect(instance._serializer).toBe(serializer);
        expect(instance._deserializer).toBe(deserializer);
        expect(instance instanceof SerializableStorage).toBe(true);
      });
    });
  });

  describe('.position', () => {
    it('returns 2', () => {
      expect(SerializableStorage.build(underlyingStorage, {}).position).toBe(1);
    });
  });
});
