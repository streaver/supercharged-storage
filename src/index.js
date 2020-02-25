import BaseStorage from '@supercharged-storage/storage/base-storage';
import DefaultableStorage from '@supercharged-storage/storage/defaultable-storage';
import NamespaceableStorage from '@supercharged-storage/storage/namespaceable-storage';
import SerializableStorage from '@supercharged-storage/storage/serializable-storage';
import ExpirableStorage from '@supercharged-storage/storage/expirable-storage';

class SuperchargedStorage {
  static build(options = {}) {
    return this.prototype.storages.reduce((storage, storageClass) => {
      return storageClass.build(storage, options);
    }, null);
  }

  static use(storageClass) {
    if (!this.prototype.storages.includes(storageClass)) {
      this.prototype.storages.push(storageClass);
    }

    this.prototype.storages.sort((s1, s2) => s1.position - s2.position)
  }
};

SuperchargedStorage.prototype.storages = [BaseStorage];

export {
  DefaultableStorage,
  NamespaceableStorage,
  SerializableStorage,
  ExpirableStorage,
};

export default SuperchargedStorage;
