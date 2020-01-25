import BaseStorage from '@sicko-storage/storage/base-storage';

export const DEFAULT_NAMESPACE = 'vp';

class NamespaceableStorage extends BaseStorage {
  constructor(underlyingStorage, namespace) {
    super(underlyingStorage);

    this._namespace = namespace;
  }

  getItem(key) {
    const namespacedKey = this.buildNamespacedKey(key);

    return super.getItem(namespacedKey);
  }

  setItem(key, value) {
    const namespacedKey = this.buildNamespacedKey(key);

    return super.setItem(namespacedKey, value);
  }

  removeItem(key) {
    const namespacedKey = this.buildNamespacedKey(key);

    return super.removeItem(namespacedKey);
  }

  buildNamespacedKey(key) {
    return Boolean(this._namespace) ? `${this._namespace}:${key}` : key;
  }

  static build(storage, options) {
    if (options.namespace) {
      return new NamespaceableStorage(storage, options.namespace);
    } else {
      throw new TypeError('Please provide a valid namespace option');
    }
  }
};

NamespaceableStorage.prototype.position = 2;

export default NamespaceableStorage;
