# Project overview
Use this guide to build a QR Shop web app where users can register, scan QR codes to select products, 
and admins can manage users and generate reports, hosted on free platforms. all in spanish

# Feature requirements
- We will use Next.js, Tailwind CSS, shadcn/ui, Supabase, Clerk.
- Create a mobile-optimized registration form where users input name and company
- Implement QR scanner that directly interacts with the app when codes are scanned(adds to cart, affects coins,updates inventory)
- Allow users to add products to cart (limited to one product per user)
- Have a nice UI & animation when scanning QR or adding products
- Display selected products in cart with confirmation flow
- Admin panel to upload products, manage users, and export reports
- When admin uploads product images, generate QR codes for physical printing
- Export CSV reports with user selections for physical product delivery
-Responsive design that works with all kind of devices but focused on mobile

# Relevant docs
- Supabase database and storage documentation
- Clerk authentication documentation
- Next.js 14 documentation for app router
- shadcn/ui component library reference
- QR code generation and scanning libraries
- Tailwind CSS utility classes

# Current File structure
```
nestleqrexp/
├── .next
├── app
│   ├── fonts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
├── hooks
├── lib
├── node_modules
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── requirements
│   └── requirements.txt
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
├── .gitattributes
└── .gitignore
```
#rules 
- All New compontens should go  in /components and be named like example-component.tsx unless otherwise specified.
-ALL new pages go in /app
