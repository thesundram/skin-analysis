# SkinAI - Advanced Dermatological Skin Health & Analysis Portal

AI-powered facial skin analysis, personalized skincare recommendations, and progress tracking portal.

## Overview

**SkinAI** is a modern, high-performance web application designed for comprehensive dermatological skin health screening. Built with Next.js 16, Vercel AI SDK, and MongoDB Atlas, it evaluates facial skin scans across 8+ clinical metrics—including acne, pigmentation, fine lines & wrinkles, oiliness, redness, hydration, enlarged pores, and overall skin texture. 

The platform features an intelligent dual-model AI cascade (Anthropic Claude Sonnet & OpenAI GPT-4o), anatomical facial visualization, secure Edge-safe authentication, and full historical tracking with comparison analytics.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Official MongoDB driver with global connection pooling)
- **AI Vision Engine**: [Vercel AI SDK](https://sdk.vercel.ai/) with multi-model cascade
  - **Primary**: `anthropic/claude-sonnet-4.6`
  - **Fallback**: `openai/gpt-4o-mini`
- **Authentication**: Edge-safe Web Crypto HMAC-SHA256 session tokens with bcrypt-hashed credentials
- **Styling**: Tailwind CSS & Modern UI Tokens
- **Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Data Visualization**: [Recharts](https://recharts.org/) (Metric trends & comparison charts)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm (Recommended package manager)

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# AI Vision Gateway
AI_GATEWAY_API_KEY="your-vercel-ai-gateway-key"
AI_MODEL="anthropic/claude-sonnet-4.6"
AI_FALLBACK_MODEL="openai/gpt-4o-mini"

# Database (MongoDB Atlas)
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0"
MONGODB_DB="skin-analysis"

# Edge Authentication Secret
AUTH_SECRET="your-secure-random-secret"
```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

- **8+ Clinical Skin Metrics**: Detailed 0–100 evaluations for acne, pigmentation, wrinkles, oiliness, redness, hydration, pores, and texture with an overall weighted health score.
- **Dual-Model AI Fallback Cascade**: Prioritizes `anthropic/claude-sonnet-4.6` for clinical-grade diagnostic nuance, automatically cascading to `openai/gpt-4o-mini` if quota or tier limits arise.
- **Real-Time Glasses Detection**: Heuristic image detection that reminds users to remove eyewear for optimal eye-contour analysis.
- **Anatomical Visualization**: Interactive facial annotation viewer mapping wrinkle vectors and pore clusters.
- **Personalized Skincare Guidance**: Generates region-specific routine advice and recommended active ingredients.
- **Historical Tracking & Comparison**: Interactive Recharts timeline, trend comparisons between consecutive scans, with one-click record deletion and history reset.
- **Edge-Safe Authentication**: Next.js middleware protection for private dashboards utilizing pure Web Crypto primitives.
- **Company Branding & Logo**: Tailored with official company branding, custom transparent logo, and unified responsive navigation.

## Project Structure

- `app/`: Next.js App Router endpoints, pages, and layouts.
  - `app/api/analyze-skin/`: Multi-model AI vision diagnostic endpoint with automatic fallback.
  - `app/api/auth/`: Signup, login, logout, and current user validation routes.
  - `app/api/save-analysis/`: MongoDB Atlas persistence for scans and daily locks.
  - `app/api/analysis/delete/`: Record deletion and complete history clear API.
  - `app/dashboard/`: Authenticated user dashboard and analysis hub.
  - `app/analysis-visualization/`: Dedicated anatomical facial annotation viewer.
- `components/skin-analysis/`: Core application components (Header, Footer, SkinAnalyzer, History, ImageCapture).
- `components/ui/`: Radix-based UI components (Buttons, Cards, Dialogs, Dropdowns, Tabs, Tables).
- `lib/mongodb.ts`: MongoDB Atlas connection pool and collection index management.
- `lib/auth.ts`: Node-side authentication helpers and user lookup.
- `lib/token.ts`: Edge-safe HMAC-SHA256 session token verification for middleware.
- `public/`: Brand assets, transparent company logos, and web application icons.

## 👨‍💻 Author & Support

Designed & Developed by **Sundram Pandey**  
**Uttam Galva Innovative Solutions Pvt. Ltd.**

For support, inquiries, or customized features, please contact Uttam Galva Innovative Solutions Pvt. Ltd.

---
*Version: 1.0.0 | Last Updated: October 2026*
