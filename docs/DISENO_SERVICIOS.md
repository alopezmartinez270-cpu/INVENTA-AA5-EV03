# DiseÃ±o de servicios web de INVENTA

## 1. Contexto del proyecto

INVENTA administra las operaciones bÃ¡sicas de un establecimiento comercial: datos de clientes, catÃ¡logo de productos, existencias y ventas. Las evidencias anteriores implementaron estas entidades mediante Java/JSP y posteriormente con Spring Boot. La presente API conserva ese modelo y expone sus operaciones mediante HTTP y JSON.

## 2. Necesidades identificadas

| Necesidad de INVENTA | Servicio propuesto | Resultado esperado |
|---|---|---|
| Comprobar que el backend estÃ¡ disponible | `GET /api/health` | ConfirmaciÃ³n de estado y versiÃ³n |
| Controlar el acceso de usuarios | Registro y login | Alta de usuario y validaciÃ³n de credenciales |
| Mantener informaciÃ³n completa del comprador | CRUD de clientes | Cliente con nombre, apellido, documento, contacto y direcciÃ³n |
| Mantener catÃ¡logo y existencias | CRUD de productos | Producto con descripciÃ³n, precio, stock y categorÃ­a |
| Anticipar faltantes | Consulta de bajo stock | RelaciÃ³n de productos con stock menor o igual al lÃ­mite |
| Registrar una operaciÃ³n comercial | CreaciÃ³n de venta | Encabezado, detalles, total y descuento de stock |
| Corregir una venta anulada | AnulaciÃ³n | Cambio de estado y devoluciÃ³n de unidades al inventario |

## 3. Modelo de datos

### Usuario

`id`, `usuario`, `contrasenaHash`, `creadoEn`.

La contraseÃ±a no se guarda como texto visible. Se almacena un resumen SHA-256 para evitar exponerla directamente en el archivo de datos.

### Cliente

`id`, `nombre`, `apellido`, `documento`, `correo`, `telefono`, `direccion`.

El documento identifica de manera Ãºnica al cliente. Se conserva la separaciÃ³n entre nombre y apellido empleada por el proyecto original.

### Producto

`id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`.

Las categorÃ­as admitidas corresponden al formulario histÃ³rico de INVENTA: Ropa, Calzado, Accesorios, ElectrÃ³nica, Hogar y Otros. En JSON se usa `Electronica` sin tilde para simplificar la interoperabilidad.

### Venta y detalle

La venta contiene `id`, `idCliente`, `nombreCliente`, `fechaVenta`, `total`, `estado` y `detalles`. Cada detalle guarda `idProducto`, `nombreProducto`, `cantidad`, `precioUnitario` y `subtotal`.

Los nombres del cliente y del producto quedan registrados como referencia histÃ³rica. AsÃ­, una consulta posterior conserva el contexto comercial aunque los datos maestros cambien.

## 4. Reglas de negocio

1. No se registran dos clientes con el mismo documento.
2. El precio debe ser mayor que cero y el stock no puede ser negativo.
3. Cada producto pertenece a una categorÃ­a reconocida por INVENTA.
4. Una venta requiere un cliente existente y al menos un detalle.
5. Un producto no puede repetirse dentro de la misma venta.
6. La cantidad vendida debe ser un entero positivo.
7. Ninguna venta puede superar las existencias disponibles.
8. El total se calcula en el servidor; no se acepta un total enviado por el cliente.
9. Una venta nueva queda en estado `ACTIVA` y descuenta inventario.
10. Una venta anulada devuelve las unidades y no puede anularse por segunda vez.
11. No se eliminan clientes ni productos vinculados con ventas, para conservar trazabilidad.

## 5. Arquitectura

- `src/server.js`: inicia el servidor y define el puerto.
- `src/app.js`: rutas, validaciones y reglas de negocio.
- `src/store.js`: lectura y escritura controlada de la base JSON.
- `data/db.json`: persistencia local portable.
- `public/index.html`: Ã­ndice de documentaciÃ³n del servicio.
- `test/api.test.js`: verificaciÃ³n automatizada de los flujos principales.

Se eligiÃ³ Node.js con mÃ³dulos nativos para que el instructor pueda ejecutar la soluciÃ³n sin descargar paquetes. La persistencia JSON permite demostrar el ciclo completo de los servicios y mantener los datos entre ejecuciones.

## 6. Convenciones HTTP

- `200 OK`: consulta, actualizaciÃ³n, autenticaciÃ³n o anulaciÃ³n correcta.
- `201 Created`: recurso creado.
- `400 Bad Request`: cuerpo incompleto o dato invÃ¡lido.
- `401 Unauthorized`: credenciales incorrectas.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: duplicado, falta de stock o restricciÃ³n de integridad.
- `500 Internal Server Error`: fallo inesperado del servidor.
