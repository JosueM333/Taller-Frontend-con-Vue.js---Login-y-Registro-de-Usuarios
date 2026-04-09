/**
 * Archivo: src/services/api.js
 * Propósito: Configurar Axios como cliente HTTP para comunicarse con el backend
 * 
 * Este archivo centraliza la configuración de las peticiones HTTP.
 * Usamos interceptores para agregar automáticamente el token a cada petición.
 */

import axios from 'axios'

// Crear instancia de Axios con configuración base
// baseURL: Todas las peticiones usarán esta URL como prefijo
// Ejemplo: api.get('/auth/login') → GET http://localhost:3000/auth/login
const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * INTERCEPTOR DE PETICIONES (Request Interceptor)
 * 
 * Se ejecuta ANTES de cada petición HTTP.
 * Aquí agregamos el token de autenticación si existe.
 */
api.interceptors.request.use(
    (config) => {
        // En lugar de inyectar el Authorization header manually, Axios enviará
        // automáticamente las cookies HttpOnly (mitigando Test 7: XSS)
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * INTERCEPTOR DE RESPUESTAS (Response Interceptor)
 * 
 * Se ejecuta DESPUÉS de recibir cada respuesta.
 * Útil para manejar errores globales como token expirado.
 */
api.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa, simplemente la retornamos
        return response
    },
    (error) => {
        // Si el error es 401 (No autorizado), el token probablemente expiró
        if (error.response && error.response.status === 401) {
            // Eliminar estado loggeado del frontend (Test 1 & 4)
            localStorage.removeItem('logged_in');
            localStorage.removeItem('auth_user');

            // Opcional: Redirigir al login
            // window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

// Exportar la instancia configurada para usar en toda la aplicación
export default api
