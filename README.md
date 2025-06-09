# Equipment Rental System (Gear Pool)

A comprehensive, mobile-first equipment rental and checkout system designed for educational institutions, starting with film/cinema departments. Built with React, TypeScript, and modern web technologies.

## 🎯 Project Overview

The Equipment Rental System is a production-ready web application that revolutionizes how educational institutions manage their equipment resources. It provides an intuitive, mobile-first platform that eliminates scheduling conflicts, improves equipment utilization, and enhances the learning experience for students and faculty.

### Key Features

- **Multi-tenant architecture** with department-level isolation
- **Role-based access control** (Student, Faculty, Manager, Admin)
- **Real-time equipment availability** with conflict detection
- **Mobile-first responsive design** with PWA capabilities
- **Calendar-based booking interface** with drag-and-drop
- **Comprehensive audit logging** and analytics
- **Email notification system** with automated reminders
- **Barcode/QR code support** for equipment identification

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Docker 24.0.0 or higher (for development services)

### Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/gear-pool.git
cd gear-pool
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment:**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

4. **Start development server:**
```bash
npm run dev
```

5. **Open in browser:**
```
http://localhost:5173
```

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast build tooling and hot reload
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible UI components
- **React Router v6** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation

### Backend (Planned)
- **Node.js 18** with Express framework
- **PostgreSQL 15** with Prisma ORM
- **Redis** for caching and session management
- **JWT** authentication with refresh tokens
- **Nodemailer** for email notifications
- **Multer** for file uploads

### DevOps & Tools
- **Docker** containerization
- **GitHub Actions** for CI/CD
- **ESLint & Prettier** for code quality
- **Vitest** for unit testing
- **Playwright** for E2E testing

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Project Overview](docs/PROJECT_OVERVIEW.md)** - Detailed project description and goals
- **[Development Guide](docs/DEVELOPMENT.md)** - Complete development setup and workflow
- **[API Documentation](docs/API.md)** - RESTful API specification and examples
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Multi-tenant database design
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Security](docs/SECURITY.md)** - Security implementation and best practices
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment with Docker
- **[Configuration](docs/CONFIGURATION.md)** - Environment variables and settings
- **[Testing Strategy](docs/TESTING.md)** - Comprehensive testing approach
- **[User Guide](docs/USER_GUIDE.md)** - End-user documentation

## 🎨 UI Components

The system uses shadcn/ui components for a consistent, accessible design:

- Modern component library with Radix UI primitives
- Fully customizable with CSS variables
- Dark/light theme support
- Mobile-optimized touch interactions
- ARIA-compliant accessibility features

## 🔐 Security Features

- **Multi-tenant data isolation** with row-level security
- **JWT-based authentication** with automatic refresh
- **Role-based permissions** for granular access control
- **Input validation** and sanitization
- **Rate limiting** and DDoS protection
- **Comprehensive audit logging**
- **GDPR/CCPA compliance** features

## 📱 Mobile-First Design

- **Progressive Web App (PWA)** capabilities
- **Responsive design** optimized for all screen sizes
- **Touch-friendly interface** with swipe gestures
- **Offline browsing** of equipment catalog
- **Camera integration** for barcode scanning (planned)
- **Push notifications** for reservation updates

## 🧪 Testing

Comprehensive testing strategy with multiple levels:

- **Unit Tests** - Component and service testing with Vitest
- **Integration Tests** - API and database integration testing
- **E2E Tests** - Full user workflow testing with Playwright
- **Performance Tests** - Load testing with Artillery
- **Security Tests** - Automated security scanning

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d
npm run dev
```

### Production
```bash
# Build and deploy
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- Follow TypeScript strict mode
- Write tests for new features
- Use conventional commit messages
- Ensure accessibility compliance
- Mobile-first responsive design

## 📈 Project Status

- ✅ **Phase 1**: Frontend foundation and UI components
- 🚧 **Phase 2**: Backend API development (In Progress)
- 🔄 **Phase 3**: Authentication and user management
- 📋 **Phase 4**: Equipment and reservation system
- 🔔 **Phase 5**: Notification and email system
- 📊 **Phase 6**: Analytics and reporting
- 🚀 **Phase 7**: Production deployment

## 🎯 Use Cases

### Educational Institutions
- Film/Cinema departments
- Photography programs
- Art and design schools
- Engineering labs
- Science departments

### Equipment Types
- Cameras and lenses
- Audio recording equipment
- Lighting systems
- Computer hardware
- Laboratory instruments
- Art supplies and tools

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS 13+, Android 8+)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, email support@gear-pool.com or join our [Discord community](https://discord.gg/gear-pool).

## 🚀 Future Enhancements

- **Mobile Apps** - Native iOS and Android applications
- **Advanced Analytics** - Equipment utilization dashboards
- **AI Recommendations** - Smart equipment suggestions
- **Integration APIs** - Connect with existing systems
- **Multi-language** - International localization
- **WhatsApp/SMS** - Additional notification channels

---

<div align="center">
  <strong>Built with ❤️ for educational institutions worldwide</strong>
</div>
