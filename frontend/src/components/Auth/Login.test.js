// Login.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { authService } from '../../services/authService';

// Mock del authService y useNavigate
jest.mock('../../services/authService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Resetear los mocks antes de cada prueba
    authService.login.mockReset();
  });

  test('renderiza correctamente el formulario de login', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('CryptoVision')).toBeInTheDocument();
    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
    expect(screen.getByText(/¿No tienes cuenta?/i)).toBeInTheDocument();
  });

  test('permite ingresar email y contraseña', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('muestra mensaje de error cuando el login falla', async () => {
    authService.login.mockRejectedValue(new Error('Credenciales inválidas'));
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'wrongpassword' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  test('muestra estado de carga durante el login', async () => {
    authService.login.mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByText('Cargando...')).toBeInTheDocument();
  });

  test('navega al dashboard cuando el login es exitoso', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    authService.login.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dash');
    });
  });

  test('deshabilita el botón durante el loading', async () => {
    authService.login.mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    const { getByRole } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { 
      target: { value: 'password123' } 
    });
    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByRole('button', { name: /Ingresar/i }));

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const button = getByRole('button', { name: /Cargando.../i });
    expect(button).toBeDisabled();
  });

  test('valida que los campos sean requeridos', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toHaveAttribute('required');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('required');
    });
  });
});