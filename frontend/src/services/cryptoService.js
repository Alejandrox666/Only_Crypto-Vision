// services/portfolioService.js
import api from './api';

export const portfolioService = {
  async getPortfolio(userId) {
    try {
      const response = await api.get(`crypto/portfolio/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error al obtener portafolio"
      );
    }
  },

  async buyCrypto(userId, symbol, price) {
    try {
      const response = await api.post('crypto/buy', { userId, symbol, price });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error al comprar"
      );
    }
  },

  async sellCrypto(userId, symbol, price) {
    try {
      const response = await api.post('crypto/sell', { userId, symbol, price });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error al vender"
      );
    }
  }
};
