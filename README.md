# PortflectionV2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A comprehensive, responsive portfolio builder SaaS platform that enables professionals to create and customize stunning portfolio websites with ease. Built with Next.js, React, and TypeScript, featuring a modern drag-and-drop interface, real-time preview, and extensive customization options.

## ✨ Features

- 🎨 **Responsive Portfolio Builder**: Drag-and-drop interface that works on desktop, tablet, and mobile
- 📱 **Multi-Device Preview**: Real-time preview across different screen sizes
- 🎯 **Advanced Theme System**: Modular themes with extensive customization options
- 📝 **Comprehensive Forms**: Intuitive forms for profile, skills, projects, experience, and education
- 🗃️ **Complete Database Integration**: Full CRUD operations for all portfolio data
- 📊 **Modern Dashboard**: SaaS-style interface with analytics and portfolio management
- 🌓 Dark/Light mode with system preference detection
- 📱 Fully responsive design for all devices
- ⚡ Fast page loads with Server-Side Rendering (SSR) and Static Site Generation (SSG)
- 🔒 Secure authentication with NextAuth (Email/Password + OAuth providers)
- 🎨 Real-time customization with live preview
- 📊 Built-in analytics integration
- 🔍 SEO optimized with sitemap and robots.txt
- 🔄 Undo/Redo functionality
- 📤 Easy sharing and publishing

## 🚀 Tech Stack

- **Frontend**: Next.js 13+, React 18+, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Forms**: React Hook Form, Zod validation, @dnd-kit for drag-and-drop
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Prisma ORM
- **Email**: SendGrid
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## 🏗️ Architecture Overview

### **Responsive Portfolio Builder**
- **Three-Panel Layout**: Builder sidebar, live preview, customization panel
- **Drag-and-Drop Sections**: Intuitive section management with visual feedback
- **Real-Time Preview**: Instant updates across desktop, tablet, and mobile views
- **Theme System**: Modular themes with colors, typography, spacing, and effects

### **Database Schema**
```
User (authentication and profile)
├── Portfolio (main portfolio data)
│   ├── Projects (portfolio projects)
│   ├── Experience (work history)
│   ├── Skills (technical and soft skills)
│   ├── Education (academic background)
│   └── PortfolioView (analytics data)
└── Template (reusable portfolio templates)
```

### **API Endpoints**
- `/api/portfolio` - Portfolio CRUD operations
- `/api/projects` - Project management
- `/api/skills` - Skills management
- `/api/experience` - Experience management
- `/api/education` - Education management
- `/api/templates` - Template management
- `/api/analytics` - Portfolio analytics

## 🛠️ Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- SendGrid account (for email verification)
- GitHub OAuth app (optional, for GitHub login)
- Google Cloud Project (optional, for Google login)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PortflectionV2.git
   cd PortflectionV2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/portflection?retryWrites=true&w=majority"
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Email Provider (SendGrid)
   EMAIL_SERVER=smtp://username:password@smtp.sendgrid.net:587
   EMAIL_FROM=your-email@example.com
   
   # OAuth Providers (optional)
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🎯 Key Features Usage

### **Portfolio Builder**
1. Navigate to `/dashboard/builder`
2. Choose from available themes
3. Drag and drop sections to customize layout
4. Use real-time preview to see changes
5. Customize colors, typography, and spacing
6. Save and publish your portfolio

### **Information Management**
1. Go to `/dashboard/information`
2. Fill out profile information
3. Add skills with proficiency levels
4. Create project entries with details
5. Add work experience and education
6. All data is automatically saved and synced

### **Dashboard Overview**
1. View all portfolios at `/dashboard`
2. Track analytics and performance
3. Manage multiple portfolios
4. Use templates for quick setup
5. Share and publish portfolios

## 📦 Project Structure

```
/src
├── app/                    # App router
│   ├── api/                # API routes
│   │   ├── portfolio/      # Portfolio management
│   │   ├── projects/       # Project management
│   │   ├── skills/         # Skills management
│   │   └── templates/      # Template management
│   ├── dashboard/          # Authenticated user dashboard
│   │   ├── builder/        # Portfolio builder interface
│   │   ├── information/    # Information forms
│   │   └── analytics/      # Analytics dashboard
│   ├── (auth)/             # Authentication pages
│   └── ...
├── components/            # Reusable components
│   ├── ui/                 # Shadcn UI components
│   ├── portfolio-builder/  # Portfolio builder components
│   ├── forms/              # Form components
│   └── dashboard/          # Dashboard components
├── types/                 # TypeScript type definitions
├── styles/                # CSS and styling files
│   └── ...
├── lib/                   # Utility functions and configs
```

## 🎨 Responsive Design

The application is built with a mobile-first approach:

- **Mobile (< 768px)**: Single-column layout, touch-optimized controls
- **Tablet (768px - 1024px)**: Adaptive layout with collapsible panels
- **Desktop (> 1024px)**: Full three-panel interface with advanced features

### **Breakpoint Strategy**
```css
/* Mobile-first approach */
.portfolio-builder {
  flex-direction: column; /* Default mobile layout */
}

@media (min-width: 768px) {
  /* Tablet adjustments */
}

@media (min-width: 1024px) {
  .portfolio-builder {
    flex-direction: row; /* Desktop side-by-side layout */
  }
}
```

## 🔧 API Documentation

### **Portfolio Management**
```typescript
// Create portfolio
POST /api/portfolio
{
  "name": "My Portfolio",
  "title": "Full Stack Developer",
  "email": "user@example.com",
  "theme": { ... },
  "socials": { ... }
}

// Update portfolio
PUT /api/portfolio
{
  "id": "portfolio_id",
  "name": "Updated Name",
  ...
}

// Get portfolios
GET /api/portfolio?id=portfolio_id
```

### **Project Management**
```typescript
// Create project
POST /api/projects
{
  "title": "My Project",
  "description": "Project description",
  "technologies": ["React", "TypeScript"],
  "liveUrl": "https://project.com",
  "githubUrl": "https://github.com/user/project"
}
```


## 🚀 Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to a GitHub repository
2. Import the repository on Vercel
3. Add your environment variables
4. Deploy!

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [DnD Kit](https://dndkit.com/)
- [React Hook Form](https://react-hook-form.com/)

## 📬 Contact

For any questions or feedback, please open an issue or contact the maintainers.
