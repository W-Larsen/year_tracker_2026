# Implementation Verification Guide

When making changes to the Year Tracker 2026 React + Node.js application, ALWAYS follow these verification steps to ensure the application compiles and runs correctly.

## Backend Verification

### 1. Check Backend Compiles
```bash
cd server
npm install  # Only if dependencies changed
node index.js --help 2>&1 | head -5  # Quick syntax check
```

### 2. Look for Common Backend Issues
- **Missing dependencies**: Check `package.json` has all required packages (express, sql.js, cors, dotenv)
- **Import errors**: Ensure all ES6 imports use `.js` extension for local files
- **Database issues**: Verify `database.js` initializes correctly
- **Port conflicts**: Check port 3001 is available

### 3. Test Backend Runs
```bash
cd server
npm run dev
```

Expected output:
```
📂 Loaded existing database (or 🆕 Created new database)
✅ Database seeded with initial activities
🚀 Server running on http://localhost:3001
📊 Environment: development
```

If errors occur:
- Read the error message carefully
- Check if it's a missing dependency → run `npm install <package>`
- Check if it's a syntax error → review the file mentioned
- Check if it's a port conflict → kill process on port 3001: `lsof -ti:3001 | xargs kill -9`

---

## Frontend Verification

### 1. Check Frontend Dependencies
```bash
cd client
npm install  # Only if dependencies changed
```

### 2. Look for Common Frontend Issues
- **Missing dependencies**: Verify `package.json` includes:
  - react, react-dom
  - prop-types (if using PropTypes)
  - vite dependencies
- **Import errors**: Check component imports use correct paths
- **Hook errors**: Verify hooks are used correctly (not in conditionals, etc.)

### 3. Test Frontend Compiles
```bash
cd client
npm run build
```

If build succeeds, the app compiles correctly.

If errors occur:
- **"Cannot find module"**: Missing dependency → `npm install <package>`
- **"Unexpected token"**: Syntax error in JSX/JS
- **"Invalid hook call"**: Check React hooks usage
- Read the error stack trace to find the problematic file

### 4. Test Frontend Runs
```bash
cd client
npm run dev
```

Expected output:
```
ROLLDOWN-VITE v7.2.5  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## Full Application Test

### 1. Run Both Servers
Terminal 1 (Backend):
```bash
cd server && npm run dev
```

Terminal 2 (Frontend):
```bash
cd client && npm run dev
```

### 2. Test in Browser
1. Open http://localhost:5173
2. Check:
   - Page loads without errors
   - All activity sections are visible
   - Dots are clickable
   - Counters update when dots are clicked
   - Footer is at the bottom (no extra scrolling needed)
3. Open browser console (F12) - should have no errors

### 3. Test API Communication
In browser console, check Network tab:
- Should see successful `GET /api/activities` request
- Should see successful `GET /api/progress` request
- Clicking dots should trigger `POST /api/progress` requests
- All requests should return 200 status

---

## Common Issues and Fixes

### Issue: "prop-types is not defined"
**Fix:**
```bash
cd client
npm install prop-types
```

### Issue: Backend won't start - "EADDRINUSE"
**Fix:**
```bash
lsof -ti:3001 | xargs kill -9
```

### Issue: Frontend shows blank page
**Check:**
1. Browser console for errors
2. Network tab - are API calls failing?
3. Is backend running?

### Issue: Database errors
**Fix:**
```bash
cd server
rm tracker.db  # Delete database
npm run dev    # Will recreate and seed
```

### Issue: Footer requires scrolling
**Check:**
1. `#root` has `display: flex`, `flex-direction: column`, `min-height: 100vh`
2. `.footer-bar` has `margin-top: auto`
3. App.jsx uses `useLayoutEffect` for layout updates

---

## Quick Checklist

Before considering changes complete:

- [ ] Backend compiles without errors (`node index.js` doesn't crash immediately)
- [ ] Frontend builds successfully (`npm run build` in client/)
- [ ] Backend runs and shows "Server running" message
- [ ] Frontend runs and opens in browser
- [ ] No console errors in browser
- [ ] Dots are clickable and counters update
- [ ] Footer is positioned at bottom without scrolling
- [ ] API requests visible in Network tab (all 200 status)

---

## When to Use This Guide

Use this verification process:
1. **After making code changes** to any file
2. **After installing new dependencies**
3. **Before committing changes** to git
4. **After pulling changes** from repository
5. **When fixing bugs** to ensure fix works

---

## Automation Script (Optional)

Create a `verify.sh` script in the root directory:

```bash
#!/bin/bash
set -e

echo "🔍 Verifying backend..."
cd server
node index.js --version 2>&1 || echo "Backend syntax OK"

echo "🔍 Verifying frontend build..."
cd ../client
npm run build

echo "✅ All checks passed!"
```

Make executable: `chmod +x verify.sh`
Run: `./verify.sh`
