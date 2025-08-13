import '@testing-library/jest-dom';

// Mock global fetch para testes
global.fetch = jest.fn();

// Silenciar console.error para testes mais limpos (opcional)
const originalError = console.error;
global.console = {
  ...console,
  error: (...args) => {
    // Filtrar erros específicos do jsdom que não podemos controlar
    if (args[0] && args[0].toString().includes('HTMLFormElement.prototype.requestSubmit')) {
      return;
    }
    originalError(...args);
  },
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  if (fetch.mockClear) {
    fetch.mockClear();
  }
});
