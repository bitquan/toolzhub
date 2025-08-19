# VS Code Tasks Reference

## Overview

All development commands in ToolzHub must be run as VS Code Tasks instead of direct terminal commands. This ensures consistency, proper environment handling, and integrated development experience.

## 🎯 Core Development Tasks

### Development Server Tasks

**Start Development Server**

- **Command**: `npm run dev`
- **Type**: Background task
- **Usage**: Main development server for frontend
- **Access**: `Terminal > Run Task` → "Start Development Server"

**Start Firebase Emulators**

- **Command**: `npm run firebase:emulators`
- **Type**: Background task
- **Usage**: Local Firebase services for development
- **Access**: `Terminal > Run Task` → "Start Firebase Emulators"

### Build Tasks

**Build for Production**

- **Command**: `npm run build`
- **Type**: Build task
- **Usage**: Creates production-optimized build
- **Access**: `Terminal > Run Task` → "Build for Production"

**TypeScript Check**

- **Command**: `npx tsc --noEmit`
- **Type**: Build task
- **Usage**: Type checking without file output
- **Access**: `Terminal > Run Task` → "TypeScript Check"

**Clean Build**

- **Command**: `rm -rf dist && npm run build`
- **Type**: Build task
- **Usage**: Clean build directory and rebuild
- **Access**: `Terminal > Run Task` → "Clean Build"

### Testing Tasks

**Run Tests**

- **Command**: `npm run test`
- **Type**: Test task
- **Usage**: Execute test suite
- **Access**: `Terminal > Run Task` → "Run Tests"

**Run Tests Watch**

- **Command**: `npm run test:watch`
- **Type**: Background task
- **Usage**: Continuous testing during development
- **Access**: `Terminal > Run Task` → "Run Tests Watch"

## 🚀 Deployment Tasks

### Firebase Deployment

**Deploy All Services**

- **Command**: `firebase deploy --only hosting,functions,firestore:rules`
- **Type**: Deployment task
- **Usage**: Complete deployment to Firebase
- **Access**: `Terminal > Run Task` → "Deploy All Services"

**Deploy Hosting Only**

- **Command**: `firebase deploy --only hosting`
- **Type**: Deployment task
- **Usage**: Frontend-only deployment
- **Access**: `Terminal > Run Task` → "Deploy Hosting Only"

**Deploy Functions Only**

- **Command**: `firebase deploy --only functions`
- **Type**: Deployment task
- **Usage**: Backend functions deployment
- **Access**: `Terminal > Run Task` → "Deploy Functions Only"

**Deploy Database Rules**

- **Command**: `firebase deploy --only firestore:rules`
- **Type**: Deployment task
- **Usage**: Security rules deployment
- **Access**: `Terminal > Run Task` → "Deploy Database Rules"

## 🔧 Development Utilities

### Database Tasks

**Firebase Emulator Data Reset**

- **Command**: `firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data`
- **Type**: Utility task
- **Usage**: Reset emulator with test data
- **Access**: `Terminal > Run Task` → "Reset Emulator Data"

**Populate Test Data**

- **Command**: `node populate-sample-blogs.mjs`
- **Type**: Utility task
- **Usage**: Add sample data to emulator
- **Access**: `Terminal > Run Task` → "Populate Test Data"

### Code Quality Tasks

**Lint Code**

- **Command**: `npm run lint`
- **Type**: Build task
- **Usage**: Check code style and quality
- **Access**: `Terminal > Run Task` → "Lint Code"

**Format Code**

- **Command**: `npm run format`
- **Type**: Build task
- **Usage**: Auto-format code with Prettier
- **Access**: `Terminal > Run Task` → "Format Code"

**Type Check All**

- **Command**: `npx tsc --noEmit --skipLibCheck`
- **Type**: Build task
- **Usage**: Comprehensive type checking
- **Access**: `Terminal > Run Task` → "Type Check All"

## 📋 Task Usage Guidelines

### Accessing Tasks

1. **Command Palette**: `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows)
2. **Type**: "Tasks: Run Task"
3. **Select**: Choose from available tasks
4. **Alternative**: `Terminal > Run Task` menu

### Background vs Build Tasks

**Background Tasks** (keep running):

- Development servers
- Watch processes
- Continuous testing
- Emulator services

**Build Tasks** (run once):

- Production builds
- Type checking
- Linting
- One-time deployment

### Task Dependencies

**Before starting development:**

1. Run "Start Firebase Emulators" (background)
2. Run "Start Development Server" (background)

**Before deployment:**

1. Run "TypeScript Check" (build)
2. Run "Build for Production" (build)
3. Run "Run Tests" (build)
4. Run appropriate deployment task

## 🛠️ Custom Task Configuration

### Adding New Tasks

Tasks are defined in `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Task Name",
      "type": "shell",
      "command": "command-to-run",
      "group": "build|test",
      "isBackground": true|false,
      "problemMatcher": ["$tsc"],
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

### Task Categories

- **build**: Compilation and preparation tasks
- **test**: Testing and validation tasks
- **deployment**: Production deployment tasks
- **utility**: Development helper tasks

## 🚫 Deprecated Commands

**DO NOT USE these terminal commands directly:**

```bash
# ❌ Don't use direct terminal commands
npm run dev
npm run build
firebase deploy
npm test

# ✅ Use VS Code Tasks instead
# Terminal > Run Task > "Start Development Server"
# Terminal > Run Task > "Build for Production"
# Terminal > Run Task > "Deploy All Services"
# Terminal > Run Task > "Run Tests"
```

## 📖 Quick Reference

| Task             | Shortcut                                           | Purpose               |
| ---------------- | -------------------------------------------------- | --------------------- |
| Start Dev Server | `Cmd+Shift+P` → Tasks → "Start Development Server" | Frontend development  |
| Start Firebase   | `Cmd+Shift+P` → Tasks → "Start Firebase Emulators" | Backend development   |
| Build Project    | `Cmd+Shift+P` → Tasks → "Build for Production"     | Production build      |
| Run Tests        | `Cmd+Shift+P` → Tasks → "Run Tests"                | Test execution        |
| Deploy           | `Cmd+Shift+P` → Tasks → "Deploy All Services"      | Production deployment |

## 🆘 Task Troubleshooting

### Common Issues

**Task not found:**

- Check `.vscode/tasks.json` exists
- Verify task label matches exactly
- Restart VS Code if needed

**Task fails to run:**

- Check terminal output for errors
- Verify dependencies are installed
- Check Firebase CLI is configured

**Background task won't stop:**

- Use `Terminal > Kill All Tasks`
- Or close specific terminal tab

### Getting Help

- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [Troubleshooting Guide](../09-troubleshooting/)
- [Development Setup](../01-getting-started/)

---

_Consistent task usage improves development experience and prevents command-line errors._
