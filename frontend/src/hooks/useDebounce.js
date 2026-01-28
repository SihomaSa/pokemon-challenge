import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debouncing
 * Retrasa la actualización del valor hasta que el usuario deje de escribir
 * 
 * @param {any} value - Valor a aplicar debounce
 * @param {number} delay - Retraso en milisegundos (default: 500ms)
 * @returns {any} Valor con debounce aplicado
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer timeout para actualizar el valor
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;