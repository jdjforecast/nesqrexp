# Technical Context

## Technology Stack
- **Frontend Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase
- **QR Code**: html5-qrcode
- **Type Safety**: TypeScript
- **Form Validation**: Zod

## Development Setup
1. Node.js 18+ required
2. Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   ```

## Technical Constraints
1. **Mobile First**
   - Responsive design required
   - Touch-friendly interfaces
   - Camera access for QR scanning

2. **Performance**
   - Fast page loads
   - Efficient image loading
   - Optimized QR scanning

3. **Security**
   - Secure authentication
   - Protected API routes
   - Safe file uploads

## Dependencies
```json
{
  "@clerk/nextjs": "^6.12.9",
  "@supabase/supabase-js": "^2.49.3",
  "html5-qrcode": "^2.3.8",
  "next": "14.1.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.4.1",
  "zod": "^3.22.4"
}
```

## Development Guidelines
1. **Code Organization**
   - Components in /components
   - Pages in /app/(locales)/[lang]
   - Utilities in /lib
   - Types in /types

2. **Naming Conventions**
   - Components: PascalCase
   - Files: kebab-case
   - Functions: camelCase
   - Types: PascalCase

3. **Code Quality**
   - ESLint for linting
   - TypeScript for type safety
   - Prettier for formatting 