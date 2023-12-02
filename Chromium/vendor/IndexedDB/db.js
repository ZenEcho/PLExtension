class IndexedDBHelper {
  // 构造函数
  constructor(storeName, dbName) {
    this.dbName = dbName || "PLExtension"; // 默认数据库名
    this.storeName = storeName; // 对象存储名
    this.db = null; // 数据库实例
    this.sortedByIndex = 0; // 新增变量
  }

  // 打开数据库
  open(version = 1) {
    return new Promise((resolve, reject) => {
      // 打开或创建数据库
      const request = indexedDB.open(this.dbName, version);
      // 数据库升级时的回调
      request.onupgradeneeded = event => {
        this.db = event.target.result;

        if (!this.db.objectStoreNames.contains('BedConfigStore')) {
          const Store = this.db.createObjectStore('BedConfigStore', { keyPath: "id" });
          Store.createIndex("index", "index", { unique: false });
        }
        if (!this.db.objectStoreNames.contains('Uploads')) {
          const Store = this.db.createObjectStore('Uploads', { keyPath: "key" });
          Store.createIndex("index", "index", { unique: false });
        }

        if (!this.db.objectStoreNames.contains('Sticker')) {
          const Store = this.db.createObjectStore('Sticker', { keyPath: 'id', autoIncrement: true });
          Store.createIndex("index", "index", { unique: false });
        }
      };

      // 打开成功的回调
      request.onsuccess = async event => {
        this.db = event.target.result;
        // 初始化 currentSortOrder 的值
        try {
          this.getMaxIndex().then(index => {
            this.sortedByIndex = index;
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      // 打开失败的回调
      request.onerror = event => {
        console.error("IndexedDB error:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    });
  }
  getMaxIndex() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      const index = store.index("index");
      const request = index.openCursor(null, "prev");

      request.onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          return resolve(cursor.value.index + 1);
        } else {
          resolve(0);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
  // 关闭数据库
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  add(data, batchSize = 1000) {
    return this._batchOperation(data, batchSize, 'add');
  }

  put(data, batchSize = 1000) {
    return this._batchOperation(data, batchSize, 'put');
  }

  _batchOperation(data, batchSize, operation) {
    return new Promise(async (resolve, reject) => {
      if (!Array.isArray(data)) {
        data = [data];
      }
      for (let i = 0; i < data.length; i += batchSize) {

        const batch = data.slice(i, i + batchSize);
        try {
          await this._processBatch(batch, operation);
        } catch (error) {
          reject(error);
          return;
        }
      }

      resolve();
    });
  }
  _processBatch(batch, operation, Index) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      let count = 0;

      batch.forEach((item, index) => {
        let request;
        if (item.index === undefined) {
          item.index = this.sortedByIndex++;
        }
        if (operation === 'put') {
          request = store.put(item);
        } else if (operation === 'add') {
          request = store.add(item);
        } else {
          reject(new Error("Invalid operation"));
          return;
        }

        request.onsuccess = () => {
          count++;
          if (count === batch.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }


  // 根据键获取数据
  get(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName]);
      const store = transaction.objectStore(this.storeName);

      let request;
      if (key === undefined) {
        // 如果没有提供键值，获取所有数据
        request = store.getAll();
      } else {
        // 如果提供了键值，获取指定键的数据
        request = store.get(key);
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  // 获取所有数据
  getAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll(); // 获取所有数据

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  // 获取所有数据并按照 index 字段排序
  getSortedByIndex() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("index"); // 使用创建的索引
      const request = index.getAll(); // 获取根据索引排序的所有数据
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 根据键删除数据
  delete(keys) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      // 检查 keys 是否为数组
      if (Array.isArray(keys)) {
        let count = 0;
        keys.forEach(key => {
          const request = store.delete(key);

          request.onsuccess = () => {
            count++;
            // 当所有键都被删除时，解决 promise
            if (count === keys.length) {
              resolve();
            }
          };

          request.onerror = () => reject(request.error);
        });
      } else {
        // keys 不是数组，处理单个键
        let request;
        if (keys === undefined) {
          // 没有指定键，删除所有数据
          request = store.clear();
        } else {
          // 根据指定键删除数据
          request = store.delete(keys);
        }

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }
    });
  }

  // 清空所有数据
  clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear(); // 清空对象存储中的所有数据
      this.sortedByIndex = 0
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}


function dbHelper(storeName) {
  return new Promise((resolve, reject) => {
    const db = new IndexedDBHelper(storeName);
    db.open().then(() => {
      resolve({ db });
    }).catch(error => {
      reject({ "error": error, "message": "数据库好像出了点问题" });
    });
  });
}
