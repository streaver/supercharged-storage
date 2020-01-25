import BaseStorage from '@sicko-storage/storage/base-storage';

class DefaultableStorage extends BaseStorage {
  constructor(underlyingStorage, defaultValue) {
    super(underlyingStorage);

    this._defaultValue = defaultValue;
  }

  getItem(key) {
    const value = super.getItem(key);

    return value === null ? this._defaultValue : value;
  }

  static build(storage, options) {
    if (options.defaultValue) {
      return new DefaultableStorage(storage, options.defaultValue)
    } else {
      throw new TypeError('Please provide a valid defaultValue option');
    }
  }
};

DefaultableStorage.prototype.position = 3;

export default DefaultableStorage;
