# INVENTA API

Este proyecto contiene los servicios web del sistema INVENTA. La API permite trabajar con los clientes, productos, existencias y ventas que ya se habían desarrollado en las evidencias anteriores con Java/JSP y Spring Boot.

## Alcance

- Registro e inicio de sesión de usuarios.
- Administración de clientes con documento único.
- Administración de productos por categoría.
- Consulta de productos con existencias bajas.
- Registro de ventas con múltiples detalles.
- Validación de disponibilidad antes de vender.
- Descuento automático de existencias.
- Anulación de ventas con reintegro de existencias.

## Ejecución

1. Tener Node.js 18 o superior.
2. Ejecutar `INICIAR_SERVIDOR.bat` en Windows o `npm start` desde una terminal.
3. Abrir `http://localhost:3000/`.
4. Probar los endpoints desde Postman usando `http://localhost:3000` como URL base.

No se necesitan paquetes externos ni una base de datos adicional. Para facilitar la ejecución y las pruebas, la información se guarda en `data/db.json`.

## Pruebas

Ejecutar:

```text
npm test
```

Las pruebas cubren autenticación, clientes, productos, control de stock, ventas y anulaciones.

## Documentación

- `docs/DISENO_SERVICIOS.md`: análisis, modelo y explicación del diseño realizado.
- `docs/DOCUMENTACION_API.md`: uso detallado de cada servicio.
- `docs/openapi.yaml`: contrato OpenAPI 3.0 importable en Postman.
- `ENDPOINTS_API.txt`: inventario rápido de endpoints.

## Versionamiento

El proyecto utiliza Git. El enlace y la referencia del repositorio se encuentran en `ENLACE_REPOSITORIO.txt`.
