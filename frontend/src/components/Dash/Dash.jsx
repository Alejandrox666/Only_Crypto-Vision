import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./Dash.css";
import { portfolioService } from '../../services/cryptoService';
import { authService } from '../../services/authService';

const userId = 1;

const cryptoList = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", basePrice: 29500 },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", basePrice: 3250 },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", basePrice: 0.20 },
];

const generateInitialHistory = (basePrice, length = 20) => {
  let history = [basePrice];
  for (let i = 1; i < length; i++) {
    const changePercent = (Math.random() - 0.5) * 0.004;
    const newPrice = history[i - 1] * (1 + changePercent);
    history.push(newPrice);
  }
  return history;
};

const Dash = () => {
  const [cryptos, setCryptos] = useState(
    cryptoList.map((crypto) => {
      const history = generateInitialHistory(crypto.basePrice);
      const price = history[history.length - 1];
      const change24h = ((price - history[0]) / history[0]) * 100;
      return {
        ...crypto,
        price,
        history,
        change24h,
      };
    })
  );

  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState({});
  const [quantities, setQuantities] = useState({});
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  const refreshData = async () => {
    try {
      const data = await portfolioService.getPortfolio(userId);
      setBalance(data.balance);
      const portfolioObj = {};
      data.portfolio.forEach((item) => {
        portfolioObj[item.crypto_symbol] = item.cantidad;
      });
      setPortfolio(portfolioObj);
    } catch (error) {
      console.error("Error al cargar portafolio:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos((prevCryptos) =>
        prevCryptos.map((crypto) => {
          const lastPrice = crypto.price;
          const changePercent = (Math.random() - 0.5) * 0.004;
          const newPrice = lastPrice * (1 + changePercent);
          const newHistory = [...crypto.history.slice(1), newPrice];
          const change24h = ((newPrice - newHistory[0]) / newHistory[0]) * 100;

          return {
            ...crypto,
            price: newPrice,
            history: newHistory,
            change24h,
          };
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleQuantityChange = (symbol, value) => {
    setQuantities(prev => ({
      ...prev,
      [symbol]: value > 0 ? value : 0
    }));
  };

  const showModal = (title, message, isError = true) => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'custom-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="custom-modal ${isError ? 'error' : ''}">
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="this.closest('.custom-modal-overlay').remove()">Aceptar</button>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  };

  const buyHandler = async (symbol) => {
    const crypto = cryptos.find((c) => c.symbol === symbol);
    const quantity = quantities[symbol];
    
    if (!crypto || !quantity || quantity <= 0) {
      showModal('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    try {
      await portfolioService.buyCrypto(
        userId, 
        symbol, 
        crypto.price * quantity,
        quantity
      );
      await refreshData();
      showModal('Éxito', `Compra de ${quantity} ${symbol} realizada`, false);
    } catch (error) {
      showModal(
        'Error', 
        error.message.includes("Saldo insuficiente") 
          ? `No tienes suficiente saldo para comprar ${quantity} ${symbol}`
          : error.message
      );
    }
  };

  const sellHandler = async (symbol) => {
    const crypto = cryptos.find((c) => c.symbol === symbol);
    const quantity = quantities[symbol];
    
    if (!crypto || !quantity || quantity <= 0) {
      showModal('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    try {
      await portfolioService.sellCrypto(
        userId, 
        symbol, 
        crypto.price * quantity,
        quantity
      );
      await refreshData();
      showModal('Éxito', `Venta de ${quantity} ${symbol} realizada`, false);
    } catch (error) {
      showModal(
        'Error', 
        error.message.includes("cantidad") 
          ? `No tienes suficiente cantidad de ${symbol} para vender`
          : error.message
      );
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      showModal('Error', 'No se pudo cerrar la sesión');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount)) {
      showModal('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    if (parseFloat(depositAmount) <= 0) {
      showModal('Error', 'La cantidad debe ser mayor a cero');
      return;
    }

    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      showModal('Error', 'Por favor completa todos los datos de la tarjeta');
      return;
    }

    if (cardDetails.number.length !== 16 || !/^\d+$/.test(cardDetails.number)) {
      showModal('Error', 'El número de tarjeta debe tener 16 dígitos');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      showModal('Error', 'La fecha de expiración debe tener el formato MM/AA');
      return;
    }

    if (cardDetails.cvv.length !== 3 || !/^\d+$/.test(cardDetails.cvv)) {
      showModal('Error', 'El CVV debe tener 3 dígitos');
      return;
    }

    try {
      // Simulamos un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      await portfolioService.addFunds(userId, parseFloat(depositAmount));
      await refreshData();
      showModal('Éxito', `$${depositAmount} agregados a tu saldo`, false);
      setShowDepositModal(false);
      setDepositAmount('');
      setCardDetails({ number: '', expiry: '', cvv: '' });
    } catch (error) {
      showModal('Error', 'No se pudo completar la transacción');
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    // Formateo especial para la fecha de expiración
    if (name === 'expiry' && value.length === 2 && !value.includes('/')) {
      setCardDetails(prev => ({
        ...prev,
        [name]: value + '/'
      }));
      return;
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const portfolioValue = Object.entries(portfolio).reduce(
    (total, [symbol, qty]) => {
      const crypto = cryptos.find((c) => c.symbol === symbol);
      return total + (crypto ? crypto.price * qty : 0);
    },
    0
  );

  return (
    <div className="dashboard">
      <div className="balance">
        💰 Saldo: ${Number(balance || 0).toFixed(2)} | 
        📈 Valor Portafolio: ${portfolioValue.toFixed(2)}
        <button 
          onClick={() => setShowDepositModal(true)}
          className="deposit-button"
          style={{
            float: 'right',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Ingresar Dinero
        </button>
        <button 
          onClick={handleLogout}
          className="logout-button"
          style={{
            float: 'right',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span 
              className="close-modal" 
              onClick={() => setShowDepositModal(false)}
              style={{
                float: 'right',
                cursor: 'pointer',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              &times;
            </span>
            <h3>Ingresar Dinero</h3>
            <div className="form-group">
              <label>Cantidad a ingresar (USD)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Ej: 100.00"
              />
            </div>
            
            <div className="form-group">
              <label>Tarjeta de Crédito/Débito</label>
              <input
                type="text"
                name="number"
                value={cardDetails.number}
                onChange={handleCardChange}
                placeholder="Número de tarjeta (16 dígitos)"
                maxLength="16"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha Expiración</label>
                <input
                  type="text"
                  name="expiry"
                  value={cardDetails.expiry}
                  onChange={handleCardChange}
                  placeholder="MM/AA"
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleCardChange}
                  placeholder="CVV (3 dígitos)"
                  maxLength="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowDepositModal(false)}
                style={{
                  background: '#f1f1f1',
                  color: '#333',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeposit} 
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Confirmar Depósito
              </button>
            </div>
            
            <div className="disclaimer">
              <small>Esta es una simulación. No se realizarán cargos reales a tu tarjeta.</small>
            </div>
          </div>
        </div>
      )}

      <div className="crypto-grid">
        {cryptos.map((crypto) => (
          <div key={crypto.symbol} className="crypto-card">
            <h3>
              {crypto.name} ({crypto.symbol})
            </h3>
            <div className="price">
              ${crypto.price?.toFixed(2)}{" "}
              <span className={crypto.change24h >= 0 ? "change positive" : "change negative"}>
                {crypto.change24h >= 0 ? "+" : ""}
                {crypto.change24h?.toFixed(2)}%
              </span>
            </div>

            <Line
              data={{
                labels: crypto.history?.map((_, i) => {
                  const now = new Date();
                  const time = new Date(now.getTime() - (20 - i) * 60 * 1000);
                  return time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }) || [],
                datasets: [
                  {
                    label: crypto.symbol,
                    data: crypto.history || [],
                    borderColor: "#00ff88",
                    backgroundColor: "rgba(0, 255, 136, 0.15)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#00ff88",
                    pointHoverBackgroundColor: "#00cc6a",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                animation: {
                  duration: 500,
                  easing: "easeOutQuad",
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                      label: function (context) {
                        return `Precio: $${context.parsed.y.toFixed(2)}`;
                      },
                    },
                  },
                },
                interaction: {
                  mode: "nearest",
                  axis: "x",
                  intersect: false,
                },
                scales: {
                  x: {
                    display: true,
                    title: {
                      display: true,
                      text: "Hora",
                      color: "#aaa",
                      font: { size: 14 },
                    },
                    grid: { display: false },
                    ticks: {
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 6,
                      color: "#888",
                    },
                  },
                  y: {
                    display: true,
                    title: {
                      display: true,
                      text: "Precio (USD)",
                      color: "#aaa",
                      font: { size: 14 },
                    },
                    grid: {
                      color: "rgba(0,0,0,0.1)",
                    },
                    ticks: {
                      callback: (value) =>
                        `$${value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                      color: "#888",
                    },
                  },
                },
              }}
            />

            <div className="actions">
              <div className="quantity-control">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantities[crypto.symbol] || ''}
                  onChange={(e) => handleQuantityChange(
                    crypto.symbol, 
                    parseFloat(e.target.value))
                  }
                  placeholder="Cantidad"
                />
              </div>
              <button onClick={() => buyHandler(crypto.symbol)}>Comprar</button>
              <button onClick={() => sellHandler(crypto.symbol)}>Vender</button>
            </div>

            <div className="owned">
              Tienes: {portfolio[crypto.symbol] || 0} {crypto.symbol}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dash;