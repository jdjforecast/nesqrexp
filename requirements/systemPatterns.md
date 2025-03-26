# System Patterns

## Architecture Overview
- Next.js 14 App Router for routing and server components
- Clerk for authentication and user management
- Supabase for database and storage
- Tailwind CSS for styling
- shadcn/ui for component library

## Key Technical Decisions

### Authentication
- Using Clerk for secure authentication
- Email verification required
- Session management handled by Clerk

### Database Structure
```sql
users
  - id (UUID)
  - name (string)
  - company (string)
  - profile_image_url (string, nullable)
  - coins (number, default: 150)
  - created_at (timestamp)

products
  - id (UUID)
  - name (string)
  - description (string)
  - price (number)
  - image_url (string)
  - qr_code_url (string)
  - inventory (number)
  - coin_value (number)

cart_items
  - id (UUID)
  - user_id (UUID, foreign key)
  - product_id (UUID, foreign key)
  - created_at (timestamp)
```

### Component Patterns
- Client components marked with 'use client'
- Server components by default
- Shared UI components in /components
- Page components in /app/(locales)/[lang]

### State Management
- React hooks for local state
- Supabase real-time for database updates
- Clerk for auth state

### Internationalization
- Route-based i18n with [lang] parameter
- Dictionary-based translations
- Supported locales: es, en

## Design Patterns
1. **Repository Pattern**
   - Database operations abstracted in lib/supabase.ts
   - Type-safe database operations

2. **Component Composition**
   - Reusable UI components
   - Layout components for consistent structure

3. **Middleware Pattern**
   - Authentication middleware
   - Internationalization middleware

4. **Error Handling**
   - Consistent error handling in database operations
   - User-friendly error messages
   - Type-safe error handling with Zod 