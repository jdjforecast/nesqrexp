# Nestlé QR Experience

Una aplicación web móvil para escanear códigos QR de productos Nestlé, acumular coins y obtener recompensas exclusivas.

## Características principales

- Registro de usuarios con nombre y empresa
- Escaneo de códigos QR para añadir productos al carrito
- Sistema de coins para recompensas
- Carrito de compras con límite de un producto por usuario
- Panel de administración para gestionar productos y usuarios
- Exportación de informes en formato CSV

## Tecnologías utilizadas

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Clerk
- **Alojamiento**: Vercel/Netlify

## Configuración del proyecto

### Requisitos previos

- Node.js 18 o superior
- Cuenta en Supabase
- Cuenta en Clerk

### Instalación

1. Clona el repositorio
```bash
git clone https://github.com/tu-usuario/nestle-qr-experience.git
cd nestle-qr-experience
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave_publica_de_clerk
CLERK_SECRET_KEY=tu_clave_secreta_de_clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_de_supabase

# General Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Inicia el servidor de desarrollo
```bash
npm run dev
```

5. Abre http://localhost:3000 en tu navegador

## Estructura de la base de datos

### Tablas principales

- **users**: Información de usuarios
- **products**: Productos disponibles
- **cart_items**: Elementos en el carrito de cada usuario

### Configuración de Supabase

Para configurar las tablas en Supabase:

1. Crea la tabla `users`:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  profile_image_url TEXT,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

2. Crea la tabla `products`:
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  qr_code_url TEXT,
  inventory INTEGER DEFAULT 0,
  coin_value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

3. Crea la tabla `cart_items`:
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
