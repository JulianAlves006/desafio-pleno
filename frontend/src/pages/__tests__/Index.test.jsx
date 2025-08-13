import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Index from '../Index';
import api from '../../services/api';

// Mock do serviço API
jest.mock('../../services/api');
const mockedApi = api;

describe('Index Component', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar o título principal', () => {
      // Mock de resposta vazia para getTasks
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      expect(screen.getByText('Adicione e veja suas tarefas!')).toBeInTheDocument();
    });

    it('deve renderizar o formulário de adicionar tarefa', () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      expect(screen.getByText('Adicione sua tarefa!')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Responsável')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Status')).toBeInTheDocument();
      expect(screen.getByText('Adicionar tarefa')).toBeInTheDocument();
    });

    it('deve renderizar o botão de buscar tarefas', () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      expect(screen.getByText('Buscar tarefas')).toBeInTheDocument();
    });

    it('deve chamar getTasks no useEffect inicial', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledWith('/get-tasks');
      });
    });
  });

  describe('Listagem de tarefas', () => {
    it('deve renderizar lista vazia quando não há tarefas', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        expect(list.children).toHaveLength(0);
      });
    });

    it('deve renderizar as tarefas quando existem dados', async () => {
      const mockTasks = [
        {
          id: '1',
          description: 'Tarefa teste 1',
          responsable: 'João',
          status: 'pendente',
          computerName: 'PC-001'
        },
        {
          id: '2',
          description: 'Tarefa teste 2',
          responsable: 'Maria',
          status: 'concluída',
          computerName: 'PC-002'
        }
      ];

      mockedApi.get.mockResolvedValue({ data: mockTasks });

      render(<Index />);

      await waitFor(() => {
        expect(screen.getByText('Descrição: Tarefa teste 1')).toBeInTheDocument();
        expect(screen.getByText('Responsável: João')).toBeInTheDocument();
        expect(screen.getByText('Status: pendente')).toBeInTheDocument();
        expect(screen.getByText('Computador: PC-001')).toBeInTheDocument();

        expect(screen.getByText('Descrição: Tarefa teste 2')).toBeInTheDocument();
        expect(screen.getByText('Responsável: Maria')).toBeInTheDocument();
        expect(screen.getByText('Status: concluída')).toBeInTheDocument();
        expect(screen.getByText('Computador: PC-002')).toBeInTheDocument();
      });
    });

    it('deve atualizar a lista quando o botão "Buscar tarefas" é clicado', async () => {
      const user = userEvent.setup();
      
      // Primeira chamada (useEffect) - lista vazia
      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      // Segunda chamada (click do botão) - com tarefas
      const newTasks = [
        {
          id: '1',
          description: 'Nova tarefa',
          responsable: 'Usuário',
          status: 'nova',
          computerName: 'PC-Test'
        }
      ];
      mockedApi.get.mockResolvedValueOnce({ data: newTasks });

      const buscarButton = screen.getByText('Buscar tarefas');
      
      await act(async () => {
        await user.click(buscarButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Descrição: Nova tarefa')).toBeInTheDocument();
        expect(mockedApi.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Formulário de adicionar tarefa', () => {
    it('deve permitir digitar nos campos do formulário', async () => {
      const user = userEvent.setup();
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const responsableInput = screen.getByPlaceholderText('Responsável');
      const statusInput = screen.getByPlaceholderText('Status');

      await user.type(descriptionInput, 'Minha tarefa');
      await user.type(responsableInput, 'João Silva');
      await user.type(statusInput, 'Em andamento');

      expect(descriptionInput.value).toBe('Minha tarefa');
      expect(responsableInput.value).toBe('João Silva');
      expect(statusInput.value).toBe('Em andamento');
    });

    it('deve chamar a API ao submeter o formulário', async () => {
      const user = userEvent.setup();
      mockedApi.get.mockResolvedValue({ data: [] });
      mockedApi.post.mockResolvedValue({ data: { message: 'Success' } });

      render(<Index />);

      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const responsableInput = screen.getByPlaceholderText('Responsável');
      const statusInput = screen.getByPlaceholderText('Status');
      const submitButton = screen.getByText('Adicionar tarefa');

      await user.type(descriptionInput, 'Nova tarefa teste');
      await user.type(responsableInput, 'Testador');
      await user.type(statusInput, 'teste');

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/insert-task', {
          description: 'Nova tarefa teste',
          responsable: 'Testador',
          status: 'teste'
        });
      });
    });

    it('deve chamar a API mesmo com campos vazios', async () => {
      const user = userEvent.setup();
      mockedApi.get.mockResolvedValue({ data: [] });
      mockedApi.post.mockResolvedValue({ data: { message: 'Success' } });

      render(<Index />);

      const submitButton = screen.getByText('Adicionar tarefa');

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/insert-task', {
          description: '',
          responsable: '',
          status: ''
        });
      });
    });
  });

  describe('Tratamento de erros', () => {
    it('deve lidar com erro ao buscar tarefas', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedApi.get.mockRejectedValue(new Error('Erro de rede'));

      render(<Index />);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledWith('/get-tasks');
      });

      // Como o componente não tem tratamento de erro visual, apenas verificamos se a API foi chamada
      expect(mockedApi.get).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('deve lidar com erro ao inserir tarefa', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockedApi.get.mockResolvedValue({ data: [] });
      mockedApi.post.mockRejectedValue(new Error('Erro ao inserir'));

      render(<Index />);

      const submitButton = screen.getByText('Adicionar tarefa');

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Acessibilidade e UX', () => {
    it('deve ter formulário com elementos acessíveis', () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Buscar tarefas' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Adicionar tarefa' })).toBeInTheDocument();
    });

    it('deve ter inputs com placeholders apropriados', () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Responsável')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Status')).toBeInTheDocument();
    });

    it('deve renderizar lista ordenada para as tarefas', () => {
      mockedApi.get.mockResolvedValue({ data: [] });

      render(<Index />);

      expect(screen.getByRole('list')).toHaveProperty('tagName', 'OL');
    });
  });

  describe('Integração com API', () => {
    it('deve fazer chamadas sequenciais corretas', async () => {
      const user = userEvent.setup();
      
      // Mock das chamadas
      mockedApi.get.mockResolvedValue({ data: [] });
      mockedApi.post.mockResolvedValue({ data: { message: 'Success' } });

      render(<Index />);

      // Aguardar primeira chamada do useEffect
      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(1);
      });

      // Adicionar tarefa
      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const submitButton = screen.getByText('Adicionar tarefa');

      await user.type(descriptionInput, 'Test task');
      
      await act(async () => {
        await user.click(submitButton);
      });

      // Verificar chamada POST
      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/insert-task', {
          description: 'Test task',
          responsable: '',
          status: ''
        });
      });

      // Buscar tarefas novamente
      const buscarButton = screen.getByText('Buscar tarefas');
      
      await act(async () => {
        await user.click(buscarButton);
      });

      // Verificar segunda chamada GET
      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
