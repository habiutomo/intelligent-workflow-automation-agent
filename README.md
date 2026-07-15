# Intelligent Workflow Automation Agent

A production-ready workflow automation platform with visual editor, AI-powered steps, and multi-trigger support.

## Features

- **Visual Workflow Editor** - Drag & drop interface built with React Flow
- **Multiple Node Types** - AI Step, HTTP Request, Code, Condition, Delay, Email, and more
- **Multi-Trigger Support** - Manual, Schedule (Cron), Webhook, and Event-based triggers
- **Real-time Execution** - Live updates via WebSocket during workflow execution
- **AI Integration** - OpenAI/Anthropic support for intelligent workflow steps
- **Audit Logging** - Complete execution history and audit trail

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- Prisma ORM (SQLite)
- Socket.IO
- BullMQ (optional, for job queues)

**Frontend:**
- React 18 + TypeScript
- Vite
- React Flow
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/habiutomo/intelligent-workflow-automation-agent.git
cd intelligent-workflow-automation-agent

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, optional: OPENAI_API_KEY, etc.
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Development

```bash
# Run backend (Terminal 1)
npm run dev

# Run frontend (Terminal 2)
npm run client:dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

### Production Build

```bash
# Build backend
npm run build

# Build frontend
npm run client:build

# Start production server
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/workflows` | List all workflows |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows/:id` | Get workflow |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| POST | `/api/workflows/:id/run` | Execute workflow |
| GET | `/api/workflows/:id/runs` | Get workflow runs |
| POST | `/api/webhooks/:workflowId` | Webhook trigger |
| GET | `/api/schedules` | List schedules |
| GET | `/api/events` | List events |

## Node Types

| Node | Description |
|------|-------------|
| `start` | Entry point of workflow |
| `end` | Exit point of workflow |
| `aiStep` | AI-powered processing (OpenAI/Anthropic) |
| `httpRequest` | Make HTTP API calls |
| `code` | Execute custom JavaScript/Python |
| `condition` | Conditional branching |
| `delay` | Wait for specified duration |
| `transform` | Data transformation |
| `email` | Send emails |
| `notification` | Send notifications |
| `parallel` | Execute multiple branches |
| `merge` | Merge parallel branches |
| `webhook` | External webhook trigger |

## Deployment

### GitHub Pages (Frontend Only)

The frontend is automatically deployed to GitHub Pages on push to `main`:

```
https://habiutomo.github.io/intelligent-workflow-automation-agent/
```

### Full Stack Deployment

For full functionality, deploy backend separately:

- **Vercel** - Serverless functions
- **Railway** - Full-stack hosting
- **Render** - Free tier available
- **DigitalOcean App Platform**

## License

MIT
