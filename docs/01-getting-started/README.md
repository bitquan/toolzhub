# Getting Started

## Quick Setup Guide

This section contains everything you need to get ToolzHub running locally.

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Firebase CLI** for emulator and deployment
- **Git** for version control
- **Stripe Account** for payment processing (optional for development)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone [repository-url]
cd toolzhub
npm install
```

> **💡 Development Note**: For running project commands, use VS Code Tasks instead of terminal:
>
> - Use **Terminal > Run Task** menu or `Cmd+Shift+P` → "Tasks: Run Task"

### 2. Environment Setup

**File Setup:**

```bash
# Copy environment template
cp .env.example .env.local
```

**Firebase Configuration:**

- Use Firebase CLI for initial setup: `firebase login` and `firebase use [your-project-id]`
- All subsequent Firebase operations should use VS Code Tasks

### 3. Start Development

**Use VS Code Tasks for development:**

- **Task: "Start Firebase Emulators"** - Starts local Firebase emulators
- **Task: "Start Development Server"** - Starts the dev server

> **💡 Task Usage**: Use `Terminal > Run Task` or `Cmd+Shift+P` → "Tasks: Run Task" instead of terminal commands

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Admin Dashboard**: http://localhost:3000/admin?dev=true

## 📚 Documentation Links

### [Installation Guide](./installation.md)

Complete step-by-step installation instructions for all platforms

### [Environment Setup](./environment-setup.md)

Detailed configuration for Firebase, Stripe, and environment variables

### [Quick Start Tutorial](./quick-start.md)

5-minute guide to get the application running

### [Legacy Setup Documentation](./legacy/)

Previous setup documentation (for reference)

## 🔧 Development Tools

### Firebase Emulators

- **Authentication**: localhost:9099
- **Firestore**: localhost:8080
- **Functions**: localhost:5001
- **Hosting**: localhost:5000

### Key Commands

Use VS Code Tasks for all development commands:

**Available Tasks** (Access via Terminal > Run Task):

- **Start Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Start Firebase Emulators**: `npm run firebase:emulators`
- **Run Tests**: `npm run test`

> **💡 Task Usage**: Use `Cmd+Shift+P` → "Tasks: Run Task" to run these commands instead of terminal

## 🎯 Next Steps

1. **For New Developers**: Follow the [Installation Guide](./installation.md)
2. **For System Understanding**: Check [Architecture Overview](../02-architecture/)
3. **For Feature Development**: Explore [User Features](../04-user-features/) or [Admin Features](../05-admin-features/)

## 🆘 Need Help?

- [Troubleshooting Guide](../09-troubleshooting/)
- [Common Issues](../09-troubleshooting/common-issues.md)
- [Development Support](../10-development/)

---

_Ready to build something amazing with ToolzHub!_ 🚀
