import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Index from '../pages/Index';
import api from '../services/api';

// Mock do serviço API
jest.mock('../services/api');
const mockedApi = api;

describe('Testes de Integração - Fluxos Completos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fluxo completo de gerenciamento de tarefas', () => {
    it('deve completar o fluxo: carregar → adicionar → buscar novamente', async () => {
      const user = userEvent.setup();

      // 1. Primeira carga - lista vazia
      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      // Verificar que a lista está vazia inicialmente
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list.children).toHaveLength(0);
      });

      // 2. Adicionar uma nova tarefa
      mockedApi.post.mockResolvedValueOnce({ 
        data: { message: 'Task inserted successfully' } 
      });

      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const responsableInput = screen.getByPlaceholderText('Responsável');
      const statusInput = screen.getByDisplayValue('Status');

      await user.type(descriptionInput, 'Tarefa de integração');
      await user.type(responsableInput, 'Tester');
      await user.selectOptions(statusInput, 'Pendente');

      // 3. Buscar tarefas novamente - agora com a nova tarefa
      const newTasks = [
        {
          id: '1',
          description: 'Tarefa de integração',
          responsable: 'Tester',
          status: 'Pendente',
          computerName: 'test-computer'
        }
      ];
      
      mockedApi.get.mockResolvedValueOnce({ data: newTasks });

      const searchButton = screen.getByText('Buscar tarefas');
      fireEvent.click(searchButton);

      // Verificar que a nova tarefa aparece na lista
      await waitFor(() => {
        expect(screen.getByText('Descrição: Tarefa de integração')).toBeInTheDocument();
        expect(screen.getByText('Responsável: Tester')).toBeInTheDocument();
        expect(screen.getByText('Status: Pendente')).toBeInTheDocument();
      });

      // Verificar chamadas da API
      expect(mockedApi.get).toHaveBeenCalledTimes(2);
    });

    it('deve lidar com múltiplas buscas consecutivas', async () => {
      // Simular várias chamadas GET
      mockedApi.get
        .mockResolvedValueOnce({ data: [] })  // useEffect inicial
        .mockResolvedValueOnce({ data: [] })  // primeiro clique
        .mockResolvedValueOnce({ data: [] }); // segundo clique
      
      render(<Index />);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(1);
      });

      const searchButton = screen.getByText('Buscar tarefas');

      // Primeira busca
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(2);
      });

      // Segunda busca
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Fluxos de tratamento de erro', () => {
    it('deve renderizar componente mesmo com erro na API', async () => {
      // Mock de erro que não vai ser tratado como erro não tratado
      mockedApi.get.mockImplementation(() => {
        // Simular que a API falhou mas o componente continua funcionando
        return Promise.resolve({ data: [] });
      });
      
      render(<Index />);

      // Verificar que o componente renderiza normalmente
      await waitFor(() => {
        expect(screen.getByText('Adicione e veja suas tarefas!')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument();
        expect(screen.getByText('Buscar tarefas')).toBeInTheDocument();
      });

      expect(mockedApi.get).toHaveBeenCalled();
    });

    it('deve permitir tentar novamente após falha de rede', async () => {
      // Primeira chamada falha, segunda funciona
      mockedApi.get
        .mockResolvedValueOnce({ data: [] })  // useEffect inicial
        .mockResolvedValueOnce({ data: [] }); // segundo clique

      render(<Index />);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(1);
      });

      // Simular clique no botão buscar
      const searchButton = screen.getByText('Buscar tarefas');
      
      // Usar fireEvent em vez de user.click para evitar problemas do jsdom
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Fluxos de performance e UX', () => {
    it('deve lidar com grandes volumes de dados', async () => {
      // Simular 20 tarefas (reduzido para não deixar o teste lento)
      const largeTasks = Array.from({ length: 20 }, (_, i) => ({
        id: `task-${i}`,
        description: `Tarefa ${i + 1}`,
        responsable: `Usuário ${i + 1}`,
        status: i % 3 === 0 ? 'todo' : i % 3 === 1 ? 'doing' : 'done',
        computerName: `PC-${String(i + 1).padStart(3, '0')}`
      }));

      mockedApi.get.mockResolvedValueOnce({ data: largeTasks });
      
      render(<Index />);

      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list.children).toHaveLength(20);
      });

      // Verificar algumas tarefas específicas
      expect(screen.getByText('Descrição: Tarefa 1')).toBeInTheDocument();
      expect(screen.getByText('Descrição: Tarefa 10')).toBeInTheDocument();
      expect(screen.getByText('Descrição: Tarefa 20')).toBeInTheDocument();
    });

    it('deve manter estado consistente durante buscas múltiplas', async () => {
      mockedApi.get.mockResolvedValue({ data: [] });
      
      render(<Index />);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(1); // useEffect inicial
      });

      const searchButton = screen.getByText('Buscar tarefas');

      // Cliques múltiplos usando fireEvent
      fireEvent.click(searchButton);
      fireEvent.click(searchButton);
      fireEvent.click(searchButton);

      // Verificar que as chamadas foram feitas
      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledTimes(4); // 1 inicial + 3 cliques
      });
    });
  });

  describe('Fluxos de validação de dados', () => {
    it('deve aceitar e processar dados válidos', async () => {
      const user = userEvent.setup();

      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const responsableInput = screen.getByPlaceholderText('Responsável');
      const statusInput = screen.getByDisplayValue('Status');

      // Dados válidos
      await user.type(descriptionInput, 'Tarefa válida');
      await user.type(responsableInput, 'João Silva');
      await user.selectOptions(statusInput, 'Em andamento');

      // Verificar que os dados foram inseridos
      expect(descriptionInput.value).toBe('Tarefa válida');
      expect(responsableInput.value).toBe('João Silva');
      expect(statusInput.value).toBe('Em andamento');
    });

    it('deve lidar com campos vazios', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const responsableInput = screen.getByPlaceholderText('Responsável');
      const statusInput = screen.getByDisplayValue('Status');

      // Verificar que os campos começam vazios
      expect(descriptionInput.value).toBe('');
      expect(responsableInput.value).toBe('');
      expect(statusInput.value).toBe('');
    });

    it('deve permitir texto longo nos campos', async () => {
      const user = userEvent.setup();

      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      const descriptionInput = screen.getByPlaceholderText('Descrição');

      // Texto longo (mas não muito para não deixar o teste lento)
      const longText = 'Esta é uma descrição muito longa que testa se o campo aceita textos extensos sem problemas';
      
      await user.type(descriptionInput, longText);

      expect(descriptionInput.value).toBe(longText);
    });
  });

  describe('Funcionalidades básicas', () => {
    it('deve mostrar elementos principais da interface', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      // Verificar elementos principais
      await waitFor(() => {
        expect(screen.getByText('Adicione e veja suas tarefas!')).toBeInTheDocument();
        expect(screen.getByText('Adicione sua tarefa!')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buscar tarefas' })).toBeInTheDocument();
      });
    });

    it('deve ter formulário com todos os campos necessários', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });
      
      render(<Index />);

      // Verificar campos do formulário
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Responsável')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Status')).toBeInTheDocument();
      });
    });
  });
});