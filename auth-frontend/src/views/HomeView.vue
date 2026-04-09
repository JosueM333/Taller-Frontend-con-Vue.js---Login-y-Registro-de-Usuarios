<!--
  Archivo: src/views/HomeView.vue
  Propósito: Página de inicio pública
  
  Esta página es accesible para todos los usuarios (autenticados o no).
  Muestra opciones de navegación según el estado de autenticación.
-->
<template>
  <div class="home-container">
    <div class="home-card">
      <h1>Bienvenido</h1>
      <p class="subtitle">Sistema de Autenticación Centralizado</p>

      <div class="features">
        <div class="feature">
          <span class="icon"></span>
          <span>Autenticación JWT Segura</span>
        </div>
        <div class="feature">
          <span class="icon"></span>
          <span>Rutas Protegidas</span>
        </div>
        <div class="feature">
          <span class="icon"></span>
          <span>Vue 3 + NestJS</span>
        </div>
      </div>

      <!-- Botones según estado de autenticación -->
      <div class="actions">
        <!-- Si NO está autenticado -->
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="btn btn-primary">
            Iniciar Sesión
          </router-link>
          <router-link to="/register" class="btn btn-secondary">
            Crear Cuenta
          </router-link>
        </template>
        
        <!-- Si ESTÁ autenticado -->
        <template v-else>
          <router-link to="/profile" class="btn btn-primary">
            Ver Mi Perfil
          </router-link>
          <button @click="handleLogout" class="btn btn-secondary">
            Cerrar Sesión
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService'

const router = useRouter()

// Propiedad computada para verificar autenticación
// Se actualiza automáticamente cuando cambia el estado
const isAuthenticated = computed(() => authService.isAuthenticated())

const handleLogout = () => {
  authService.logout()
  // Forzar recarga para actualizar el estado
  router.go(0)
}
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f9fc;
  padding: 20px;
}

.home-card {
  background: white;
  padding: 50px;
  border: 1px solid #e1e4e8;
  border-radius: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

h1 {
  font-size: 36px;
  margin-bottom: 8px;
  color: #0A2540;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #4a5568;
  margin-bottom: 30px;
  font-size: 16px;
}

.features {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #edf2f7;
  border: 1px solid #e2e8f0;
  border-radius: 2px;
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.icon {
  display: none;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  display: block;
  padding: 14px 24px;
  border-radius: 2px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: #0A2540;
  color: white;
}

.btn-primary:hover {
  background: #1a3c63;
}

.btn-secondary {
  background: white;
  color: #0A2540;
  border: 2px solid #0A2540;
}

.btn-secondary:hover {
  background: #f7f9fc;
}
</style>
