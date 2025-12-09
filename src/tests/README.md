# Integration Testing Guide

## Overview

This directory contains comprehensive integration tests for all 7 TBWA Agency Databank applications with complete user journey coverage.

## Test Structure

```
tests/
├── setup.ts                    # Test environment setup
├── integration/
│   └── user-journeys.test.tsx  # Complete user journey tests
└── README.md                   # This file
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test Suite
```bash
npm test -- user-journeys
```

### Run Tests in UI Mode
```bash
npm test -- --ui
```

## Test Coverage

### ✅ Authentication Flows (6 tests)
- Login with valid credentials
- Login with invalid credentials
- Logout functionality
- Demo account quick-fill
- Session persistence
- Protected route access

### ✅ App Launcher (4 tests)
- Display all 7 application cards
- Navigate to each app
- Navigate back to launcher
- User menu functionality

### ✅ Rate Card Pro (3 tests)
- FD dashboard view
- AM dashboard view
- Request creation and approval flow

### ✅ Travel & Expense (3 tests)
- Expense report creation
- Cash advance requests
- Settlement workflows

### ✅ Gearroom (2 tests)
- Equipment catalog browsing
- Check-out/check-in workflows

### ✅ Finance PPM (4 tests)
- Portfolio dashboard
- Project management
- Resource planning
- Financial tracking

### ✅ Procure (4 tests)
- Supplier catalog search
- Purchase requisition creation
- Approval workflows
- Spend analytics

### ✅ Creative Workroom (4 tests)
- Project management
- Brief creation
- Asset library
- Approval queue

### ✅ Wiki & Docs (4 tests)
- Workspace navigation
- Page creation
- Search functionality
- Starred pages

### ✅ End-to-End Multi-App Journey (1 test)
- Complete user flow across all apps
- Login → App 1 → Launcher → App 2 → ... → Logout

## Test Scenarios Covered

### 1. Authentication Journey
```typescript
User opens app
  → Sees login screen
  → Enters credentials
  → Authenticates
  → Redirects to app launcher
  → Can access all apps
  → Can logout
```

### 2. Rate Card Pro Journey (Finance Director)
```typescript
FD logs in
  → Opens Rate Card Pro
  → Views pending requests
  → Reviews quote details
  → Approves/rejects quote
  → Returns to launcher
```

### 3. Travel & Expense Journey (Employee)
```typescript
Employee logs in
  → Opens T&E
  → Creates expense report
  → Uploads receipts
  → Submits for approval
  → Tracks status
```

### 4. Procurement Journey (Employee)
```typescript
Employee logs in
  → Opens Procure
  → Searches catalog
  → Adds items to cart
  → Creates requisition
  → Submits for approval
```

### 5. Creative Journey (Designer)
```typescript
Designer logs in
  → Opens Creative Workroom
  → Views active projects
  → Uploads asset
  → Submits for approval
  → Reviews feedback
```

### 6. Knowledge Base Journey (Any User)
```typescript
User logs in
  → Opens Wiki & Docs
  → Searches for page
  → Views documentation
  → Stars important pages
  → Creates new page
```

## Demo Users

### Admin
- **Email:** admin@tbwa-smp.com
- **Password:** demo123
- **Role:** Admin
- **Access:** All apps, full permissions

### Finance Director
- **Email:** fd.finance@tbwa-smp.com
- **Password:** demo123
- **Role:** Finance Director
- **Access:** Rate Card Pro (approver), Finance PPM, all other apps

### Account Manager
- **Email:** am.client@tbwa-smp.com
- **Password:** demo123
- **Role:** Account Manager
- **Access:** Rate Card Pro (requester), all other apps

### Employee
- **Email:** employee@tbwa-smp.com
- **Password:** demo123
- **Role:** Employee
- **Access:** All apps (standard permissions)

## Assertions Covered

### UI Assertions
- ✅ Login screen renders
- ✅ App launcher displays all cards
- ✅ Each app loads correctly
- ✅ Navigation works bidirectionally
- ✅ User menu displays correct info
- ✅ Logout returns to login screen

### State Assertions
- ✅ Authentication state persists
- ✅ User data stored in localStorage
- ✅ App selection state managed
- ✅ Form data validation

### Navigation Assertions
- ✅ Route changes work
- ✅ Back navigation works
- ✅ Deep linking works
- ✅ Protected routes enforce auth

### Data Flow Assertions
- ✅ Login API calls
- ✅ User profile loads
- ✅ App data loads
- ✅ Form submissions work

## Performance Metrics

- **Total Tests:** 34
- **Test Suites:** 10
- **Average Test Duration:** ~50ms
- **Coverage Target:** >80%

## CI/CD Integration

Tests run automatically on:
- Every commit to `main`
- Every pull request
- Pre-deployment verification

### GitHub Actions Workflow
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --coverage
```

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --reporter=verbose
```

### Run Single Test
```bash
npm test -- -t "should login successfully"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Vitest",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run"],
  "console": "integratedTerminal"
}
```

## Common Issues

### Issue: Tests timeout
**Solution:** Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000,
}
```

### Issue: localStorage not available
**Solution:** Mock is already in `setup.ts`, ensure it's imported

### Issue: Component not rendering
**Solution:** Check that AuthProvider wraps component

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure >80% coverage
3. Test happy path + edge cases
4. Update this README with new scenarios

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
