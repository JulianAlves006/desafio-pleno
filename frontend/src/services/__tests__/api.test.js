import api from '../api';

// Mock do módulo API diretamente
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    baseURL: 'http://localhost:3000'
  }
}));

const mockedApi = api;

describe('API Service', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Métodos HTTP', () => {
    it('deve fazer requisição GET corretamente', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            description: 'Test task',
            responsable: 'John Doe',
            status: 'pending',
            computerName: 'test-computer'
          }
        ]
      };

      // Mock da resposta
      mockedApi.get.mockResolvedValue(mockResponse);

      const response = await api.get('/get-tasks');

      expect(api.get).toHaveBeenCalledWith('/get-tasks');
      expect(response.data).toEqual(mockResponse.data);
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toHaveProperty('description', 'Test task');
    });

    it('deve fazer requisição POST corretamente', async () => {
      const mockRequestData = {
        description: 'Nova tarefa',
        responsable: 'Jane Doe',
        status: 'todo'
      };

      const mockResponse = {
        data: { message: 'Task inserted successfully' }
      };

      // Mock da resposta
      mockedApi.post.mockResolvedValue(mockResponse);

      const response = await api.post('/insert-task', mockRequestData);

      expect(api.post).toHaveBeenCalledWith('/insert-task', mockRequestData);
      expect(response.data).toEqual(mockResponse.data);
      expect(response.data.message).toBe('Task inserted successfully');
    });

    it('deve tratar erros de rede corretamente', async () => {
      const mockError = new Error('Network Error');
      
      // Mock de erro
      mockedApi.get.mockRejectedValue(mockError);

      await expect(api.get('/get-tasks')).rejects.toThrow('Network Error');
      expect(api.get).toHaveBeenCalledWith('/get-tasks');
    });

    it('deve tratar erros de servidor (500) corretamente', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };

      mockedApi.get.mockRejectedValue(mockError);

      await expect(api.get('/get-tasks')).rejects.toEqual(mockError);
    });

    it('deve tratar erros de cliente (400) corretamente', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Bad Request' }
        }
      };

      mockedApi.post.mockRejectedValue(mockError);

      const invalidData = {}; // dados inválidos

      await expect(api.post('/insert-task', invalidData)).rejects.toEqual(mockError);
    });
  });

  describe('Endpoints específicos', () => {
    it('deve fazer chamada para buscar tasks', async () => {
      const mockTasks = [
        { description: 'Task 1', responsable: 'User 1', status: 'done' },
        { description: 'Task 2', responsable: 'User 2', status: 'pending' }
      ];

      mockedApi.get.mockResolvedValue({ data: mockTasks });

      const response = await api.get('/get-tasks');

      expect(response.data).toHaveLength(2);
      expect(response.data[0]).toHaveProperty('description', 'Task 1');
      expect(response.data[1]).toHaveProperty('status', 'pending');
    });

    it('deve fazer chamada para inserir task', async () => {
      const newTask = {
        description: 'Estudar React Testing',
        responsable: 'Developer',
        status: 'in-progress'
      };

      mockedApi.post.mockResolvedValue({
        data: { message: 'Task inserted successfully' }
      });

      const response = await api.post('/insert-task', newTask);

      expect(api.post).toHaveBeenCalledWith('/insert-task', newTask);
      expect(response.data.message).toBe('Task inserted successfully');
    });
  });

  describe('Validação de dados', () => {
    it('deve aceitar dados válidos para criação de task', async () => {
      const validTask = {
        description: 'Valid description',
        responsable: 'Valid responsible',
        status: 'valid-status'
      };

      mockedApi.post.mockResolvedValue({
        data: { message: 'Success' }
      });

      await api.post('/insert-task', validTask);

      expect(api.post).toHaveBeenCalledWith('/insert-task', validTask);
    });

    it('deve permitir campos opcionais vazios', async () => {
      const taskWithEmptyFields = {
        description: '',
        responsable: '',
        status: ''
      };

      mockedApi.post.mockResolvedValue({
        data: { message: 'Success' }
      });

      await api.post('/insert-task', taskWithEmptyFields);

      expect(api.post).toHaveBeenCalledWith('/insert-task', taskWithEmptyFields);
    });
  });
});