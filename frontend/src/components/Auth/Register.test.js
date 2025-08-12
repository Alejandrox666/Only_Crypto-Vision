// Register.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { authService } from '../../services/authService';

// Mock del authService y react-router-dom
jest.mock('../../services/authService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Register Component', () => {
  beforeEach(() => {
    // Resetear los mocks antes de cada prueba
    authService.register.mockReset();
    jest.clearAllMocks();
  });

  test('renderiza correctamente el formulario de registro', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(screen.getByText('Regístrate para comenzar')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument();
    expect(screen.getByText(/¿Ya tienes cuenta?/i)).toBeInTheDocument();
  });

  test('permite ingresar datos en todos los campos', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText('Nombre');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmInput = screen.getByLabelText('Confirmar Contraseña');

    fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('Juan Pérez');
    expect(emailInput.value).toBe('juan@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmInput.value).toBe('password123');
  });

  test('muestra error cuando las contraseñas no coinciden', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Llenar formulario con contraseñas diferentes
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'different' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  test('muestra mensaje de error cuando el registro falla', async () => {
    authService.register.mockRejectedValue(new Error('El email ya está registrado'));
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Llenar formulario correctamente
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
    });
  });

  test('navega a login cuando el registro es exitoso', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    authService.register.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Llenar formulario correctamente
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('muestra estado de carga durante el registro', async () => {
    authService.register.mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Llenar formulario correctamente
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    expect(await screen.findByText('Cargando...')).toBeInTheDocument();
  });

  test('deshabilita el botón durante el loading', async () => {
    authService.register.mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    const { getByRole } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Llenar formulario correctamente
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'password123' } });
    
    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByRole('button', { name: /Registrarse/i }));

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const button = getByRole('button', { name: /Cargando.../i });
    expect(button).toBeDisabled();
  });

  test('valida que los campos sean requeridos', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre')).toHaveAttribute('required');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByLabelText('Email')).toHaveAttribute('required');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('required');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByLabelText('Confirmar Contraseña')).toHaveAttribute('required');
    });
  });
});