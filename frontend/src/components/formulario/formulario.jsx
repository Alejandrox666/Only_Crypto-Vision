// src/components/CryptoRisks.js
import './formulario.css';
import { useNavigate } from "react-router-dom";

const Formulario = () => {
    const navigate = useNavigate();
  return (
    
    <div className="crypto-container">
      <h1 className="title">Guía Completa para Invertir en Criptomonedas</h1>
      <p className="subtitle">
        Entiende los riesgos, las estrategias y la tecnología detrás de las finanzas digitales del futuro.
      </p>

      {/* Sección 1: Introducción y Riesgos */}
      <div className="section">
        <h2>Riesgos de la Inversión en Criptoactivos ⚠️</h2>
        <p>
          Invertir en criptomonedas no está exento de riesgos. Es fundamental conocerlos antes de tomar cualquier decisión. La naturaleza de este mercado, descentralizada y global, presenta desafíos únicos.
        </p>
        <ul className="risk-list">
          <li>
            <strong>Volatilidad Extrema:</strong> Los precios de las criptomonedas pueden fluctuar en un 20% o más en un solo día. Esto significa que puedes obtener grandes ganancias o sufrir pérdidas significativas en un corto período de tiempo.
          </li>
          <li>
            <strong>Riesgo de Seguridad y Ciberataques:</strong> Los exchanges y monederos digitales pueden ser vulnerables a hackeos. Es crucial utilizar autenticación de dos factores (2FA) y monederos fríos (hardware wallets) para proteger tus activos.
          </li>
          <li>
            <strong>Riesgos Regulatorios:</strong> Los gobiernos de todo el mundo están debatiendo cómo regular las criptomonedas. Una nueva ley o prohibición en un país importante puede afectar negativamente el precio de todo el mercado.
          </li>
          <li>
            <strong>Riesgo de Estafas (Scams):</strong> El ecosistema cripto atrae a estafadores que crean proyectos fraudulentos (llamados "rug pulls") o esquemas piramidales. Siempre investiga a fondo un proyecto antes de invertir.
          </li>
        </ul>
      </div>

      {/* Sección 2: Fundamentos Tecnológicos */}
      <div className="section">
        <h2>¿Qué es la Tecnología Blockchain? ⛓️</h2>
        <p>
          La tecnología subyacente a las criptomonedas es la <strong>Blockchain</strong>, un libro de contabilidad digital, descentralizado e inmutable.
        </p>
        <ul className="blockchain-list">
          <li>
            <strong>Descentralización:</strong> No hay una autoridad central que controle la red, lo que la hace resistente a la censura y la manipulación.
          </li>
          <li>
            <strong>Transparencia:</strong> Todas las transacciones son públicas y verificables por cualquier persona.
          </li>
          <li>
            <strong>Inmutabilidad:</strong> Una vez que se registra una transacción en la cadena de bloques, no se puede alterar ni eliminar.
          </li>
        </ul>
      </div>

      {/* Sección 3: Estrategias de Inversión */}
      <div className="section">
        <h2>Estrategias de Inversión: Cuándo Comprar y Cuándo Vender 📈</h2>
        <p>
          Aunque el mercado cripto es impredecible, los inversores exitosos siguen estrategias disciplinadas para mitigar riesgos.
        </p>
        
        <div className="strategy-card green-bg">
          <h3>Estrategia para Comprar (Estrategia DCA) 🟢</h3>
          <p>
            La estrategia de <strong>Dólar Costo Promedio (DCA)</strong> es una de las más populares. Consiste en invertir una cantidad fija de dinero a intervalos regulares (semanal, mensual), sin importar el precio del activo. Esto te permite promediar el costo de tu inversión a lo largo del tiempo, reduciendo el riesgo de comprar en el pico más alto.
          </p>
          <button className="buy-button" onClick={() => navigate('/dash')}>Comprar Ahora</button>
        </div>

        <div className="strategy-card red-bg">
          <h3>Estrategia para Vender (Toma de Ganancias) 🔴</h3>
          <p>
            Establecer un plan de salida es tan importante como el de entrada. No esperes a que el mercado caiga para vender. Una estrategia común es tomar ganancias parciales. Por ejemplo, vender el 25% de tu inversión una vez que ha subido un 50% y el otro 25% si sube otro 50%.
          </p>
          <button className="sell-button" onClick={() => navigate('/dash')}>Vender Ahora</button>
        </div>
      </div>

      {/* Sección 4: Tipos de Criptomonedas */}
      <div className="section">
        <h2>Más Allá de Bitcoin y Ethereum 🌐</h2>
        <p>
          El mercado se compone de miles de proyectos, cada uno con una función específica.
        </p>
        <div className="crypto-types">
          <div className="type-card">
            <h3>Bitcoin (BTC)</h3>
            <p>La primera y más grande criptomoneda. Es vista como una reserva de valor digital, similar al oro.</p>
          </div>
          <div className="type-card">
            <h3>Ethereum (ETH)</h3>
            <p>Una plataforma que permite a los desarrolladores crear aplicaciones descentralizadas (dApps) y contratos inteligentes.</p>
          </div>
          <div className="type-card">
            <h3>Stablecoins</h3>
            <p>Criptomonedas cuyo valor está anclado a un activo estable, como el dólar estadounidense. Son útiles para evitar la volatilidad.</p>
          </div>
          <div className="type-card">
            <h3>Altcoins</h3>
            <p>Cualquier criptomoneda que no sea Bitcoin. Hay miles, cada una con su propia tecnología y propósito.</p>
          </div>
        </div>
      </div>

      {/* Sección 5: Consideraciones Finales */}
      <div className="section">
        <h2>Consejos Adicionales ✅</h2>
        <p>
          Antes de invertir, ten en cuenta estas consideraciones finales para proteger tu capital.
        </p>
        <ul className="final-tips">
          <li><strong>Investiga:</strong> Nunca inviertas en un proyecto que no entiendas. Lee el "whitepaper" y conoce al equipo.</li>
          <li><strong>No inviertas más de lo que puedas perder:</strong> El mercado cripto es especulativo; solo usa dinero que no necesites para tus gastos diarios.</li>
          <li><strong>Diversifica:</strong> No pongas todo tu capital en un solo activo. Distribuye tu inversión en varios proyectos prometedores.</li>
        </ul>
      </div>
    </div>
  );
};

export default Formulario;