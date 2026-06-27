# Diseño de servicios web de INVENTA

## 1. Contexto del proyecto

INVENTA administra las operaciones básicas de un establecimiento comercial: datos de clientes, catálogo de productos, existencias y ventas. Las evidencias anteriores implementaron estas entidades mediante Java/JSP y posteriormente con Spring Boot. La presente API conserva ese modelo y expone sus operaciones mediante HTTP y JSON.

## 2. Necesidades identificadas

| Necesidad de INVENTA | Servicio propuesto | Resultado esperado |
|---|---|---|
| Comprobar que el backend está disponible | `GET /api/health` | Confirmación de estado y versión |
| Controlar el acceso de usuarios | Registro y login | Alta de usuario y validación de credenciales |
| Mantener información completa del comprador | CRUD de clientes | Cliente con nombre, apellido, documento, contacto y dirección |
| Mantener catálogo y existencias | CRUD de productos | Producto con descripción, precio, stock y categoría |
| Anticipar faltantes | Consulta de bajo stock | Relación de productos con stock menor o igual al límite |
| Registrar una operación comercial | Creación de venta | Encabezado, detalles, total y descuento de stock |
| Corregir una venta anulada | Anulación | Cambio de estado y devolución de unidades al inventario |

## 3. Modelo de datos

### Usuario

`id`, `usuario`, `contrasenaHash`, `creadoEn`.

La contraseña no se guarda como texto visible. Se almacena un resumen SHA-256 para evitar exponerla directamente en el archivo de datos.

### Cliente

`id`, `nombre`, `apellido`, `documento`, `correo`, `telefono`, `direccion`.

El documento identifica de manera única al cliente. Se conserva la separación entre nombre y apellido empleada por el proyecto original.

### Producto

`id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`.

Las categorías admitidas corresponden al formulario histórico de INVENTA: Ropa, Calzado, Accesorios, Electrónica, Hogar y Otros. En JSON se usa `Electronica` sin tilde para simplificar la interoperabilidad.

### Venta y detalle

La venta contiene `id`, `idCliente`, `nombreCliente`, `fechaVenta`, `total`, `estado` y `detalles`. Cada detalle guarda `idProducto`, `nombreProducto`, `cantidad`, `precioUnitario` y `subtotal`.

Los nombres del cliente y del producto quedan registrados como referencia histórica. Así, una consulta posterior conserva el contexto comercial aunque los datos maestros cambien.

## 4. Reglas de negocio

1. No se registran dos clientes con el mismo documento.
2. El precio debe ser mayor que cero y el stock no puede ser negativo.
3. Cada producto pertenece a una categoría reconocida por INVENTA.
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
- `public/index.html`: índice de documentación del servicio.
- `test/api.test.js`: verificación automatizada de los flujos principales.

Se eligió Node.js con módulos nativos para que el instructor pueda ejecutar la solución sin descargar paquetes. La persistencia JSON permite demostrar el ciclo completo de los servicios y mantener los datos entre ejecuciones.

## 6. Convenciones HTTP

- `200 OK`: consulta, actualización, autenticación o anulación correcta.
- `201 Created`: recurso creado.
- `400 Bad Request`: cuerpo incompleto o dato inválido.
- `401 Unauthorized`: credenciales incorrectas.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: duplicado, falta de stock o restricción de integridad.
- `500 Internal Server Error`: fallo inesperado del servidor.
