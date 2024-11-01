# Seeker - Library Management System

## Technologies Used

-   [Next.js](https://nextjs.org) - React framework for building web applications
-   [Clerk](https://clerk.com) - Authentication and user management
-   [Prisma](https://prisma.io) - ORM for database management
-   [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
-   [tRPC](https://trpc.io) - End-to-end typesafe APIs
-   [Recharts](https://recharts.org) - Charting library for React
-   [Shadcn](https://ui.shadcn.com) - UI components

## Features

-   Dashboard with analytics and charts
-   Book management (list, add, import)
-   Member management
-   Transaction tracking
-   Dark mode support
-   Responsive design

## Getting Started

1. Clone the repository
2. Install dependencies:
    ```
    npm install
    ```
3. Set up your environment variables (see `.env.example`)
4. Initialize the database:
    ```
    npm run db:push
    ```
5. Run the development server:
    ```
    npm run dev
    ```

## Project Structure

-   `src/app`: Next.js app router pages and layouts
-   `src/components`: Reusable React components
-   `src/styles`: Global styles and Tailwind CSS configuration
-   `src/lib`: Utility functions and shared logic
-   `src/server`: Server-side code, including tRPC routers
-   `prisma`: Database schema and migrations
