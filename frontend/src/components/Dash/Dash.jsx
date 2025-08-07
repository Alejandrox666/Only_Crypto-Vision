import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./Dash.css";
import { portfolioService } from '../../services/cryptoService'; // Asegúrate del path correcto

const userId = 1; // Ajusta según el usuario autenticado

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

  // 🔁 Refrescar desde backend
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

  // Simulación de precios
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos((prevCryptos) =>
        prevCryptos.map((crypto) => {
          const lastPrice = crypto.price;
          const changePercent = (Math.random() - 0.5) * 0.004;
          const newPrice = lastPrice * (1 + changePercent);
          const newHistory = [...crypto.history.slice(1), newPrice];
          const change24h =
            ((newPrice - newHistory[0]) / newHistory[0]) * 100;

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

  const buyHandler = async (symbol) => {
    const crypto = cryptos.find((c) => c.symbol === symbol);
    if (!crypto) return;
    try {
      await portfolioService.buyCrypto(userId, symbol, crypto.price);
      await refreshData(); // Actualiza portafolio y saldo
    } catch (error) {
       // Crea el modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'custom-modal-overlay';
    
    modalOverlay.innerHTML = `
      <div class="custom-modal">
        <h3>${error.message.includes("Saldo insuficiente") ? '❌ Saldo insuficiente' : 'Error'}</h3>
        <p>${error.message.includes("Saldo insuficiente") 
          ? 'No tienes fondos suficientes para esta compra' 
          : error.message}</p>
        <button onclick="this.closest('.custom-modal-overlay').remove()">Aceptar</button>
      </div>
    `;
    
    document.body.appendChild(modalOverlay);
  }
  };

  const sellHandler = async (symbol) => {
    const crypto = cryptos.find((c) => c.symbol === symbol);
    if (!crypto) return;
    try {
      await portfolioService.sellCrypto(userId, symbol, crypto.price);
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
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
  💰 Saldo: ${Number(balance || 0).toFixed(2)} | {/* Cambio clave aquí */}
  📈 Valor Portafolio: ${portfolioValue.toFixed(2)}
</div>

      <div className="crypto-grid">
        {cryptos.map((crypto) => (
          <div key={crypto.symbol} className="crypto-card">
            <h3>
              {crypto.name} ({crypto.symbol})
            </h3>
            <div className="price">
              ${crypto.price?.toFixed(2)}{" "}
              <span
                className={
                  crypto.change24h >= 0 ? "change positive" : "change negative"
                }
              >
                {crypto.change24h >= 0 ? "+" : ""}
                {crypto.change24h?.toFixed(2)}%
              </span>
            </div>

            <Line
              data={{
                labels:
                  crypto.history?.map((_, i) => {
                    const now = new Date();
                    const time = new Date(
                      now.getTime() - (20 - i) * 60 * 1000
                    );
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
