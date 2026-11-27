# Café Express · Panel de cafetería

Café Express permite pedir comida en la cafetería de la escuela **sin hacer fila**: el cliente pide desde la **app móvil** y pasa a recogerlo cuando está listo.

Este repositorio es el **panel web para el personal de la cafetería** (vendedores y dueños). Aquí llegan los pedidos que hacen los clientes desde la app, se preparan, se entregan y se mantiene el menú al día. Los datos (pedidos, productos, cafeterías) vienen de otro programa llamado **backend** (repo `Basededatosavanzadas`). El panel le pide la información y el backend se la manda.

- Ver la página publicada: https://front-web-cafenlinea.onrender.com
- Backend (de donde salen los datos): https://basededatosavanzadas.onrender.com

## ¿Quién puede entrar?

Solo cuentas de **vendedor** o de **dueño (jefe)** de una cafetería. Los clientes usan la app móvil; si intentan entrar aquí, el panel se los indica.

Cuentas de prueba (contraseña `demo123`):

| Rol | Correo |
|---|---|
| Dueño | `jefe@ulsa.mx` |
| Vendedor | `vendedor@ulsa.mx` |

> Ojo: estas cuentas usan la base de datos real del equipo. Lo que cambies (estados de pedidos, productos, cafeterías) también lo ve la app móvil.

## Lo que ya funciona

| Sección | Vendedor | Dueño |
|---|---|---|
| **Pedidos**: tablero Nuevos → Aceptados → En preparación → Listos, con lo que compró el cliente, sus notas, la hora de recogida y el aviso de pedidos nuevos (sonido y título de la pestaña) | ✅ | ✅ |
| **Entregar** un pedido con el código de recogida del cliente y **cancelar** con confirmación | ✅ | ✅ |
| **Historial**: pedidos por periodo y estado, ventas entregadas y la bitácora de cada pedido | ✅ | ✅ |
| **Productos**: marcar agotado / a la venta y reponer existencias | ✅ | ✅ |
| **Productos**: crear y editar platillos (precio, categoría, imagen…) | — | ✅ |
| **Cafeterías**: registrar cafeterías nuevas y cambiar entre ellas | — | ✅ |

Además: modo claro y oscuro, funciona en el celular y recuerda la sesión y la última cafetería elegida.

Las existencias **bajan solas** cuando un cliente hace un pedido y **se regresan** si el pedido se cancela.

## ¿Con qué está hecho?

- **React**: para construir la página por piezas (barra de arriba, tablero, tarjetas de pedidos…).
- **Vite**: para correr la página en tu computadora mientras programas.
- **Bootstrap**: para la base de estilos.

## Cómo correrlo en tu computadora

**Antes de empezar** necesitas tener instalado **Node.js** (versión 18 o más nueva). Lo descargas de https://nodejs.org.

Abre una terminal dentro de esta carpeta y sigue los pasos:

**1. Instala lo que necesita el proyecto** (solo la primera vez):

```bash
npm install
```

**2. Crea tu archivo `.env`** copiando la plantilla:

```bash
cp .env.example .env
```

En Windows con PowerShell: `Copy-Item .env.example .env`

**3. Enciende la página:**

```bash
npm run dev
```

**4. Ábrela en tu navegador:** http://localhost:5173

Para apagarla, en la terminal presiona `Ctrl + C`.

> Si la primera vez tarda en entrar (hasta 1 minuto), es normal: el backend está en un servicio gratuito que se "duerme" cuando nadie lo usa y tarda en despertar.

## ¿Qué es el archivo `.env`?

Es un archivo donde se guardan **configuraciones**, en este caso la dirección del backend:

```
VITE_API_URL=https://basededatosavanzadas.onrender.com/
```

Así la página sabe a dónde pedir los datos. Si algún día el backend cambia de dirección, solo cambias esta línea, sin tocar el código. Si no hay `.env`, se usa la dirección de Render.

- El `.env` **no se sube a GitHub**, porque en otros proyectos ahí se guardan contraseñas.
- El `.env.example` **sí se sube**. Es una copia de ejemplo para que cualquiera sepa qué poner en su propio `.env`.

## Cosas a tomar en cuenta

- El backend no avisa al instante cuando llega un pedido, así que el panel **pregunta cada 10 segundos** si hay pedidos nuevos.
- El pedido no trae el nombre del cliente, solo su identificador; el panel muestra los últimos caracteres.

## ¿Dónde está cada cosa?

```
src/
├── App.jsx            → el archivo principal: sesión, cafetería elegida y secciones
├── services/api.js    → el código que le pide y le manda datos al backend
├── hooks/             → useColaPedidos: revisa la cola cada 10 s y detecta pedidos nuevos
├── components/
│   ├── Login, Topbar, Modal, Icons
│   ├── pedidos/       → tablero, tarjeta y detalle de pedido, botones de estado, historial
│   ├── productos/     → lista de productos y formulario para crear/editar
│   └── cafeterias/    → lista de cafeterías y registro de una nueva
└── utils/             → ayudas pequeñas: precios ($45.00), horas y nombres de estados
```
