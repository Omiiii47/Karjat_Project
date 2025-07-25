# Copilot Instructions for Villa Booking Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a mobile-first villa booking website built with Next.js, TypeScript, Tailwind CSS, MongoDB, and Stripe integration.

## Architecture Guidelines
- **Mobile-First Design**: All components should be optimized for mobile devices first
- **Modular Components**: Each component should be in its own file with single responsibility
- **Clean Pages**: Pages should import and use components, keeping logic minimal
- **TypeScript**: Use proper TypeScript types for all props and data structures

## Component Structure
- `components/` - Reusable UI components
- `lib/` - Database and external service configurations
- `utils/` - Utility functions and helpers
- `types/` - TypeScript type definitions

## Key Features
- Full-screen auto-sliding carousel on landing page
- Swipe-based villa browsing (Tinder-style)
- Stripe integration for payments
- MongoDB for data storage
- Responsive design with Tailwind CSS

## Code Style
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use consistent naming conventions
- Include proper accessibility attributes
