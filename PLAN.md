# Project Plan: Clarity - Money Management App (MVP)

## 1. Problem Statement

The user needs a simple, effective way to track personal finances, specifically to understand spending by category. Existing money management applications are often too feature-rich and lack convenient laptop accessibility. A key requirement is cross-device synchronization (laptop and phone) and a clear, aesthetically pleasing user interface. Manual data input, especially for categories and descriptions, is a point of frustration.

## 2. Solution Overview

We will build a web-based money management application named `Clarity`. It will focus on streamlined transaction input, robust category tracking, and seamless cross-device data synchronization. The application will prioritize a clean, intuitive, and good-looking user interface.

## 3. Technology Stack

- **Application Framework:** **Next.js 14** (App Router)
  - **Rationale:** Provides a powerful React framework with built-in routing and API Routes.
- **Styling:** **Tailwind CSS** + **shadcn/ui**
  - **Rationale:** Tailwind CSS offers utility-first styling. shadcn/ui provides beautiful, accessible components.
- **Backend, Database & Authentication:** **Firebase**
  - **Firebase Firestore:** Cloud-hosted, NoSQL database for real-time data synchronization
  - **Firebase Authentication:** Secure user registration, login, and session management
  - **Rationale:** Simplifies backend development while ensuring seamless cross-device synchronization
- **State Management:**
  - **Local UI State:** React's `useState` and `useReducer` hooks
  - **Server State:** TanStack Query for Firebase data fetching and caching
- **Form Handling:** **React Hook Form** with **Zod** validation
- **Date Handling:** **date-fns** for date manipulation
- **Icons:** **Lucide React** (included with shadcn/ui)

## 4. Firebase Data Schema

### Collections Structure:

```
users/{userId}
├── profile: {
│   displayName: string
│   email: string
│   createdAt: timestamp
│   settings: {
│     theme: 'light' | 'dark' | 'system'
│   }
│ }
├── categories/{categoryId}: {
│   name: string
│   type: 'income' | 'expense'
│   color: string
│   icon: string
│   createdAt: timestamp
│   isDefault: boolean
│ }
└── transactions/{transactionId}: {
│   amount: number
│   type: 'income' | 'expense'
│   categoryId: string
│   description: string
│   date: timestamp
│   createdAt: timestamp
│   updatedAt: timestamp
│ }
```

## 5. MVP Features

### 5.1 Authentication

- **Sign up/Login/Logout** with Firebase Auth
- **Theme switching** (light/dark/system)
- **Session persistence** across devices

### 5.2 Transaction Management

- **Add transactions** with form validation
- **Edit transactions** (inline or modal)
- **Delete transactions** with confirmation
- **Basic search** by description or category

### 5.3 Category Management

- **Create custom categories** with color selection
- **Edit/delete categories** (prevent deletion if in use)
- **Default categories** for common spending types

### 5.4 Dashboard

- **Current balance** calculation
- **Monthly income/expense summary**
- **Spending breakdown by category** (simple list)
- **Recent transactions** list

### 5.5 Transaction List

- **Chronological transaction list**
- **Basic filtering** by category and type
- **Simple sorting** (date, amount)

## 6. Technical Implementation

### 6.1 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── firebase/         # Firebase configuration
│   ├── utils/            # Helper functions
│   └── validations/      # Zod schemas
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

### 6.2 Security

- **User data isolation** with Firestore security rules
- **Basic input validation** and sanitization

### 6.3 Performance

- **Basic pagination** for transaction list
- **Simple caching** with TanStack Query

### 6.4 Error Handling

- **Basic error boundaries** for React errors
- **User-friendly error messages**
- **Loading states** for async operations

## 7. Development Phases

### Phase 1: Foundation (Week 1)

- [ ] Set up Next.js project with Tailwind CSS and shadcn/ui
- [ ] Configure Firebase project and authentication
- [ ] Create basic layout and navigation
- [ ] Implement user authentication flow

### Phase 2: Core Features (Week 2)

- [ ] Build transaction CRUD operations
- [ ] Implement category management
- [ ] Create basic dashboard
- [ ] Add simple search and filtering

### Phase 3: Polish & Deploy (Week 3)

- [ ] Add theme switching
- [ ] Polish UI/UX
- [ ] Basic error handling
- [ ] Deploy to Vercel

## 8. Success Criteria

- **Functional:** Users can track income/expenses with categories
- **Usable:** Clean, intuitive interface that works on mobile and desktop
- **Reliable:** Data syncs across devices without errors
- **Fast:** Page loads under 3 seconds, interactions feel responsive

## 9. Design Principles

- **Simple:** Focus on essential features only
- **Clean:** Minimal, uncluttered interface
- **Responsive:** Works well on both desktop and mobile
- **Fast:** Quick interactions and data updates
- **Reliable:** Consistent data synchronization
