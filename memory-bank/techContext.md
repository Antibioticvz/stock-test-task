# Technical Context

## Technologies Used

### Frontend

- Next.js 15 (App Router)
- TypeScript (strict mode)
- shadcn/ui component library
- React Query for data fetching
- React Context for state management
- Recharts for data visualization
- React Hook Form for forms
- Zod for schema validation

### Backend

- NestJS
- Firebase Admin SDK
- API rate limiting
- Error tracking
- Request validation

### Authentication

- Firebase Authentication
- Email/password login
- Email verification
- Password reset
- Session management

### Database

- Firestore for user data
- Realtime Database for alert configurations
- Firebase Storage for user uploads

### Infrastructure

- Firebase Hosting
- Cloud Functions
- Firebase Emulator Suite
- GitHub Actions for CI/CD

## Development Environment

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI
- Git

### Setup Instructions

1. Clone the repository
2. Run `npm install`
3. Set up Firebase project
4. Configure environment variables
5. Run `npm run dev` for development

### Configuration

- `.env.local` for environment variables
- `firebase.json` for Firebase config
- `next.config.js` for Next.js settings
- `tsconfig.json` for TypeScript

## Technical Constraints

- API rate limits
- Firebase free tier limits
- Next.js serverless function timeout
- Client-side data fetching constraints

## Key Dependencies

- `next`: 15.x
- `firebase`: 10.x
- `react`: 19.x
- `zod`: 3.x
- `react-query`: 5.x
- `recharts`: 2.x

## Coding Standards

- TypeScript strict mode
- No `any` types
- Proper error handling
- Meaningful variable names
- Comprehensive JSDoc comments
