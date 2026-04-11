export class User {
  id: number;           // autoincremental (simulado)
  nombre: string;       // nombre del usuario
  email: string;        // email único
  password: string;     // hash bcrypt (no texto plano)
  createdAt: Date;      // fecha de creación
  sessionId?: string;   // Controla las sesiones activas (sesiones concurrentes limitadas)
  paymentInfo?: {       // Simula datos protegidos sensibles guardados en memoria
    cardNumber: string;
    cardName: string;
    expirationDate: string;
    cvv: string;
  };
}
