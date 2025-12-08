# Debug Guide

This document provides comprehensive instructions for debugging the ScreenCloud Order Management System using VS Code's built-in debugger.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Debug Configurations](#debug-configurations)
- [Getting Started](#getting-started)
- [Working with Breakpoints](#working-with-breakpoints)
- [Debug Features](#debug-features)
- [Debugging Tests](#debugging-tests)
- [Troubleshooting](#troubleshooting)
- [Tips and Best Practices](#tips-and-best-practices)

## Prerequisites

Before you begin debugging, ensure you have:

1. **Node.js** installed (v18 or later)
2. **VS Code** with the latest updates
3. **Dependencies installed**: Run `npm install` if you haven't already
4. **Environment variables**: Create a `.env` file based on your requirements

## Debug Configurations

The project includes five pre-configured debug configurations in `.vscode/launch.json`:

### 1. Debug Application
- **Purpose**: Launch and debug the main Express application
- **Entry Point**: `src/index.ts`
- **Use Case**: Debugging the entire application during development
- **How to Use**: 
  1. Set breakpoints in your code
  2. Press `F5` or select this configuration from the debug dropdown
  3. The server will start in debug mode

### 2. Debug Current File
- **Purpose**: Debug the currently open TypeScript file
- **Use Case**: Testing individual modules or services
- **How to Use**:
  1. Open the file you want to debug
  2. Select "Debug Current File" from the debug dropdown
  3. Press `F5`

### 3. Debug Jest Tests
- **Purpose**: Debug all Jest test suites
- **Use Case**: Running and debugging the entire test suite
- **How to Use**:
  1. Set breakpoints in test files or source code
  2. Select "Debug Jest Tests" from the debug dropdown
  3. Press `F5`

### 4. Debug Current Test File
- **Purpose**: Debug only the currently open test file
- **Use Case**: Focused debugging of specific test cases
- **How to Use**:
  1. Open a test file (e.g., `orders.test.ts`)
  2. Set breakpoints
  3. Select "Debug Current Test File" from the debug dropdown
  4. Press `F5`

### 5. Attach to Process
- **Purpose**: Attach debugger to a running Node.js process
- **Use Case**: Debugging a process started externally with `--inspect` flag
- **How to Use**:
  1. Start your application with: `node --inspect dist/index.js`
  2. Select "Attach to Process" from the debug dropdown
  3. Press `F5`

## Getting Started

### Quick Start: Debug the Application

1. **Set a Breakpoint**
   - Open `src/index.ts` or any controller/service file
   - Click in the gutter (left of line numbers) to set a breakpoint
   - A red dot will appear

2. **Start Debugging**
   - Press `F5` or click the green play button in the Debug panel
   - Select "Debug Application" from the dropdown (if prompted)

3. **Make a Request**
   - Use a tool like Postman, curl, or your browser
   - Send a request to your API endpoint
   - The debugger will pause at your breakpoint

4. **Inspect Variables**
   - Hover over variables to see their values
   - Use the Variables panel to explore object properties
   - Use the Watch panel to monitor specific expressions

### Debug a Test

1. **Open a Test File**
   - Navigate to any file in `src/__tests__/`
   - Set breakpoints in the test or in the source code being tested

2. **Start Test Debugging**
   - Select "Debug Current Test File" from the debug dropdown
   - Press `F5`
   - The debugger will pause at your breakpoints during test execution

## Working with Breakpoints

### Types of Breakpoints

#### Standard Breakpoint
- Click in the gutter to add/remove
- Execution pauses when the line is reached

#### Conditional Breakpoint
- Right-click in the gutter → Select "Add Conditional Breakpoint"
- Enter a condition (e.g., `orderId === '123'`)
- Pauses only when the condition is true

#### Logpoint
- Right-click in the gutter → Select "Add Logpoint"
- Enter a message (e.g., `Order: {orderId}`)
- Logs to console without pausing execution

### Breakpoint Management

- **Disable/Enable**: Click the breakpoint dot to toggle
- **Remove All**: Right-click in Breakpoints panel → "Remove All Breakpoints"
- **Disable All**: Click the toggle button in Breakpoints panel

## Debug Features

### Debug Toolbar

When debugging is active, you'll see a floating toolbar with these controls:

- **Continue (F5)**: Resume execution until the next breakpoint
- **Step Over (F10)**: Execute the current line and move to the next
- **Step Into (F11)**: Enter the function being called
- **Step Out (Shift+F11)**: Exit the current function
- **Restart (Ctrl+Shift+F5)**: Restart the debug session
- **Stop (Shift+F5)**: Stop debugging

### Debug Panels

#### Variables Panel
- Shows local, global, and closure variables
- Expand objects to inspect properties
- Right-click to copy value or add to watch

#### Watch Panel
- Monitor specific expressions
- Click "+" to add a watch expression
- Expressions update as you step through code

#### Call Stack Panel
- Shows the execution path to current line
- Click any frame to inspect that context
- Useful for understanding how you reached current code

#### Debug Console
- Execute expressions in the current context
- Type JavaScript/TypeScript expressions
- Access variables in scope
- Example: `console.log(orderDetails)`

## Debugging Tests

### Debug Specific Test Case

1. Open the test file
2. Find the test you want to debug (e.g., `it('should create order', ...)`)
3. Set a breakpoint inside the test
4. Use "Debug Current Test File" configuration
5. Step through test execution

### Debug Service Logic During Tests

1. Set breakpoints in service files (e.g., `src/services/orderService.ts`)
2. Run "Debug Current Test File" on a test that calls that service
3. Debugger will pause in the service code when reached

### Common Test Debugging Scenarios

**Debugging Failed Assertions:**
```typescript
// Set breakpoint before the assertion
const result = await orderService.createOrder(orderData);
expect(result.status).toBe('pending'); // Breakpoint here
```

**Debugging Mock Behavior:**
```typescript
// Set breakpoint to inspect mock calls
const mockFn = jest.fn();
// ... test code ...
console.log(mockFn.mock.calls); // Breakpoint here
```

## Troubleshooting

### Breakpoints Not Being Hit

**Problem**: Breakpoints appear gray or are not paused at

**Solutions**:
- Ensure source maps are enabled in `tsconfig.json`: `"sourceMap": true`
- Verify the code is being executed (check call stack)
- Try setting the breakpoint on a different line
- Rebuild the project: `npm run build`
- Clear the Jest cache: `npm test -- --clearCache`

### Cannot Connect to Runtime

**Problem**: "Cannot connect to runtime process" error

**Solutions**:
- Ensure no other process is using the debug port (9229)
- Check that `tsx` is installed: `npm install tsx --save-dev`
- Verify your `.env` file exists and is correctly formatted
- Restart VS Code

### Source Maps Not Working

**Problem**: Debugger shows compiled JavaScript instead of TypeScript

**Solutions**:
- Verify `tsconfig.json` has `"sourceMap": true`
- Ensure launch configuration has `"sourceMaps": true`
- Delete `dist/` folder and rebuild: `rm -rf dist && npm run build`

### Environment Variables Not Loaded

**Problem**: Environment variables are undefined during debugging

**Solutions**:
- Ensure `.env` file exists in project root
- Verify launch configuration includes: `"envFile": "${workspaceFolder}/.env"`
- Check `.env` file format (no spaces around `=`)
- Restart the debug session

### Tests Fail Only in Debug Mode

**Problem**: Tests pass normally but fail when debugging

**Solutions**:
- Check for timeouts (debugging can slow execution)
- Increase Jest timeout: `jest.setTimeout(30000);`
- Disable parallel test execution (already configured with `--runInBand`)

## Tips and Best Practices

### Efficient Debugging

1. **Use Logpoints for Quick Inspection**
   - Instead of `console.log()`, use logpoints
   - No need to modify code or restart

2. **Conditional Breakpoints Save Time**
   - Instead of hitting a breakpoint 100 times
   - Add condition: `userId === 'abc123'`

3. **Step Over vs Step Into**
   - Use Step Over (F10) for library code
   - Use Step Into (F11) for your own code

4. **Debug Console for Quick Tests**
   - Test expressions without modifying code
   - Evaluate complex objects
   - Call functions to test behavior

### Common Debugging Workflows

**Debugging API Endpoints:**
```typescript
// Set breakpoints in this order:
// 1. orderController.ts - request validation
// 2. orderService.ts - business logic
// 3. allocationService.ts - warehouse allocation
// 4. pricingService.ts - price calculation
```

**Debugging Database Operations:**
```typescript
// Enable Prisma logging in config/database.ts
// Set breakpoint before and after DB calls
const order = await prisma.order.create({ ... }); // Breakpoint here
```

**Debugging Geolocation Logic:**
```typescript
// src/utils/geoUtils.ts
// Set breakpoints to inspect coordinates
const distance = calculateDistance(point1, point2); // Breakpoint here
```

### Performance Debugging

1. **Use the Call Stack** to identify slow operations
2. **Watch memory usage** in the Variables panel
3. **Use the Debug Console** to profile:
   ```javascript
   console.time('operation');
   // ... your code ...
   console.timeEnd('operation');
   ```

### Debugging Best Practices

- **Start Broad, Then Narrow**: Begin with high-level breakpoints, then drill down
- **Use the Watch Panel**: Add key variables you track frequently
- **Leverage Conditional Breakpoints**: Especially in loops or frequently called functions
- **Keep Debug Console Open**: Quick expression evaluation is powerful
- **Don't Debug Through Node Internals**: Enable "Skip Files" to avoid stepping into Node.js internals (already configured)

## Additional Resources

- [VS Code Debugging Documentation](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Jest Debugging](https://jestjs.io/docs/troubleshooting)

## Quick Reference

| Action | Shortcut |
|--------|----------|
| Start Debugging | `F5` |
| Stop Debugging | `Shift+F5` |
| Restart | `Ctrl+Shift+F5` (Windows/Linux) / `Cmd+Shift+F5` (Mac) |
| Continue | `F5` |
| Step Over | `F10` |
| Step Into | `F11` |
| Step Out | `Shift+F11` |
| Toggle Breakpoint | `F9` |
| Debug Console | `Ctrl+Shift+Y` (Windows/Linux) / `Cmd+Shift+Y` (Mac) |

---

Happy debugging! 🐛🔍
