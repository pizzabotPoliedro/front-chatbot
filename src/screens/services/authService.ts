import api from './api';

export const login = async (email: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await api.post('/login', formData);
    return response.data;
  } catch (error: any) {
    console.error('Erro no login:', error.response?.data || error.message);
    throw error;
  }
};

export const signup = async (data: {
  email: string;
  password: string;
  name: string;
  phone: string;
  restaurant: boolean;
  image?: File | null;
}) => {
  try {
    const formData = new FormData();

    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('restaurant', String(data.restaurant));

    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro no signup:', error.response?.data || error.message);
    throw error;
  }
};




