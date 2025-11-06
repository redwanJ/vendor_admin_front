# Vendor Portal - Menal Hub

A modern, production-ready Next.js vendor dashboard built with the latest best practices and technologies. This portal allows vendors to manage their products, orders, inventory, and sales.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit (RTK)
- **Form Handling**: Formik
- **Validation**: Zod
- **Internationalization**: next-intl (English & Amharic)
- **Icons**: Lucide React
- **Theme**: next-themes (Dark mode support)
- **Code Quality**: ESLint + Prettier

## Features

- ✅ Modern Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ **Internationalization (i18n)** with next-intl (English & Amharic)
- ✅ **Language switcher** component
- ✅ Redux Toolkit for state management
- ✅ Formik + Zod for forms and validation
- ✅ shadcn/ui components (customizable)
- ✅ Dark mode support
- ✅ Responsive vendor dashboard layout with sidebar
- ✅ Authentication setup with hooks
- ✅ API service layer
- ✅ Best practice folder structure
- ✅ Reusable components
- ✅ ESLint + Prettier configured
- ✅ TypeScript strict mode

## Project Structure

```
vendor_admin_front/
├── locales/                   # Translation files
│   ├── en/                    # English translations
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── dashboard.json
│   └── am/                    # Amharic translations
│       ├── common.json
│       ├── auth.json
│       └── dashboard.json
├── src/
│   ├── i18n.ts                # i18n configuration
│   ├── proxy.ts               # Next.js proxy (locale routing)
│   ├── app/
│   │   ├── [locale]/          # Locale-based routing
│   │   │   ├── layout.tsx     # Locale layout
│   │   │   └── page.tsx       # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── forms/             # Form components (Formik)
│   │   ├── layout/            # Layout components (Header, Sidebar)
│   │   ├── common/            # Common shared components (LanguageSwitcher)
│   │   └── providers/         # React providers (Redux, Theme, i18n)
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts           # Common utilities (cn)
│   │   ├── env.ts             # Environment config
│   │   └── formik-zod-adapter.ts  # Formik + Zod integration
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.ts         # Authentication hook
│   ├── store/                 # Redux Toolkit store
│   │   ├── store.ts           # Store configuration
│   │   ├── hooks.ts           # Typed hooks
│   │   └── slices/            # Redux slices
│   │       └── authSlice.ts   # Auth slice
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Common types
│   ├── validations/           # Zod schemas
│   │   ├── auth.schema.ts     # Auth validation
│   │   └── common.schema.ts   # Common validators
│   ├── services/              # API services
│   │   ├── api.service.ts     # Base API service
│   │   └── auth.service.ts    # Auth service
│   ├── constants/             # Constants and enums
│   │   └── index.ts
│   └── styles/                # Additional styles
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── components.json           # shadcn/ui config
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
└── package.json             # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Usage Examples

### Creating a New Page

1. Create a new folder in `src/app/[locale]/`
2. Add a `page.tsx` file:

```tsx
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations();
  return <div>{t('myPageTitle')}</div>;
}
```

### Internationalization (i18n)

The app supports English (en) and Amharic (am) out of the box using next-intl.

#### Using Translations in Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common'); // Use a namespace
  return <h1>{t('app.name')}</h1>;
}
```

#### Adding New Translations

1. Add translations to `locales/en/[category].json`:

```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

2. Add Amharic translations to `locales/am/[category].json`:

```json
{
  "myFeature": {
    "title": "የኔ ባህሪ",
    "description": "የባህሪ መግለጫ"
  }
}
```

3. Import in `src/i18n.ts`:

```typescript
return {
  locale,
  messages: {
    ...(await import(`../locales/${locale}/common.json`)).default,
    auth: (await import(`../locales/${locale}/auth.json`)).default,
    myFeature: (await import(`../locales/${locale}/my-feature.json`)).default,
  },
};
```

#### Language Switcher

The `LanguageSwitcher` component is already integrated in the Header. Users can switch between English and Amharic.

#### Adding More Languages

1. Add locale to `src/i18n.ts`:

```typescript
export const locales = ['en', 'am', 'fr'] as const; // Add 'fr'
export const localeNames: Record<Locale, string> = {
  en: 'English',
  am: 'አማርኛ',
  fr: 'Français', // Add French
};
```

2. Create `locales/fr/` folder with translation files
3. Update proxy matcher in `src/proxy.ts`

### Using Forms with Formik + Zod

1. Create a Zod schema in `src/validations/`:

```tsx
import { z } from 'zod';

export const mySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type MyFormData = z.infer<typeof mySchema>;
```

2. Use in a form:

```tsx
import { Formik, Form } from 'formik';
import { toFormikValidationSchema } from '@/lib/formik-zod-adapter';
import { FormField } from '@/components/forms/FormField';

export function MyForm() {
  return (
    <Formik
      initialValues={{ name: '' }}
      validate={toFormikValidationSchema(mySchema)}
      onSubmit={async (values) => {
        // Handle submit
      }}
    >
      <Form>
        <FormField name="name" label="Name" />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
}
```

### Adding shadcn/ui Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

### Using Redux Store

1. Create a new slice in `src/store/slices/`
2. Add it to the store in `src/store/store.ts`
3. Use typed hooks:

```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Use dispatch and selector
}
```

### API Service

Use the API service for HTTP requests:

```tsx
import { apiService } from '@/services/api.service';

// GET request
const response = await apiService.get('/users');

// POST request
const response = await apiService.post('/users', { name: 'John' });
```

## Styling

- Uses Tailwind CSS with CSS variables for theming
- Supports dark mode out of the box
- shadcn/ui components are customizable via `tailwind.config.ts`

## Authentication

The project includes a complete authentication setup:

- Auth service (`src/services/auth.service.ts`)
- Auth Redux slice (`src/store/slices/authSlice.ts`)
- Auth hook (`src/hooks/useAuth.ts`)
- Login form example (`src/components/forms/LoginForm.tsx`)

## Best Practices

- ✅ Use typed Redux hooks instead of plain hooks
- ✅ Define Zod schemas for all forms
- ✅ Use the API service layer for all HTTP requests
- ✅ Keep components small and focused
- ✅ Use TypeScript strict mode
- ✅ Follow the established folder structure
- ✅ Use constants instead of magic strings/numbers
- ✅ Validate all user inputs
- ✅ Handle errors gracefully

## About This Project

This vendor portal was created by copying and customizing the `admin_front` starter template. It includes:

- Vendor-specific navigation (Orders, Products, Inventory, Sales)
- Customized branding for vendors
- Runs on port 3002 (to avoid conflicts with admin_front)
- Full internationalization support (English & Amharic)

## Contributing

1. Follow the code style (enforced by ESLint/Prettier)
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation when needed

## License

[Your License Here]
