# DocumentaciÃ³n de INVENTA API

## ConfiguraciÃ³n general

- URL base: `http://localhost:3000`
- Formato de intercambio: JSON
- Encabezado para solicitudes con cuerpo: `Content-Type: application/json`

## Estado del servicio

### GET `/api/health`

Confirma que INVENTA API estÃ¡ disponible. Respuesta `200`:

```json
{
  "estado": "activo",
  "servicio": "INVENTA API",
  "version": "1.0.0"
}
```

## Usuarios

### POST `/api/registro`

```json
{
  "usuario": "administrador.inventa",
  "contrasena": "Inventa2026*"
}
```

Responde `201` al crear, `409` si el usuario ya existe y `400` si falta un campo.

### POST `/api/login`

Usa el mismo cuerpo del registro. Responde `200` con autenticaciÃ³n satisfactoria o `401` con credenciales incorrectas.

## Clientes

### POST `/api/clientes`

```json
{
  "nombre": "Laura",
  "apellido": "Gomez Restrepo",
  "documento": "1032456789",
  "correo": "laura.gomez@example.com",
  "telefono": "3004567890",
  "direccion": "Carrera 18 # 42-16"
}
```

El documento no puede repetirse. Respuesta correcta: `201` con el cliente y su identificador.

### GET `/api/clientes`

Devuelve la lista completa. Respuesta `200`.

### GET `/api/clientes/:id`

Consulta un cliente. Responde `200` o `404`.

### PUT `/api/clientes/:id`

Recibe todos los campos mostrados en el registro y responde `200`. Valida que el nuevo documento no pertenezca a otro cliente.

### DELETE `/api/clientes/:id`

Elimina un cliente sin ventas. Si posee una venta asociada responde `409` para proteger el historial.

## Productos e inventario

### POST `/api/productos`

```json
{
  "nombre": "Camisa Oxford manga larga",
  "descripcion": "Camisa formal azul, talla M",
  "precio": 78000,
  "stock": 12,
  "categoria": "Ropa"
}
```

CategorÃ­as permitidas: `Ropa`, `Calzado`, `Accesorios`, `Electronica`, `Hogar`, `Otros`.

### GET `/api/productos`

Devuelve el catÃ¡logo con precio, existencias y categorÃ­a.

### GET `/api/productos/bajo-stock?limite=5`

Devuelve productos cuyo stock sea menor o igual al lÃ­mite indicado. Si no se envÃ­a lÃ­mite se usa 5.

### GET, PUT y DELETE `/api/productos/:id`

Permiten consultar, actualizar o eliminar. Un producto asociado a ventas no puede eliminarse.

## Ventas

### POST `/api/ventas`

```json
{
  "idCliente": 1,
  "detalles": [
    {
      "idProducto": 1,
      "cantidad": 2
    }
  ]
}
```

La API toma el precio vigente, calcula subtotales y total, registra la venta como `ACTIVA` y descuenta las unidades. Responde:

- `201`: venta registrada.
- `404`: cliente o producto inexistente.
- `409`: stock insuficiente.
- `400`: cantidad invÃ¡lida, detalle vacÃ­o o producto repetido.

### GET `/api/ventas`

Devuelve el historial con cliente, fecha, estado, detalles y total.

### GET `/api/ventas/:id`

Devuelve el comprobante detallado de una venta.

### PUT `/api/ventas/:id/anular`

Marca una venta como `ANULADA`, registra `fechaAnulacion` y devuelve al inventario las cantidades de cada detalle. Una segunda anulaciÃ³n responde `409`.

## Flujo recomendado en Postman

1. Verificar `/api/health`.
2. Registrar y autenticar un usuario.
3. Crear un cliente.
4. Crear dos productos con categorÃ­as vÃ¡lidas.
5. Consultar el catÃ¡logo y el reporte de bajo stock.
6. Registrar una venta con el cliente y los productos creados.
7. Verificar que el stock disminuyÃ³.
8. Consultar la venta.
9. Anularla y verificar que las existencias fueron reintegradas.
