# Clarity - Money Management App

A simple, effective web-based money management application built with Next.js, TypeScript, and Firebase.

## Features

- **Authentication**: Secure user registration and login with Firebase Auth
- **Transaction Management**: Add, edit, and delete transactions with categories
- **Category Management**: Create custom categories with colors and icons
- **Dashboard**: Overview of income, expenses, and balance
- **Cross-device Sync**: Real-time data synchronization across devices
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: TanStack Query, React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clarity
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase:

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. Create environment variables:
   Create a `.env.local` file in the root directory with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Emulators (Optional)

For local development without hitting Firebase limits, you can use Firebase emulators:

1. Start Firebase emulators:

```bash
npm run emulators
```

2. Or run both emulators and dev server together:

```bash
npm run dev:emulators
```

3. Access the Firebase Emulator UI at [http://localhost:4000](http://localhost:4000)

4. Export/Import emulator data (useful for testing):

```bash
# Export current emulator data
npm run emulators:export

# Import saved emulator data
npm run emulators:import
```

**Note**: The app automatically connects to emulators in development mode when they're running.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── firebase/         # Firebase configuration
│   ├── providers/        # React providers
│   ├── utils/            # Helper functions
│   └── validations/      # Zod schemas
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Firebase Security Rules

Set up Firestore security rules to ensure user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run emulators` - Start Firebase emulators
- `npm run dev:emulators` - Start both emulators and dev server
- `npm run emulators:export` - Export emulator data
- `npm run emulators:import` - Import emulator data

### Adding New Components

This project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add <component-name>
```

## Deployment

The app can be deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
