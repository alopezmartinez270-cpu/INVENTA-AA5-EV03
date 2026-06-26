const fs = require('node:fs');
const path = require('node:path');

const EMPTY_DB = {
  usuarios: [],
  clientes: [],
  productos: [],
  ventas: []
};

class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.ensureDatabase();
  }

  ensureDatabase() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(EMPTY_DB, null, 2));
    }
  }

  read() {
    return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  nextId(collection) {
    return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }
}

module.exports = { JsonStore, EMPTY_DB };
