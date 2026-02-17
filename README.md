# EMIMET Employee Management System

A comprehensive employee management system built for construction companies specialized in wood carpentry.

## Features

- **Authentication**: Secure login with role-based access (ADMIN, MANAGER, USER)
- **Employee Management**: Full CRUD with photos, documents, sectors, and functions
- **Workday Tracking**: Assign employees to dates with salary multipliers (1x, 1.5x, 2x)
- **Salary Calculations**: Automated salary computation with advances and CSV exports
- **Dashboard Analytics**: Real-time statistics and monthly trends
- **Dark/Light Mode**: Full theme support
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/emimet_db?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Seed the database with sample data:
```bash
npm run prisma:seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- **Email**: admin@emimet.com
- **Password**: admin123

## Project Structure

```
├── app/
│   ├── (public)/          # Public routes (landing page)
│   ├── dashboard/         # Protected dashboard routes
│   ├── api/              # API routes
│   └── login/            # Authentication pages
├── components/
│   ├── ui/               # shadcn/ui components
│   └── dashboard/        # Dashboard-specific components
├── lib/
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # NextAuth configuration
│   ├── salary.ts        # Salary calculation engine
│   ├── csv.ts           # CSV export utilities
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Zod schemas
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts          # Seed data
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

## Key Features

### Employee Management
- Complete employee records with CIN, contact info, and photos
- Sector and function assignments
- Daily salary tracking
- Advance amount management
- Soft delete functionality
- Search and filtering

### Workday Tracking
- Assign employees to specific dates
- Salary multipliers:
  - 1x (Normal day)
  - 1.5x (Overtime)
  - 2x (Holiday)
- Duplicate prevention
- History tracking

### Salary Calculations
- Automated gross salary calculation
- Advance deduction
- Net salary computation
- Date range filtering
- CSV export for reports

### Role-Based Access
- **ADMIN**: Full access including user management
- **MANAGER**: Access to all employee and workday features
- **USER**: Read-only access to dashboard

## Database Schema

- **User**: Authentication and authorization
- **Sector**: Construction sectors (Wood, Aluminum, etc.)
- **Function**: Job functions (Carpenter, Installer, etc.)
- **Employee**: Employee records with all details
- **Workday**: Daily work assignments with multipliers

## License

Private - EMIMET Construction Company

## Support

For support, contact your system administrator.
