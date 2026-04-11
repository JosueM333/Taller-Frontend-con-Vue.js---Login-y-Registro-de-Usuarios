<template>
  <div class="payment-container">
    <div class="payment-card-wrapper">
      <h1 class="title">Billetera Segura</h1>
      <p class="subtitle">Tus datos están protegidos por tokens de sesión y encriptación en tránsito.</p>
      
      <div v-if="isLoading" class="loading">Cargando datos protegidos...</div>
      
      <div v-else class="content-split">
        
        <!-- Tarjeta Visual Interactiva -->
        <div class="card-visual" :class="{ 'flipped': isFlipped }">
          <div class="card-inner">
            <div class="card-front">
              <div class="card-logo">
                <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12.5" cy="12.5" r="12.5" fill="#EB001B" fill-opacity="0.8"/>
                  <circle cx="27.5" cy="12.5" r="12.5" fill="#F79E1B" fill-opacity="0.8"/>
                </svg>
              </div>
              <div class="chip"></div>
              <div class="card-number-display">
                {{ formatCardNumberDisplay(form.cardNumber) }}
              </div>
              <div class="card-details">
                <div class="card-holder">
                  <span class="label">Titular de la Tarjeta</span>
                  <span class="value">{{ form.cardName || 'JUAN PEREZ' }}</span>
                </div>
                <div class="card-expiry">
                  <span class="label">Vence</span>
                  <span class="value">{{ form.expirationDate || 'MM/YY' }}</span>
                </div>
              </div>
            </div>
            <div class="card-back">
              <div class="magnetic-strip"></div>
              <div class="cvv-strip">
                <span>{{ form.cvv || '***' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <div class="form-container glass-panel">
          <form @submit.prevent="savePaymentData" class="payment-form">
            <div class="form-group">
              <label>Número de Tarjeta</label>
              <input 
                type="text" 
                v-model="form.cardNumber" 
                @input="formatCardNumber"
                @focus="isFlipped = false"
                placeholder="0000 0000 0000 0000" 
                maxlength="19"
                required
              />
            </div>
            <div class="form-group">
              <label>Nombre del Titular</label>
              <input 
                type="text" 
                v-model="form.cardName" 
                @focus="isFlipped = false"
                placeholder="Ej. Juan Perez" 
                @input="toUpperCase"
                required
              />
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>Vencimiento</label>
                <input 
                  type="text" 
                  v-model="form.expirationDate" 
                  @input="formatExpiry"
                  @focus="isFlipped = false"
                  placeholder="MM/YY" 
                  maxlength="5"
                  required
                />
              </div>
              <div class="form-group half">
                <label>CVV</label>
                <input 
                  type="password" 
                  v-model="form.cvv" 
                  @focus="isFlipped = true"
                  @blur="isFlipped = false"
                  placeholder="123" 
                  maxlength="4"
                  required
                />
              </div>
            </div>

            <div v-if="successMessage" class="alert success-alert">{{ successMessage }}</div>
            <div v-if="errorMessage" class="alert error-alert">{{ errorMessage }}</div>

            <button type="submit" class="btn-save" :disabled="isSaving">
              <span v-if="!isSaving">Guardar Datos Protegidos</span>
              <span v-else class="spinner"></span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService'

const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const isFlipped = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  cardNumber: '',
  cardName: '',
  expirationDate: '',
  cvv: ''
})

const formatCardNumberDisplay = (number) => {
  if (!number) return '**** **** **** ****'
  // Completar con asteriscos si no está lleno
  const clean = number.replace(/\s/g, '')
  const padded = clean.padEnd(16, '*')
  return padded.match(/.{1,4}/g).join(' ')
}

const formatCardNumber = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  val = val.substring(0, 16)
  const matches = val.match(/.{1,4}/g)
  form.cardNumber = matches ? matches.join(' ') : ''
}

const toUpperCase = () => {
  form.cardName = form.cardName.toUpperCase()
}

const formatExpiry = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  if (val.length >= 2) {
    val = val.substring(0, 2) + '/' + val.substring(2, 4)
  }
  form.expirationDate = val
}

