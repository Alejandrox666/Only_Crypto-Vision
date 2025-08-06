import api from './api';

export const registerService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data; // Solo retornamos los datos básicos
    } catch (error) {
      // Mensajes de error más específicos
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al conectar con el servidor');
    }
  }
};