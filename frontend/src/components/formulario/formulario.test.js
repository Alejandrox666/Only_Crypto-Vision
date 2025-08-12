import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Formulario from './formulario';

// Mock mejorado de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => jest.fn()), // Mock implementado correctamente
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('Formulario Component', () => {
  // Prueba 1: Renderizado básico
  test('renderiza correctamente el contenido principal', () => {
    render(
      <MemoryRouter>
        <Formulario />
      </MemoryRouter>
    );

    // Verifica elementos clave
    expect(screen.getByText('Guía Completa para Invertir en Criptomonedas')).toBeInTheDocument();
    expect(screen.getByText('Riesgos de la Inversión en Criptoactivos ⚠️')).toBeInTheDocument();
    expect(screen.getByText('¿Qué es la Tecnología Blockchain? ⛓️')).toBeInTheDocument();
  });

  // Prueba 2: Interacción con botones
  test('los botones de compra/venta funcionan correctamente', () => {
    const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockImplementation(() => mockNavigate);

    render(
      <MemoryRouter>
        <Formulario />
      </MemoryRouter>
    );

    const buyButton = screen.getByText('Comprar Ahora');
    const sellButton = screen.getByText('Vender Ahora');

    fireEvent.click(buyButton);
    fireEvent.click(sellButton);

    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith('/dash');
  });

  // Prueba 3: Estructura del contenido
  test('contiene todas las secciones principales con contenido relevante', () => {
    render(
      <MemoryRouter>
        <Formulario />
      </MemoryRouter>
    );

    // Verifica secciones principales
    const sections = screen.getAllByRole('heading', { level: 2 });
    expect(sections).toHaveLength(5);
    
    // Verifica contenido representativo de cada sección
    expect(screen.getByText(/Volatilidad Extrema:/)).toBeInTheDocument();
    expect(screen.getByText(/Descentralización:/)).toBeInTheDocument();
    expect(screen.getByText('Estrategia para Comprar (Estrategia DCA) 🟢')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin (BTC)')).toBeInTheDocument();
    expect(screen.getByText(/Diversifica:/)).toBeInTheDocument();
  });
});