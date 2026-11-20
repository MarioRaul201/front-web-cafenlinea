# Café Express

Café Express es una página web para pedir comida en la cafetería de tu escuela **sin hacer fila**: eliges tu cafetería, ves el menú, armas tu pedido y luego pasas a recogerlo.

Este repositorio es la **parte visual** (lo que ves en el navegador). Los datos, como las escuelas, los menús y los precios, vienen de otro programa llamado **backend** (repo `Basededatosavanzadas`). La página le pide la información y el backend se la manda.

- Ver la página publicada: https://front-web-cafenlinea.onrender.com
- Backend (de donde salen los datos): https://basededatosavanzadas.onrender.com

## ¿Con qué está hecho?

- **React**: para construir la página por piezas (barra de arriba, menú lateral, tarjetas de productos…).
- **Vite**: para correr la página en tu computadora mientras programas.
- **Bootstrap**: para que se vea bien sin escribir todo el diseño desde cero.

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

> Si la primera vez tarda en salir el menú (hasta 1 minuto), es normal: el backend está en un servicio gratuito que se "duerme" cuando nadie lo usa y tarda en despertar.

## ¿Qué es el archivo `.env`?

Es un archivo donde se guardan **configuraciones**, en este caso la dirección del backend:

```
VITE_API_URL=https://basededatosavanzadas.onrender.com/
```

Así la página sabe a dónde pedir los datos. Si algún día el backend cambia de dirección, solo cambias esta línea, sin tocar el código.

- El `.env` **no se sube a GitHub**, porque en otros proyectos ahí se guardan contraseñas.
- El `.env.example` **sí se sube**. Es una copia de ejemplo para que cualquiera sepa qué poner en su propio `.env`.

## Lo que ya funciona

- Elegir tu escuela y tu cafetería.
- Ver el menú de esa cafetería, separado por categorías (cafés, postres, snacks…).
- Buscar un producto por su nombre.
- Ver qué productos están agotados.
- Agregar productos al carrito: arriba se ven cuántos llevas y cuánto vas pagando.
- La página recuerda la última cafetería que elegiste.
- Modo claro y modo oscuro.
- Si falla la conexión, aparece un aviso con un botón para volver a intentar.

## Lo que falta (en construcción)

- Abrir el carrito para ver, quitar o cambiar la cantidad de productos.
- Iniciar sesión con tu cuenta de alumno.
- Confirmar y enviar el pedido a la cafetería.
- Ver en qué estado va tu pedido (preparándose, listo para recoger…).

## ¿Dónde está cada cosa?

```
src/
├── components/   → las piezas de la página (barra de arriba, menú lateral, tarjetas, pie de página)
├── services/     → api.js: el código que le pide los datos al backend
├── utils/        → ayudas pequeñas, como poner los precios en formato $45.00
└── App.jsx       → el archivo principal que junta todas las piezas
```
