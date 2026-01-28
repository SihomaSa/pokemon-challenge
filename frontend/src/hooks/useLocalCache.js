import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar caché en localStorage
 * 
 * @param {string} key - Clave para el localStorage
 * @param {any} initialValue - Valor inicial si no existe en caché
 * @param {number} ttl - Tiempo de vida en milisegundos (default: 1 hora)
 * @returns {[any, Function]} [valor, función para actualizar]
 */
function useLocalCache(key, initialValue = null, ttl = 3600000) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      
      // Verificar si el caché ha expirado
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.data;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return initialValue;
    }
  });

  const updateValue = (newValue) => {
    try {
      setValue(newValue);
      
      const item = {
        data: newValue,
        expiry: Date.now() + ttl
      };
      
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  };

  return [value, updateValue];
}

export default useLocalCache;