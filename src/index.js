import BaseStorage from '@sicko-mode-storage/storage/base-storage';

class SickoModeStorage {
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

SickoModeStorage.prototype.storages = [BaseStorage];

export default SickoModeStorage;
