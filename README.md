# INVENTA API

Proyecto de servicios web para INVENTA, sistema de control de clientes, productos, inventario y ventas. Esta versiÃ³n traslada a una API REST las entidades desarrolladas previamente en los mÃ³dulos Java/JSP y Spring Boot del proyecto formativo.

## Alcance

- Registro e inicio de sesiÃ³n de usuarios.
- AdministraciÃ³n de clientes con documento Ãºnico.
- AdministraciÃ³n de productos por categorÃ­a.
- Consulta de productos con existencias bajas.
- Registro de ventas con mÃºltiples detalles.
- ValidaciÃ³n de disponibilidad antes de vender.
- Descuento automÃ¡tico de existencias.
- AnulaciÃ³n de ventas con reintegro de existencias.

## EjecuciÃ³n

1. Tener Node.js 18 o superior.
2. Ejecutar `INICIAR_SERVIDOR.bat` en Windows o `npm start` desde una terminal.
3. Abrir `http://localhost:3000/`.
4. Probar los endpoints desde Postman usando `http://localhost:3000` como URL base.

No se requieren paquetes externos ni una instalaciÃ³n de base de datos. La informaciÃ³n se conserva en `data/db.json`.

## Pruebas

Ejecutar:

```text
npm test
```

Las pruebas cubren autenticaciÃ³n, clientes, productos, control de stock, ventas y anulaciones.

## DocumentaciÃ³n

- `docs/DISENO_SERVICIOS.md`: anÃ¡lisis, modelo y decisiones de diseÃ±o.
- `docs/DOCUMENTACION_API.md`: uso detallado de cada servicio.
- `docs/openapi.yaml`: contrato OpenAPI 3.0 importable en Postman.
- `ENDPOINTS_API.txt`: inventario rÃ¡pido de endpoints.

## Versionamiento

El proyecto utiliza Git. El enlace y la referencia del repositorio se encuentran en `ENLACE_REPOSITORIO.txt`.
