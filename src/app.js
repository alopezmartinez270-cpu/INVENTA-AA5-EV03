const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { JsonStore } = require('./store');

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload, null, 2));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Cuerpo demasiado grande'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON no valido'));
      }
    });
    req.on('error', reject);
  });
}

function hashPassword(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function matchRoute(pathname, resource) {
  const match = pathname.match(new RegExp(`^/api/${resource}/(\\d+)$`));
  return match ? Number(match[1]) : null;
}

function validateRequired(body, fields) {
  return fields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
}

function createApp(options = {}) {
  const dbPath = options.dbPath || path.join(__dirname, '..', 'data', 'db.json');
  const publicPath = path.join(__dirname, '..', 'public', 'index.html');
  const store = new JsonStore(dbPath);

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    try {
      if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(fs.readFileSync(publicPath));
      }

      if (req.method === 'GET' && pathname === '/api/health') {
        return sendJson(res, 200, { estado: 'activo', servicio: 'INVENTA API', version: '1.0.0' });
      }

      if (req.method === 'POST' && pathname === '/api/registro') {
        const body = await readJson(req);
        const missing = validateRequired(body, ['usuario', 'contrasena']);
        if (missing.length) return sendJson(res, 400, { error: `Campos obligatorios: ${missing.join(', ')}` });
        const db = store.read();
        if (db.usuarios.some(item => item.usuario.toLowerCase() === body.usuario.toLowerCase())) {
          return sendJson(res, 409, { error: 'El usuario ya se encuentra registrado.' });
        }
        const usuario = {
          id: store.nextId(db.usuarios),
          usuario: body.usuario.trim(),
          contrasenaHash: hashPassword(body.contrasena),
          creadoEn: new Date().toISOString()
        };
        db.usuarios.push(usuario);
        store.write(db);
        return sendJson(res, 201, { mensaje: 'Usuario registrado correctamente.', id: usuario.id });
      }

      if (req.method === 'POST' && pathname === '/api/login') {
        const body = await readJson(req);
        const missing = validateRequired(body, ['usuario', 'contrasena']);
        if (missing.length) return sendJson(res, 400, { error: `Campos obligatorios: ${missing.join(', ')}` });
        const db = store.read();
        const usuario = db.usuarios.find(item => item.usuario.toLowerCase() === body.usuario.toLowerCase());
        if (!usuario || usuario.contrasenaHash !== hashPassword(body.contrasena)) {
          return sendJson(res, 401, { error: 'Credenciales incorrectas.' });
        }
        return sendJson(res, 200, { mensaje: 'Autenticacion satisfactoria.', usuario: usuario.usuario });
      }

      if (pathname === '/api/clientes' && req.method === 'GET') {
        return sendJson(res, 200, store.read().clientes);
      }
      if (pathname === '/api/clientes' && req.method === 'POST') {
        const body = await readJson(req);
        const missing = validateRequired(body, ['nombre', 'apellido', 'documento', 'correo']);
        if (missing.length) return sendJson(res, 400, { error: `Campos obligatorios: ${missing.join(', ')}` });
        const db = store.read();
        if (db.clientes.some(item => item.documento === String(body.documento))) {
          return sendJson(res, 409, { error: 'Ya existe un cliente con ese documento.' });
        }
        const cliente = {
          id: store.nextId(db.clientes),
          nombre: body.nombre.trim(),
          apellido: body.apellido.trim(),
          documento: String(body.documento),
          correo: body.correo.trim(),
          telefono: body.telefono ? String(body.telefono) : '',
          direccion: body.direccion ? body.direccion.trim() : ''
        };
        db.clientes.push(cliente);
        store.write(db);
        return sendJson(res, 201, cliente);
      }

      const clienteId = matchRoute(pathname, 'clientes');
      if (clienteId !== null) {
        const db = store.read();
        const index = db.clientes.findIndex(item => item.id === clienteId);
        if (index === -1) return sendJson(res, 404, { error: 'Cliente no encontrado.' });
        if (req.method === 'GET') return sendJson(res, 200, db.clientes[index]);
        if (req.method === 'PUT') {
          const body = await readJson(req);
          const missing = validateRequired(body, ['nombre', 'apellido', 'documento', 'correo']);
          if (missing.length) return sendJson(res, 400, { error: `Campos obligatorios: ${missing.join(', ')}` });
          if (db.clientes.some(item => item.id !== clienteId && item.documento === String(body.documento))) {
            return sendJson(res, 409, { error: 'Ya existe otro cliente con ese documento.' });
          }
          db.clientes[index] = { id: clienteId, nombre: body.nombre.trim(), apellido: body.apellido.trim(), documento: String(body.documento), correo: body.correo.trim(), telefono: body.telefono ? String(body.telefono) : '', direccion: body.direccion ? body.direccion.trim() : '' };
          store.write(db);
          return sendJson(res, 200, db.clientes[index]);
        }
        if (req.method === 'DELETE') {
          if (db.ventas.some(item => item.idCliente === clienteId)) {
            return sendJson(res, 409, { error: 'No se puede eliminar un cliente asociado a ventas.' });
          }
          const [removed] = db.clientes.splice(index, 1);
          store.write(db);
          return sendJson(res, 200, { mensaje: 'Cliente eliminado.', cliente: removed });
        }
      }

      if (pathname === '/api/productos' && req.method === 'GET') {
        return sendJson(res, 200, store.read().productos);
      }
      if (pathname === '/api/productos/bajo-stock' && req.method === 'GET') {
        const limite = Number(url.searchParams.get('limite') || 5);
        if (!Number.isInteger(limite) || limite < 0) return sendJson(res, 400, { error: 'El limite debe ser un entero igual o mayor que cero.' });
        const productos = store.read().productos.filter(item => item.stock <= limite);
        return sendJson(res, 200, { limite, cantidad: productos.length, productos });
      }
      if (pathname === '/api/productos' && req.method === 'POST') {
        const body = await readJson(req);
        const missing = validateRequired(body, ['nombre', 'precio', 'stock', 'categoria']);
        if (missing.length) return sendJson(res, 400, { error: `Campos obligatorios: ${missing.join(', ')}` });
        if (Number(body.precio) <= 0 || Number(body.stock) < 0) return sendJson(res, 400, { error: 'Precio y stock no son validos.' });
        const categorias = ['Ropa', 'Calzado', 'Accesorios', 'Electronica', 'Hogar', 'Otros'];
        if (!categorias.includes(body.categoria)) return sendJson(res, 400, { error: `Categoria no valida. Use: ${categorias.join(', ')}.` });
        const db = store.read();
        const producto = { id: store.nextId(db.productos), nombre: body.nombre.trim(), descripcion: body.descripcion || '', precio: Number(body.precio), stock: Number(body.stock), categoria: body.categoria };
        db.productos.push(producto);
        store.write(db);
        return sendJson(res, 201, producto);
      }

      const productoId = matchRoute(pathname, 'productos');
      if (productoId !== null) {
        const db = store.read();
        const index = db.productos.findIndex(item => item.id === productoId);
        if (index === -1) return sendJson(res, 404, { error: 'Producto no encontrado.' });
        if (req.method === 'GET') return sendJson(res, 200, db.productos[index]);
        if (req.method === 'PUT') {
          const body = await readJson(req);
          const missing = validateRequired(body, ['nombre', 'precio', 'stock', 'categoria']);
          if (missing.length) return sendJson(res, 400, { error: `Campos obligatorios: ${missing.join(', ')}` });
          if (Number(body.precio) <= 0 || Number(body.stock) < 0) return sendJson(res, 400, { error: 'Precio y stock no son validos.' });
          const categorias = ['Ropa', 'Calzado', 'Accesorios', 'Electronica', 'Hogar', 'Otros'];
          if (!categorias.includes(body.categoria)) return sendJson(res, 400, { error: `Categoria no valida. Use: ${categorias.join(', ')}.` });
          db.productos[index] = { id: productoId, nombre: body.nombre.trim(), descripcion: body.descripcion || '', precio: Number(body.precio), stock: Number(body.stock), categoria: body.categoria };
          store.write(db);
          return sendJson(res, 200, db.productos[index]);
        }
        if (req.method === 'DELETE') {
          if (db.ventas.some(venta => venta.detalles.some(item => item.idProducto === productoId))) {
            return sendJson(res, 409, { error: 'No se puede eliminar un producto asociado a ventas.' });
          }
          const [removed] = db.productos.splice(index, 1);
          store.write(db);
          return sendJson(res, 200, { mensaje: 'Producto eliminado.', producto: removed });
        }
      }

      if (pathname === '/api/ventas' && req.method === 'GET') {
        return sendJson(res, 200, store.read().ventas);
      }
      if (pathname === '/api/ventas' && req.method === 'POST') {
        const body = await readJson(req);
        if (!body.idCliente || !Array.isArray(body.detalles) || body.detalles.length === 0) {
          return sendJson(res, 400, { error: 'idCliente y detalles son obligatorios.' });
        }
        const db = store.read();
        const cliente = db.clientes.find(item => item.id === Number(body.idCliente));
        if (!cliente) {
          return sendJson(res, 404, { error: 'Cliente no encontrado.' });
        }
        const detalle = [];
        const idsSolicitados = new Set();
        for (const requested of body.detalles) {
          const producto = db.productos.find(item => item.id === Number(requested.idProducto));
          const cantidad = Number(requested.cantidad);
          if (!producto) return sendJson(res, 404, { error: `Producto ${requested.idProducto} no encontrado.` });
          if (idsSolicitados.has(producto.id)) return sendJson(res, 400, { error: `El producto ${producto.nombre} esta repetido en el detalle.` });
          idsSolicitados.add(producto.id);
          if (!Number.isInteger(cantidad) || cantidad <= 0) return sendJson(res, 400, { error: 'Las cantidades deben ser enteros positivos.' });
          if (producto.stock < cantidad) return sendJson(res, 409, { error: `Stock insuficiente para ${producto.nombre}.` });
          detalle.push({ idProducto: producto.id, nombreProducto: producto.nombre, cantidad, precioUnitario: producto.precio, subtotal: producto.precio * cantidad });
        }
        for (const item of detalle) {
          db.productos.find(producto => producto.id === item.idProducto).stock -= item.cantidad;
        }
        const venta = { id: store.nextId(db.ventas), idCliente: Number(body.idCliente), nombreCliente: `${cliente.nombre} ${cliente.apellido}`, fechaVenta: new Date().toISOString(), total: detalle.reduce((sum, item) => sum + item.subtotal, 0), estado: 'ACTIVA', detalles: detalle };
        db.ventas.push(venta);
        store.write(db);
        return sendJson(res, 201, venta);
      }

      const ventaId = matchRoute(pathname, 'ventas');
      if (ventaId !== null && req.method === 'GET') {
        const venta = store.read().ventas.find(item => item.id === ventaId);
        return venta ? sendJson(res, 200, venta) : sendJson(res, 404, { error: 'Venta no encontrada.' });
      }

      const anularMatch = pathname.match(/^\/api\/ventas\/(\d+)\/anular$/);
      if (anularMatch && req.method === 'PUT') {
        const idVenta = Number(anularMatch[1]);
        const db = store.read();
        const venta = db.ventas.find(item => item.id === idVenta);
        if (!venta) return sendJson(res, 404, { error: 'Venta no encontrada.' });
        if (venta.estado === 'ANULADA') return sendJson(res, 409, { error: 'La venta ya se encuentra anulada.' });
        for (const detalle of venta.detalles) {
          const producto = db.productos.find(item => item.id === detalle.idProducto);
          if (producto) producto.stock += detalle.cantidad;
        }
        venta.estado = 'ANULADA';
        venta.fechaAnulacion = new Date().toISOString();
        store.write(db);
        return sendJson(res, 200, { mensaje: 'Venta anulada y existencias reintegradas.', venta });
      }

      return sendJson(res, 404, { error: 'Ruta no encontrada.' });
    } catch (error) {
      const status = error.message === 'JSON no valido' ? 400 : 500;
      return sendJson(res, status, { error: error.message });
    }
  });
}

module.exports = { createApp };
