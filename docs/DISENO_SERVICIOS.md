# Diseño de servicios web de INVENTA

## 1. Contexto del proyecto

INVENTA es el proyecto que se viene trabajando para organizar clientes, productos, existencias y ventas. En evidencias anteriores estos módulos se realizaron con Java/JSP y después con Spring Boot. Para esta evidencia se construyó una API que permite usar las mismas funciones mediante solicitudes HTTP y datos en formato JSON.

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

Se conservaron las categorías que ya tenía el formulario de INVENTA: Ropa, Calzado, Accesorios, Electrónica, Hogar y Otros. En los datos JSON se escribe `Electronica` sin tilde para evitar problemas al enviar la información.

### Venta y detalle

La venta contiene `id`, `idCliente`, `nombreCliente`, `fechaVenta`, `total`, `estado` y `detalles`. Cada detalle guarda `idProducto`, `nombreProducto`, `cantidad`, `precioUnitario` y `subtotal`.

También se guarda el nombre del cliente y del producto dentro de la venta. De esta manera, al consultar una venta antigua todavía se puede saber a quién se realizó y qué productos se vendieron, incluso si después se actualizan esos datos.

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
11. No se eliminan clientes ni productos que ya aparecen en una venta, porque se perdería parte del historial.

## 5. Arquitectura

- `src/server.js`: inicia el servidor y define el puerto.
- `src/app.js`: rutas, validaciones y reglas de negocio.
- `src/store.js`: lectura y escritura controlada de la base JSON.
- `data/db.json`: archivo donde se guardan los datos para las pruebas.
- `public/index.html`: índice de documentación del servicio.
- `test/api.test.js`: verificación automatizada de los flujos principales.

Se utilizó Node.js con sus módulos nativos para que el proyecto pueda ejecutarse sin instalar paquetes adicionales. Se decidió guardar la información en un archivo JSON porque facilita las pruebas y permite conservar los datos sin instalar una base de datos aparte.

## 6. Convenciones HTTP

- `200 OK`: consulta, actualización, autenticación o anulación correcta.
- `201 Created`: recurso creado.
- `400 Bad Request`: cuerpo incompleto o dato inválido.
- `401 Unauthorized`: credenciales incorrectas.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: duplicado, falta de stock o restricción de integridad.
- `500 Internal Server Error`: fallo inesperado del servidor.
