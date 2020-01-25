import BaseStorage from '@sicko-storage/storage/base-storage';

class SerializableStorage extends BaseStorage {
  constructor(underlyingStorage, options = {}) {
    super(underlyingStorage);

    this._serializer = options.serializer || this.defaultSerializer;
    this._deserializer = options.deserializer || this.defaultDeserializer;
  }

  getItem(key) {
    return this._deserializer(super.getItem(key));
  }

  setItem(key, value) {
    return super.setItem(key, this._serializer(value));
  }

  static build(storage, options) {
    return new SerializableStorage(storage, {
      serializer: options.serializer,
      deserializer: options.deserializer,
    });
  }
};

SerializableStorage.prototype.position = 1;

SerializableStorage.prototype.defaultSerializer = (data) => {
  return JSON.stringify(data);
};

SerializableStorage.prototype.defaultDeserializer = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

export default SerializableStorage;
