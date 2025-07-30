# CityX Hospital - Sustainability Data Entry System

A comprehensive React/Next.js hybrid sustainability data-entry web application built with Hero UI (Tailwind CSS) for CityX Hospital. This system enables staff to track, manage, and analyze sustainability metrics including energy consumption, water usage, waste management, and CO₂ emissions.

## 🌟 Features

### ✅ Implemented Features

#### 1. **Authentication & Localization**

- 🔐 Login page with Hero UI components (`Form`, `Input`, `Button`)
- 🌍 Language toggle (English/Portuguese) using `Switch` component
- 🔗 "Forgot password?" functionality with email reset flow
- 👤 User role management (Admin/User permissions)

#### 2. **Data Entry & Accountability**

- 📊 Editable Hero UI `Table` with inline editing capabilities
- 🔒 Row locking mechanism with user tracking and timestamps
- 👥 Admin-only unlock functionality via dropdown actions
- 📝 Real-time data validation and error handling
- 🔍 Advanced filtering and search capabilities

#### 3. **Notifications & Due Dates**

- ⏰ Banner countdown using Hero UI `Alert` showing days until next due date
- 🚨 Overdue highlighting with color-coded alerts
- 📱 "Notify Team" button with WhatsApp integration for Mr. Silva
- 📅 Monthly report tracking and submission status

#### 4. **Support & FAQ**

- 💬 Floating Hero UI chat button labeled "Help" with AI assistant
- ❓ Comprehensive FAQ section using Hero UI `Accordion`
- 🔍 Searchable knowledge base by category
- 📞 Direct contact integration with support team

#### 5. **Analytics Dashboard**

- 📈 Real-time sustainability metrics visualization
- 🎯 Progress tracking against targets
- 📊 Category-based emissions breakdown
- 👑 Admin-only advanced metrics panel
- 📱 Mobile-responsive layout with Hero UI components

### 🚧 Placeholder Features (Ready for Implementation)

#### 6. **Onboarding & Video Tutorial**

- Structured onboarding flow framework
- Portuguese video tutorial integration points
- User guidance system architecture

#### 7. **Auto-Populate Monthly Forms**

- Mock API endpoints for email parsing
- Pre-filled form table structure
- 3-month historical data templates

#### 8. **Advanced CO₂ Calculator**

- Modal calculator interface
- Emission factor database integration
- Detailed calculation methodology

## 🏗️ Technical Architecture

### Frontend Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: Hero UI (built on Tailwind CSS)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React + Heroicons
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + Custom Hooks

### Project Structure

```
cityxhospital/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page (redirects to login)
│   ├── login/page.tsx           # Authentication page
│   ├── forgot-password/page.tsx # Password reset page
│   ├── dashboard/               # Protected dashboard section
│   │   ├── layout.tsx          # Dashboard layout with navigation
│   │   └── page.tsx            # Main dashboard page
│   ├── data-entry/page.tsx     # Sustainability data entry table
│   ├── analytics/page.tsx      # Analytics and CO₂ calculator
│   ├── settings/page.tsx       # User settings and preferences
│   └── faq/page.tsx            # FAQ and support section
├── components/                  # Reusable UI components
│   ├── ui/                     # Hero UI base components
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input component
│   │   ├── form.tsx            # Form components
│   │   ├── table.tsx           # Table components
│   │   ├── card.tsx            # Card components
│   │   ├── alert.tsx           # Alert components
│   │   ├── accordion.tsx       # Accordion components
│   │   └── ...                 # Other UI primitives
│   ├── layout/                 # Layout components
│   │   └── Navigation.tsx      # Main navigation and sidebar
│   ├── auth/                   # Authentication components
│   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   ├── providers/              # Context providers
│   │   └── AppProvider.tsx     # Application context provider
│   └── support/                # Support and help components
│       └── FloatingHelp.tsx    # Floating chat help button
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   └── useLanguage.ts          # Localization hook
├── lib/                        # Utility libraries
│   └── utils.ts                # Common utility functions
├── types/                      # TypeScript type definitions
│   └── index.ts                # Application type definitions
├── utils/                      # Utility functions and mock data
│   └── mockData.ts             # Mock data generators
└── package.json               # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cityxhospital
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- **Email**: `admin@cityx-hospital.com`
- **Password**: `password123`
- **Role**: Administrator (full access)

Alternative user:

- **Email**: `user@cityx-hospital.com`
- **Password**: `password123`
- **Role**: User (limited access)

## 🎮 Usage Guide

### Authentication

1. Start at the login page with language toggle (EN/PT)
2. Use demo credentials or create new accounts
3. Access "Forgot Password" functionality if needed

### Data Entry

1. Navigate to "Data Entry" from the sidebar
2. Select the monthly report period
3. Click on value/target cells to edit inline
4. Use lock/unlock buttons to control access
5. Filter and search through sustainability metrics

### Analytics

1. View real-time sustainability dashboard
2. Track progress against targets
3. Monitor CO₂ emissions by category
4. Access admin-only advanced metrics (if admin)

### Support

1. Click the floating help button for AI assistance
2. Browse the FAQ section for common questions
3. Use "Notify Team" for WhatsApp integration

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WHATSAPP_NUMBER=+5511999999999
NEXT_PUBLIC_APP_ENV=development
```

### Customization

- **Colors**: Modify `tailwind.config.ts` for custom color schemes
- **Languages**: Extend `hooks/useLanguage.ts` for additional languages
- **Mock Data**: Update `utils/mockData.ts` for different test scenarios

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Testing

The application includes:

- TypeScript for type safety
- ESLint for code quality
- Mock data for development and testing

## 🌐 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deployment Platforms

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Docker** containers
- **Traditional hosting** with Node.js support

## 🔮 Future Implementation

The following features have placeholder structures ready for development:

1. **Email Parsing Integration**

   - Automatic form population from hospital emails
   - Data extraction and validation pipelines

2. **Advanced Analytics**

   - Interactive charts and visualizations
   - Predictive analytics and trend forecasting
   - Export and reporting features

3. **Video Tutorial System**

   - Embedded Portuguese tutorial videos
   - Interactive onboarding flow
   - Progress tracking

4. **External Integrations**
   - Hospital management systems
   - Environmental monitoring APIs
   - Automated data collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or questions:

- Use the in-app floating help chat
- Contact Mr. Silva via WhatsApp integration
- Email: sustainability@cityx-hospital.com

---

**Built with ❤️ for CityX Hospital's sustainability initiative**
