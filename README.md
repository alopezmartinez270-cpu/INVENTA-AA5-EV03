# INVENTA API

Proyecto de servicios web para INVENTA, sistema de control de clientes, productos, inventario y ventas. Esta versión traslada a una API REST las entidades desarrolladas previamente en los módulos Java/JSP y Spring Boot del proyecto formativo.

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

No se requieren paquetes externos ni una instalación de base de datos. La información se conserva en `data/db.json`.

## Pruebas

Ejecutar:

```text
npm test
```

Las pruebas cubren autenticación, clientes, productos, control de stock, ventas y anulaciones.

## Documentación

- `docs/DISENO_SERVICIOS.md`: análisis, modelo y decisiones de diseño.
- `docs/DOCUMENTACION_API.md`: uso detallado de cada servicio.
- `docs/openapi.yaml`: contrato OpenAPI 3.0 importable en Postman.
- `ENDPOINTS_API.txt`: inventario rápido de endpoints.

## Versionamiento

El proyecto utiliza Git. El enlace y la referencia del repositorio se encuentran en `ENLACE_REPOSITORIO.txt`.