const loadPaymentInfo = async () => {
  try {
    const data = await authService.getPaymentInfo()
    if (data) {
      form.cardNumber = data.cardNumber || ''
      form.cardName = data.cardName || ''
      form.expirationDate = data.expirationDate || ''
      form.cvv = data.cvv || ''
    }
  } catch (error) {
    errorMessage.value = 'Sesión expirada o inválida. Redirigiendo...'
    setTimeout(() => {
      authService.logout()
      router.push('/login')
    }, 2000)
  } finally {
    isLoading.value = false
  }
}

const savePaymentData = async () => {
  // Validación básica frontend
  if (form.cardNumber.replace(/\s/g, '').length < 16) {
    errorMessage.value = 'El número de tarjeta es inválido.'
    return
  }
  if (!form.expirationDate.includes('/') || form.expirationDate.length !== 5) {
    errorMessage.value = 'La fecha de vencimiento es inválida.'
    return
  }
  if (form.cvv.length < 3) {
    errorMessage.value = 'El CVV debe tener al menos 3 dígitos.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authService.savePaymentInfo(form)
    successMessage.value = '¡Datos guardados con éxito en bóveda!'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    errorMessage.value = error.message || 'Error al guardar. Verifica tu sesión.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadPaymentInfo()
})
</script>

<style scoped>
/* Estéticas Premium */
.payment-container {
  min-height: calc(100vh - 64px); /* Menos el espacio del navbar */
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 40px 20px;
  color: #f8fafc;
  overflow: hidden;
  position: relative;
}

/* Luces abstractas del fondo */
.payment-container::before,
.payment-container::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.5;
  animation: float 10s infinite alternate cubic-bezier(0.1, 0.4, 0.9, 0.6);
}
.payment-container::before {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
  top: -100px;
  left: -100px;
}
.payment-container::after {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%);
  bottom: -100px;
  right: -100px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(50px) scale(1.1); }
}

.payment-card-wrapper {
  z-index: 1;
  width: 100%;
  max-width: 900px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(to right, #e2e8f0, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

.content-split {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
  align-items: center;
}

@media (max-width: 768px) {
  .content-split {
    grid-template-columns: 1fr;
  }
}

/* Glassmorphism Panel */
.glass-panel {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Formularios Premium */
.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .half {
  flex: 1;
}

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: white;
  padding: 14px 16px;
  border-radius: 10px;
  font-family: monospace;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  outline: none;
}

input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
  background: rgba(15, 23, 42, 0.8);
}

/* Tarjeta Visual CSS */
.card-visual {
  perspective: 1000px;
  width: 100%;
  max-width: 380px;
  aspect-ratio: 1.586;
  margin: 0 auto;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-visual.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.card-front::after {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-20deg);
}

.card-logo {
  text-align: right;
}

.chip {
  width: 45px;
  height: 35px;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 45 35" xmlns="http://www.w3.org/2000/svg"><path d="M5,0 h35 a5,5 0 0,1 5,5 v25 a5,5 0 0,1 -5,5 h-35 a5,5 0 0,1 -5,-5 v-25 a5,5 0 0,1 5,-5 Z" fill="%23d4af37"/><path d="M10,0 v35 M20,0 v35 M30,0 v35 M0,10 h45 M0,20 h45 M0,30 h45" stroke="%23b89b33" stroke-width="1.5"/></svg>') center/contain no-repeat;
  margin-top: 10px;
  border-radius: 4px;
}

.card-number-display {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.8rem;
  letter-spacing: 2px;
  margin-top: 20px;
  color: #f8fafc;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.card-details {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.card-details .label {
  font-size: 0.6rem;
  color: #94a3b8;
  margin-bottom: 2px;
}

.card-details .value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.1rem;
  text-transform: uppercase;
}

.card-back {
  transform: rotateY(180deg);
  padding: 0;
}

.magnetic-strip {
  width: 100%;
  height: 45px;
  background: #000;
  margin-top: 25px;
}

.cvv-strip {
  background: #cbd5e1;
  width: 80%;
  height: 40px;
  margin: 20px auto;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 15px;
}

.cvv-strip span {
  color: #0f172a;
  font-family: monospace;
  font-style: italic;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Botón e interacciones */
.btn-save {
  width: 100%;
  padding: 16px;
  background: linear-gradient(to right, #3b82f6, #0ea5e9);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -10px rgba(59, 130, 246, 0.6);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.success-alert {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fb7185;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #94a3b8;
  padding: 40px;
}
</style>
