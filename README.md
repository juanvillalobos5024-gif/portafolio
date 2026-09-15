# Portafolio Contex S.A.S

Bienvenido al repositorio oficial del portafolio digital de **Compañía Nacional de Textiles S.A.S (Contex)**. Este proyecto es una aplicación web moderna, construida con Next.js, diseñada para mostrar catálogos interactivos, gestionar contenido dinámicamente y facilitar el contacto con clientes empresariales (B2B).

## 🚀 Tecnologías Utilizadas

Este proyecto utiliza un stack moderno enfocado en rendimiento (SEO) y diseño visual premium:

*   **Framework Core:** [Next.js 14+](https://nextjs.org/) (App Router) y React.
*   **Estilos:** CSS Modules y Vanilla CSS (Enfoque en animaciones, Glassmorphism y diseño responsivo sin dependencias pesadas).
*   **Animaciones:** Framer Motion (para transiciones suaves y efectos 3D en componentes clave).
*   **Base de Datos / Estado:** [Upstash Redis](https://upstash.com/) (para almacenamiento ultra rápido del contenido JSON del panel de administración).
*   **Almacenamiento de Archivos:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (para la subida y alojamiento de imágenes del catálogo).
*   **Servicio de Correo:** `nodemailer` (integrado con el servidor SMTP corporativo para el formulario de contacto).

## 🌟 Características Principales

1.  **Catálogos Dinámicos:** Visores interactivos para la Línea Hotelera y la Línea Infantil.
2.  **Panel de Administración (`/admin`):** Una interfaz privada que permite editar en tiempo real los textos, catálogos, imágenes y metadatos (SEO) de la página sin necesidad de tocar código.
3.  **Formulario de Contacto Integrado:** Conectado directamente al servidor de correo corporativo (`mail.contexsas.com`), enviando leads directamente a los correos configurados.
4.  **Diseño Premium y Responsivo:** Optimizado para lucir impecable en computadoras de escritorio, tablets y dispositivos móviles.

## 🛠️ Instalación y Configuración Local

Si deseas correr este proyecto en tu entorno local para desarrollo, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/portafolio-contex-sas.git
cd portafolio-contex-sas
```

### 2. Instalar dependencias
Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo llamado `.env.local` en la raíz del proyecto y solicita las credenciales al administrador para llenar las siguientes variables:

```env
# Almacenamiento de Imágenes (Vercel Blob)
BLOB_READ_WRITE_TOKEN="tu_token_aqui"

# Base de datos (Upstash Redis)
REDIS_URL="tu_url_de_redis_aqui"

# Configuración de Correo Saliente (SMTP)
SMTP_HOST="mail.contexsas.com"
SMTP_PORT="587"
SMTP_USER="notificaciones@contexsas.com"
SMTP_PASS="tu_contraseña_del_correo"
SMTP_TO="auxsistemas@contexsas.com, ventas@contexsas.com" # Correos de destino (separados por coma)
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 📦 Despliegue a Producción (Build)

Para compilar el proyecto y optimizarlo para producción, ejecuta:
```bash
npm run build
```
Para iniciar el servidor de producción:
```bash
npm start
```

## 🔐 Uso del Panel de Administración
Puedes acceder al gestor de contenidos navegando a `http://localhost:3000/admin` (o tu dominio en producción `/admin`). Allí podrás:
*   Subir nuevas imágenes para los productos.
*   Modificar descripciones, características y precios/colores.
*   Cambiar textos y configurar el SEO (Keywords y metadescripciones) de la página.

---
**Nota para desarrolladores:** Todos los estilos deben mantenerse preferiblemente en archivos `.module.css` para evitar conflictos de clases globales. El uso estricto de componentes de cliente (`"use client"`) debe limitarse a los archivos que requieran interactividad o estado (`useState`, `useEffect`, Eventos).
