// Utilidades para testes

/**
 * Cria dados mock para tarefas
 */
export const createMockTask = (overrides = {}) => ({
  id: 'mock-id-123',
  description: 'Tarefa mock',
  responsable: 'Usuário Mock',
  status: 'pendente',
  computerName: 'PC-Mock',
  ...overrides
});

/**
 * Cria múltiplas tarefas mock
 */
export const createMockTasks = (count = 3) => {
  return Array.from({ length: count }, (_, index) => 
    createMockTask({
      id: `mock-id-${index + 1}`,
      description: `Tarefa ${index + 1}`,
      responsable: `Usuário ${index + 1}`,
      status: index % 3 === 0 ? 'todo' : index % 3 === 1 ? 'doing' : 'done',
      computerName: `PC-${String(index + 1).padStart(3, '0')}`
    })
  );
};

/**
 * Mock de resposta da API para GET /get-tasks
 */
export const createApiGetResponse = (tasks = []) => ({
  data: tasks
});

/**
 * Mock de resposta da API para POST /insert-task
 */
export const createApiPostResponse = (message = 'Task inserted successfully') => ({
  data: { message }
});

/**
 * Mock de erro da API
 */
export const createApiError = (message = 'API Error', status = 500) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { error: message }
  };
  return error;
};

/**
 * Configuração padrão de mocks para testes
 */
export const setupDefaultMocks = (api) => {
  api.get.mockResolvedValue(createApiGetResponse([]));
  api.post.mockResolvedValue(createApiPostResponse());
};

/**
 * Aguarda que uma operação assíncrona seja concluída
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Simula delay de rede
 */
export const mockNetworkDelay = (ms = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper para verificar chamadas da API
 */
export const expectApiCall = (mockFn, endpoint, data = undefined) => {
  if (data) {
    expect(mockFn).toHaveBeenCalledWith(endpoint, data);
  } else {
    expect(mockFn).toHaveBeenCalledWith(endpoint);
  }
};

/**
 * Helper para limpar todos os mocks
 */
export const clearAllMocks = (...mocks) => {
  mocks.forEach(mock => {
    if (mock && typeof mock.mockClear === 'function') {
      mock.mockClear();
    }
  });
};

/**
 * Dados de teste para formulário
 */
export const testFormData = {
  valid: {
    description: 'Tarefa de teste',
    responsable: 'Testador',
    status: 'em teste'
  },
  withSpecialChars: {
    description: 'Tarefa com acentos: ção, ãm, ñ',
    responsable: 'João & Maria (Teste)',
    status: 'Em progresso... 50% ✓'
  },
  empty: {
    description: '',
    responsable: '',
    status: ''
  },
  longText: {
    description: 'A'.repeat(500),
    responsable: 'B'.repeat(100),
    status: 'C'.repeat(50)
  }
};

/**
 * Simula interação de usuário com delay realista
 */
export const simulateUserTyping = async (user, element, text, options = {}) => {
  const { delay = 50, clear = true } = options;
  
  if (clear) {
    await user.clear(element);
  }
  
  await user.type(element, text, { delay });
};

/**
 * Verifica se elementos estão presentes na tela
 */
export const expectElementsToBePresent = (screen, texts) => {
  texts.forEach(text => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};

/**
 * Verifica se elementos têm placeholders corretos
 */
export const expectPlaceholders = (screen, placeholders) => {
  placeholders.forEach(placeholder => {
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
};
