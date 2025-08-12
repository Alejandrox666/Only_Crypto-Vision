import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Dash from './Dash';
import { portfolioService } from '../../services/cryptoService';
import { authService } from '../../services/authService';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));
// Mock de los servicios y componentes
jest.mock('../../services/cryptoService');
jest.mock('../../services/authService');
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}));

// Datos de prueba reutilizables
const mockPortfolio = {
  balance: 1000,
  portfolio: [
    { crypto_symbol: 'BTC', cantidad: 0.5 },
    { crypto_symbol: 'ETH', cantidad: 2 },
  ],
};

// Render helper para evitar repetición de código
const renderDash = async () => {
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(
      <MemoryRouter>
        <Dash />
      </MemoryRouter>
    );
  });
};

describe('Dash Component', () => {
  beforeEach(() => {
    portfolioService.getPortfolio.mockResolvedValue(mockPortfolio);
    portfolioService.buyCrypto.mockResolvedValue({});
    portfolioService.sellCrypto.mockResolvedValue({});
    portfolioService.addFunds.mockResolvedValue({});
    authService.logout.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente el dashboard con datos iniciales', async () => {
    await renderDash();

    // Verificar criptomonedas
    expect(screen.getByText('Bitcoin (BTC)')).toBeInTheDocument();
    expect(screen.getByText('Ethereum (ETH)')).toBeInTheDocument();
    expect(screen.getByText('Dogecoin (DOGE)')).toBeInTheDocument();

    // Verificar gráficos
    expect(screen.getAllByTestId('line-chart')).toHaveLength(3);

    // Verificar saldo y valor del portafolio
    expect(screen.getByText(/Saldo: \$1000.00/)).toBeInTheDocument();
    expect(screen.getByText(/Valor Portafolio:/)).toBeInTheDocument();

    // Verificar botones de acción
    expect(screen.getByRole('button', { name: 'Ingresar Dinero' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprende de Cryptomonedas' })).toBeInTheDocument();
  });

  test('muestra las cantidades poseídas de cada criptomoneda', async () => {
    await renderDash();

    expect(screen.getByText('Tienes: 0.5 BTC')).toBeInTheDocument();
    expect(screen.getByText('Tienes: 2 ETH')).toBeInTheDocument();
    expect(screen.getByText('Tienes: 0 DOGE')).toBeInTheDocument();
  });

  describe('Operaciones con criptomonedas', () => {
    test('permite comprar criptomonedas', async () => {
      await renderDash();

      const btcInput = screen.getAllByPlaceholderText('Cantidad')[0];
      fireEvent.change(btcInput, { target: { value: '0.1' } });
      fireEvent.click(screen.getAllByText('Comprar')[0]);

      await waitFor(() => {
        expect(portfolioService.buyCrypto).toHaveBeenCalledWith(
          1,
          'BTC',
          expect.any(Number),
          0.1
        );
      });
    });

    test('permite vender criptomonedas', async () => {
      await renderDash();

      const ethInput = screen.getAllByPlaceholderText('Cantidad')[1];
      fireEvent.change(ethInput, { target: { value: '0.5' } });
      fireEvent.click(screen.getAllByText('Vender')[1]);

      await waitFor(() => {
        expect(portfolioService.sellCrypto).toHaveBeenCalledWith(
          1,
          'ETH',
          expect.any(Number),
          0.5
        );
      });
    });
  });

  describe('Modal de depósito', () => {
    const openDepositModal = async () => {
      await renderDash();
      fireEvent.click(screen.getByText('Ingresar Dinero'));
    };

    test('muestra modal de depósito y permite ingresar dinero', async () => {
      await openDepositModal();

      // Rellenar formulario de depósito
      fireEvent.change(screen.getByPlaceholderText('Ej: 100.00'), { 
        target: { value: '200' } 
      });
      fireEvent.change(screen.getByPlaceholderText('Número de tarjeta (16 dígitos)'), { 
        target: { value: '4111111111111111' } 
      });
      fireEvent.change(screen.getByPlaceholderText('MM/AA'), { 
        target: { value: '12/25' } 
      });
      fireEvent.change(screen.getByPlaceholderText('CVV (3 dígitos)'), { 
        target: { value: '123' } 
      });

      fireEvent.click(screen.getByText('Confirmar Depósito'));

      await waitFor(() => {
        expect(portfolioService.addFunds).toHaveBeenCalledWith(1, 200);
      });
    });

    test('valida los campos del formulario de depósito', async () => {
      await openDepositModal();
      fireEvent.click(screen.getByText('Confirmar Depósito'));

      await waitFor(() => {
        expect(screen.getByText('Por favor ingresa una cantidad válida')).toBeInTheDocument();
      });
    });
  });

  test('permite cerrar sesión', async () => {
    await renderDash();
    fireEvent.click(screen.getByText('Cerrar sesión'));

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  test('navega al formulario de aprendizaje', async () => {
    
 

    await renderDash();
    fireEvent.click(screen.getByText('Aprende de Cryptomonedas'));

    // eslint-disable-next-line no-undef
    expect(mockNavigate).toHaveBeenCalledWith('/form');
  });

  describe('Precios en tiempo real', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('muestra cambios de precios en tiempo real', async () => {
      await renderDash();

      const initialPrices = screen.getAllByText(/\$\d+\.\d{2}/);
      const initialBtcPrice = initialPrices[0].textContent;

      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      const updatedPrices = screen.getAllByText(/\$\d+\.\d{2}/);
      const updatedBtcPrice = updatedPrices[0].textContent;

      expect(initialBtcPrice).not.toBe(updatedBtcPrice);
    });
  });

  test('maneja errores al cargar el portafolio', async () => {
    portfolioService.getPortfolio.mockRejectedValue(new Error('Error de red'));
    await renderDash();

    // Verificar que el componente no se rompe
    expect(screen.getByText('Bitcoin (BTC)')).toBeInTheDocument();
  });
});