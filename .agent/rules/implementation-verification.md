# Implementation Verification Guide

Vite HMR and Node.js `--watch` handle hot reloading automatically — no need to restart servers after code changes.

## When to Verify

- After installing new dependencies
- Before committing to git
- After pulling changes
- When debugging runtime errors not caught by HMR

## Backend Check

```bash
cd server && npm install  # only if deps changed
npm run dev
```

Expected: `🚀 Server running on http://localhost:3001`

## Frontend Check

```bash
cd client && npm install  # only if deps changed
npm run build             # verify compilation
```

## Common Fixes

| Issue | Fix |
|-------|-----|
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| Missing dependency | `npm install <package>` |
| Database errors | Check Turso credentials in `server/.env` |
| Blank page | Check browser console + is backend running? |

## Quick Checklist

- [ ] Backend shows "Server running" message
- [ ] Frontend builds without errors (`npm run build`)
- [ ] No console errors in browser
- [ ] API requests return 200 in Network tab
