// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Default to false, or true if you prefer dark mode as default for tests
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;


// Mock for #app-config-data element
// This is to prevent "App configuration element (#app-config-data) not found" errors in tests.
// In a real browser environment, this element would be in index.html.
if (!document.getElementById('app-config-data')) {
  const configElement = document.createElement('script');
  configElement.id = 'app-config-data';
  configElement.type = 'application/json';
  // You can put default minimal config here if your app needs it during tests
  // For now, an empty object or a basic structure should suffice.
  configElement.textContent = JSON.stringify({
    // Add any default config properties your app might expect
    // e.g., VITE_API_URL: "http://localhost:3000/api/v1"
  });
  document.body.appendChild(configElement);
}

// Optional: Mock localStorage if your store or components use it directly
// and you want to control its behavior in tests.
// Vitest/JSDOM usually provides a basic localStorage mock, but you can extend it.
// const localStorageMock = (function() {
//   let store = {};
//   return {
//     getItem: function(key) {
//       return store[key] || null;
//     },
//     setItem: function(key, value) {
//       store[key] = value.toString();
//     },
//     removeItem: function(key) {
//       delete store[key];
//     },
//     clear: function() {
//       store = {};
//     }
//   };
// })();
// Object.defineProperty(window, 'localStorage', {
//   value: localStorageMock
// });

// Clean up after each test
// import { cleanup } from '@testing-library/react';
// afterEach(() => {
//   cleanup();
// });

// If you are using MSW (Mock Service Worker) for API mocking
import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
