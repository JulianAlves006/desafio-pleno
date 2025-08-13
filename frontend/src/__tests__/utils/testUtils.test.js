import {
  createMockTask,
  createMockTasks,
  createApiGetResponse,
  createApiPostResponse,
  createApiError,
  testFormData,
  expectApiCall,
  clearAllMocks
} from './testUtils';

describe('Test Utils', () => {
  describe('createMockTask', () => {
    it('deve criar uma tarefa mock com valores padrão', () => {
      const task = createMockTask();

      expect(task).toEqual({
        id: 'mock-id-123',
        description: 'Tarefa mock',
        responsable: 'Usuário Mock',
        status: 'pendente',
        computerName: 'PC-Mock'
      });
    });

    it('deve permitir sobrescrever valores padrão', () => {
      const task = createMockTask({
        description: 'Tarefa customizada',
        status: 'concluída'
      });

      expect(task.description).toBe('Tarefa customizada');
      expect(task.status).toBe('concluída');
      expect(task.responsable).toBe('Usuário Mock'); // Mantém valor padrão
    });
  });

  describe('createMockTasks', () => {
    it('deve criar 3 tarefas por padrão', () => {
      const tasks = createMockTasks();

      expect(tasks).toHaveLength(3);
      expect(tasks[0].description).toBe('Tarefa 1');
      expect(tasks[1].description).toBe('Tarefa 2');
      expect(tasks[2].description).toBe('Tarefa 3');
    });

    it('deve criar quantidade especificada de tarefas', () => {
      const tasks = createMockTasks(5);

      expect(tasks).toHaveLength(5);
      expect(tasks[4].description).toBe('Tarefa 5');
    });

    it('deve alternar status entre todo, doing, done', () => {
      const tasks = createMockTasks(6);

      expect(tasks[0].status).toBe('todo');   // index 0: 0 % 3 === 0
      expect(tasks[1].status).toBe('doing');  // index 1: 1 % 3 === 1
      expect(tasks[2].status).toBe('done');   // index 2: 2 % 3 === 2
      expect(tasks[3].status).toBe('todo');   // index 3: 3 % 3 === 0
      expect(tasks[4].status).toBe('doing');  // index 4: 4 % 3 === 1
      expect(tasks[5].status).toBe('done');   // index 5: 5 % 3 === 2
    });
  });

  describe('createApiGetResponse', () => {
    it('deve criar resposta GET com lista vazia por padrão', () => {
      const response = createApiGetResponse();

      expect(response).toEqual({ data: [] });
    });

    it('deve criar resposta GET com tarefas fornecidas', () => {
      const tasks = createMockTasks(2);
      const response = createApiGetResponse(tasks);

      expect(response.data).toEqual(tasks);
      expect(response.data).toHaveLength(2);
    });
  });

  describe('createApiPostResponse', () => {
    it('deve criar resposta POST com mensagem padrão', () => {
      const response = createApiPostResponse();

      expect(response).toEqual({
        data: { message: 'Task inserted successfully' }
      });
    });

    it('deve criar resposta POST com mensagem customizada', () => {
      const response = createApiPostResponse('Operação concluída');

      expect(response).toEqual({
        data: { message: 'Operação concluída' }
      });
    });
  });

  describe('createApiError', () => {
    it('deve criar erro com valores padrão', () => {
      const error = createApiError();

      expect(error.message).toBe('API Error');
      expect(error.response.status).toBe(500);
      expect(error.response.data.error).toBe('API Error');
    });

    it('deve criar erro com valores customizados', () => {
      const error = createApiError('Não encontrado', 404);

      expect(error.message).toBe('Não encontrado');
      expect(error.response.status).toBe(404);
      expect(error.response.data.error).toBe('Não encontrado');
    });
  });

  describe('testFormData', () => {
    it('deve ter dados válidos', () => {
      expect(testFormData.valid).toEqual({
        description: 'Tarefa de teste',
        responsable: 'Testador',
        status: 'em teste'
      });
    });

    it('deve ter dados com caracteres especiais', () => {
      expect(testFormData.withSpecialChars.description).toContain('acentos');
      expect(testFormData.withSpecialChars.responsable).toContain('&');
      expect(testFormData.withSpecialChars.status).toContain('✓');
    });

    it('deve ter dados vazios', () => {
      expect(testFormData.empty).toEqual({
        description: '',
        responsable: '',
        status: ''
      });
    });

    it('deve ter textos longos', () => {
      expect(testFormData.longText.description).toHaveLength(500);
      expect(testFormData.longText.responsable).toHaveLength(100);
      expect(testFormData.longText.status).toHaveLength(50);
    });
  });

  describe('expectApiCall', () => {
    it('deve verificar chamada GET sem dados', () => {
      const mockFn = jest.fn();
      mockFn('/get-tasks');

      expectApiCall(mockFn, '/get-tasks');
    });

    it('deve verificar chamada POST com dados', () => {
      const mockFn = jest.fn();
      const data = { test: 'data' };
      mockFn('/insert-task', data);

      expectApiCall(mockFn, '/insert-task', data);
    });
  });

  describe('clearAllMocks', () => {
    it('deve limpar todos os mocks fornecidos', () => {
      const mock1 = jest.fn();
      const mock2 = jest.fn();
      const mock3 = jest.fn();

      // Chamar as funções para ter histórico
      mock1();
      mock2();
      mock3();

      expect(mock1).toHaveBeenCalledTimes(1);
      expect(mock2).toHaveBeenCalledTimes(1);
      expect(mock3).toHaveBeenCalledTimes(1);

      // Limpar mocks
      clearAllMocks(mock1, mock2, mock3);

      expect(mock1).toHaveBeenCalledTimes(0);
      expect(mock2).toHaveBeenCalledTimes(0);
      expect(mock3).toHaveBeenCalledTimes(0);
    });

    it('deve lidar com valores null/undefined', () => {
      const mock1 = jest.fn();
      
      // Não deve quebrar com valores inválidos
      expect(() => {
        clearAllMocks(mock1, null, undefined, 'string');
      }).not.toThrow();
    });
  });
});
