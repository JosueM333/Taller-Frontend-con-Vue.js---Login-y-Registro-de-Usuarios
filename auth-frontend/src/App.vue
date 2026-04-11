<!--
  Archivo: src/App.vue
  Propósito: Componente raíz de la aplicación
  
  <router-view> es donde Vue Router renderiza el componente
  correspondiente a la ruta actual
-->
<template>
  <div id="app">
    <!-- Barra de navegación -->
    <nav class="navbar">
      <router-link to="/" class="brand">Control de Acceso</router-link>
      
      <div class="nav-links">
        <router-link to="/">Inicio</router-link>
        
        <!-- Mostrar según estado de autenticación -->
        <template v-if="!isAuthenticated">
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Registro</router-link>
        </template>
        
        <template v-else>
          <router-link to="/profile">Perfil</router-link>
          <router-link to="/payment">Datos Privados</router-link>
          <a href="#" @click.prevent="logout">Salir</a>
        </template>
      </div>
    </nav>

    <!-- Aquí se renderizan las vistas según la ruta -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from './services/authService'

const router = useRouter()

const isAuthenticated = computed(() => authService.isAuthenticated())

const logout = () => {
  authService.logout()
  router.push('/login')
}
</script>

<style>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

/* Navbar */
.navbar {
  background: #0A2540;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #1a3c63;
}

.brand {
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: #a0aec0;
  font-weight: 500;
  transition: color 0.2s;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.nav-links a:hover {
  color: #ffffff;
}

.nav-links a.router-link-active {
  color: #ffffff;
  border-bottom: 2px solid #ffffff;
}

/* Main content */
main {
  /* El contenido principal no necesita estilos aquí */
  /* Cada vista define su propio contenedor */
}
</style>
