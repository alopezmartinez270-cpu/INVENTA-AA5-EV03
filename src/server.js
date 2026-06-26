const path = require('node:path');
const { createApp } = require('./app');

const port = Number(process.env.PORT || 3000);
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'db.json');
const server = createApp({ dbPath });

server.listen(port, () => {
  console.log(`INVENTA API disponible en http://localhost:${port}`);
  console.log(`Documentacion local en http://localhost:${port}/`);
});
