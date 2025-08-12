import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Configuración de mocks globales
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  }))
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  MemoryRouter: ({ children }) => <div>{children}</div>
}));

// Silenciar advertencias específicas
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0].includes('React Router Future Flag Warning')) return;
  originalWarn(...args);
};