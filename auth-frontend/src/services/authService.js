/**
 * Archivo: src/services/authService.js
 * Propósito: Centralizar todas las operaciones relacionadas con autenticación
 * 
 * Este servicio encapsula:
 * - Login de usuarios
 * - Registro de nuevos usuarios
 * - Obtener perfil del usuario autenticado
 * - Logout
 */

import api from './api'

/**
 * Servicio de Autenticación
 * Contiene todos los métodos para manejar la autenticación de usuarios
 */
const authService = {

    /**
     * Registrar un nuevo usuario
     * @param {Object} userData - Datos del usuario {email, password, name}
     * @returns {Promise} - Promesa con la respuesta del servidor
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData)
            return response.data
        } catch (error) {
            // Re-lanzar el error para manejarlo en el componente
            throw error.response?.data || { message: 'Error de conexión' }
        }
    },

    /**
     * Iniciar sesión
     * @param {Object} credentials - Credenciales {email, password}
     * @returns {Promise} - Promesa con el token de acceso
     */
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials)

            // Guardar estado loggeado y refresh token
            if (response.data.refresh_token) {
                localStorage.setItem('logged_in', 'true')
                localStorage.setItem('refresh_token', response.data.refresh_token)
                localStorage.setItem('auth_user', JSON.stringify(response.data.user))
            }

            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        }
    },

    /**
     * Obtener el perfil del usuario autenticado
     * @returns {Promise} - Promesa con los datos del usuario
     */
    async getProfile() {
        try {
            const response = await api.get('/auth/profile')
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener perfil' }
        }
    },

    /**
     * Cerrar sesión invocando al backend (Test 1)
     */
    async logout() {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Error al revocar sesión en el backend', error)
        } finally {
            localStorage.removeItem('logged_in')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('auth_user')
        }
    },

    /**
     * Refrescar el token
     */
    async refresh() {
        try {
            const refreshToken = localStorage.getItem('refresh_token')
            const userStr = localStorage.getItem('auth_user')
            if (!refreshToken || !userStr) throw new Error('No hay refresh token activo')

            const user = JSON.parse(userStr)
            const response = await api.post('/auth/refresh', {
                refresh_token: refreshToken,
                userId: user.id
            })

            localStorage.setItem('refresh_token', response.data.refresh_token)
            return response.data
        } catch (error) {
            this.logout()
            throw error
        }
    },

    /**
     * Guardar información de pago (simulado para probar tokens)
     * @param {Object} paymentData - Datos de tarjeta
     */
    async savePaymentInfo(paymentData) {
        try {
            const response = await api.post('/auth/payment-info', paymentData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        }
    },

    /**
     * Obtener información de pago
     */
    async getPaymentInfo() {
        try {
            const response = await api.get('/auth/payment-info')
            return response.data.paymentInfo
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' }
        }
    },

    /**
     * Verificar si hay un usuario autenticado basado en flag
     * @returns {boolean} - true si parece estar loggeado
     */
    isAuthenticated() {
        return !!localStorage.getItem('logged_in')
    },

    /**
     * Obtener el token actual (Reemplazado por Cookies HttpOnly)
     * @returns {null} - Ya no es accesible por JS
     */
    getToken() {
        return null
    }
}

export default authService
