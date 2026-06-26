const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../src/app');

const dbPath = path.join(__dirname, '..', 'data', 'db.test.json');
let server;
let baseUrl;

async function request(method, route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, body: await response.json() };
}

test.before(async () => {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  server = createApp({ dbPath });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

test('informa que INVENTA API se encuentra activa', async () => {
  const result = await request('GET', '/api/health');
  assert.equal(result.status, 200);
  assert.equal(result.body.servicio, 'INVENTA API');
});

test('registra usuario, evita duplicados y valida credenciales', async () => {
  const credenciales = { usuario: 'administrador.inventa', contrasena: 'Inventa2026*' };
  assert.equal((await request('POST', '/api/registro', credenciales)).status, 201);
  assert.equal((await request('POST', '/api/registro', credenciales)).status, 409);
  assert.equal((await request('POST', '/api/login', credenciales)).status, 200);
  assert.equal((await request('POST', '/api/login', { ...credenciales, contrasena: 'Incorrecta' })).status, 401);
});

test('registra un cliente con el modelo histÃ³rico de INVENTA', async () => {
  const cliente = {
    nombre: 'Laura',
    apellido: 'Gomez Restrepo',
    documento: '1032456789',
    correo: 'laura.gomez@example.com',
    telefono: '3004567890',
    direccion: 'Carrera 18 # 42-16'
  };
  const created = await request('POST', '/api/clientes', cliente);
  assert.equal(created.status, 201);
  assert.equal(created.body.id, 1);
  assert.equal(created.body.apellido, cliente.apellido);
  assert.equal((await request('POST', '/api/clientes', cliente)).status, 409);
});

test('registra productos con categorÃ­a y detecta bajo stock', async () => {
  const camisa = await request('POST', '/api/productos', {
    nombre: 'Camisa Oxford manga larga',
    descripcion: 'Camisa formal azul, talla M',
    precio: 78000,
    stock: 12,
    categoria: 'Ropa'
  });
  assert.equal(camisa.status, 201);

  const cinturon = await request('POST', '/api/productos', {
    nombre: 'Cinturon clasico cuero',
    descripcion: 'Cinturon negro, talla ajustable',
    precio: 52000,
    stock: 4,
    categoria: 'Accesorios'
  });
  assert.equal(cinturon.status, 201);

  const bajoStock = await request('GET', '/api/productos/bajo-stock?limite=5');
  assert.equal(bajoStock.status, 200);
  assert.equal(bajoStock.body.cantidad, 1);
  assert.equal(bajoStock.body.productos[0].nombre, 'Cinturon clasico cuero');
});

test('registra venta, calcula total y descuenta existencias', async () => {
  const venta = await request('POST', '/api/ventas', {
    idCliente: 1,
    detalles: [
      { idProducto: 1, cantidad: 2 },
      { idProducto: 2, cantidad: 1 }
    ]
  });
  assert.equal(venta.status, 201);
  assert.equal(venta.body.estado, 'ACTIVA');
  assert.equal(venta.body.total, 208000);
  assert.equal(venta.body.nombreCliente, 'Laura Gomez Restrepo');

  const camisa = await request('GET', '/api/productos/1');
  const cinturon = await request('GET', '/api/productos/2');
  assert.equal(camisa.body.stock, 10);
  assert.equal(cinturon.body.stock, 3);
});

test('rechaza venta sin existencias suficientes y productos repetidos', async () => {
  const sinStock = await request('POST', '/api/ventas', {
    idCliente: 1,
    detalles: [{ idProducto: 2, cantidad: 50 }]
  });
  assert.equal(sinStock.status, 409);

  const repetido = await request('POST', '/api/ventas', {
    idCliente: 1,
    detalles: [
      { idProducto: 1, cantidad: 1 },
      { idProducto: 1, cantidad: 1 }
    ]
  });
  assert.equal(repetido.status, 400);
});

test('anula la venta, reintegra stock y evita una segunda anulaciÃ³n', async () => {
  const anulacion = await request('PUT', '/api/ventas/1/anular');
  assert.equal(anulacion.status, 200);
  assert.equal(anulacion.body.venta.estado, 'ANULADA');

  assert.equal((await request('GET', '/api/productos/1')).body.stock, 12);
  assert.equal((await request('GET', '/api/productos/2')).body.stock, 4);
  assert.equal((await request('PUT', '/api/ventas/1/anular')).status, 409);
});

test('protege la trazabilidad de clientes y productos vendidos', async () => {
  assert.equal((await request('DELETE', '/api/clientes/1')).status, 409);
  assert.equal((await request('DELETE', '/api/productos/1')).status, 409);
});

test('responde correctamente ante recursos y rutas inexistentes', async () => {
  assert.equal((await request('GET', '/api/clientes/999')).status, 404);
  assert.equal((await request('GET', '/api/ruta-inexistente')).status, 404);
});
