import '@testing-library/jest-dom';

// Mock global fetch para testes
global.fetch = jest.fn();

// Polyfill for HTMLFormElement.prototype.requestSubmit
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function(submitter) {
    const form = this;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    
    if (submitter) {
      Object.defineProperty(submitEvent, 'submitter', {
        value: submitter,
        configurable: true
      });
    }
    
    const cancelled = !form.dispatchEvent(submitEvent);
    if (!cancelled) {
      form.submit();
    }
  };
}

// Silenciar console.error para testes mais limpos (opcional)
const originalError = console.error;
global.console = {
  ...console,
  error: (...args) => {
    // Filtrar erros específicos do jsdom que não podemos controlar
    if (args[0] && args[0].toString().includes('HTMLFormElement.prototype.requestSubmit')) {
      return;
    }
    // Filtrar warnings do act() durante testes - esperado para operações assíncronas no useEffect
    if (args[0] && args[0].toString().includes('not wrapped in act')) {
      return;
    }
    // Filtrar warnings sobre o ambiente de teste não configurado para act
    if (args[0] && args[0].toString().includes('not configured to support act')) {
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
