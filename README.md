# 🚀 Hackathon Project - Guía de Despliegue en Vercel

Este proyecto es una aplicación desarrollada con **Next.js 16**, **React 19**, **Supabase** y **Vercel AI SDK**. 
A continuación, encontrarás todas las instrucciones necesarias para configurar las variables de entorno y desplegar el proyecto correctamente en **Vercel**.

---

## 🛠️ Requisitos Previos

Antes de desplegar, asegúrate de tener cuentas activas en las siguientes plataformas:
1. [GitHub](https://github.com/), [GitLab](https://gitlab.com/) o [Bitbucket](https://bitbucket.org/) (para alojar el código).
2. [Vercel](https://vercel.com/) (para el despliegue).
3. [Supabase](https://supabase.com/) (Base de datos y autenticación).
4. [OpenAI](https://platform.openai.com/) (Clave API para la inteligencia artificial y transcripciones).

---

## 🔐 Variables de Entorno

El proyecto requiere ciertas credenciales para funcionar correctamente. En Vercel, deberás configurar estas variables de entorno en los ajustes de tu proyecto (`Settings > Environment Variables`).

### Lista de Variables Requeridas:

| Variable | Descripción | Dónde conseguirla |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | Clave API secreta de OpenAI. | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `OPENAI_MODEL` | *(Opcional)* Modelo de OpenAI a utilizar (por defecto usa `gpt-4o`). | Ej: `gpt-4o`, `gpt-4-turbo` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la API de tu proyecto en Supabase. | `Project Settings > API` en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (Anon) de Supabase para el cliente web. | `Project Settings > API` en Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase (Privada) usada en el servidor para saltar RLS si es necesario. | `Project Settings > API` en Supabase (Sección *service_role* secret) |

> ⚠️ **IMPORTANTE:** Nunca expongas tu `OPENAI_API_KEY` o tu `SUPABASE_SERVICE_ROLE_KEY` en el cliente. Asegúrate de que las variables de Supabase para el cliente comiencen con `NEXT_PUBLIC_`.

---

## 🚀 Flujo de Despliegue Paso a Paso en Vercel

Sigue estos pasos para desplegar la aplicación desde cero:

### Paso 1: Sube el código a un repositorio
1. Si aún no lo has hecho, sube el código fuente a tu cuenta de GitHub/GitLab/Bitbucket.
   ```bash
   git init
   git add .
   git commit -m "Commit inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

### Paso 2: Importar el proyecto a Vercel
1. Inicia sesión en [Vercel](https://vercel.com/login).
2. Haz clic en el botón negro **"Add New..."** y selecciona **"Project"**.
3. Busca el repositorio donde subiste el proyecto y haz clic en **"Import"**.

### Paso 3: Configurar el despliegue
1. **Framework Preset:** Vercel detectará automáticamente que es un proyecto de **Next.js**. Déjalo así.
2. **Root Directory:** Si el proyecto está en la raíz del repositorio, déjalo como está (`./`).
3. **Build and Output Settings:** Puedes dejar las opciones por defecto que detecta Vercel (`npm run build`, etc).

### Paso 4: Añadir las Variables de Entorno (¡Crucial!)
Abre la sección desplegable **"Environment Variables"** antes de hacer clic en Deploy.
Añade una por una las variables mencionadas anteriormente:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (Si deseas sobrescribir el modelo por defecto)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Paso 5: Desplegar
1. Una vez agregadas todas las variables, haz clic en el botón azul **"Deploy"**.
2. Vercel comenzará a construir y desplegar tu aplicación. Este proceso tomará un par de minutos.
3. ¡Listo! Cuando termine, Vercel te proporcionará la URL pública de tu aplicación en funcionamiento.

---

## 💻 Desarrollo Local

Si deseas correr este proyecto de manera local, crea un archivo `.env.local` en la raíz del proyecto y añade tus variables:

```env
OPENAI_API_KEY="sk-tu-clave-aqui"
OPENAI_MODEL="gpt-4o"

NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-aqui"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
```

Luego, instala las dependencias e inicia el servidor de desarrollo:

```bash
# Instalar dependencias
npm install
# o con pnpm
pnpm install

# Iniciar servidor
npm run dev
# o con pnpm
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

---

## 🏗️ Stack Tecnológico
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Base de Datos & Auth:** Supabase (SSR)
- **IA:** Vercel AI SDK, OpenAI
