# StyleVIP — App de Barbería

Aplicación móvil para Android desarrollada con React Native + Expo para la gestión de reservas de una barbería.

## Funcionalidades

### Cliente
- Selección de servicios con precios y duraciones
- Calendario con disponibilidad en tiempo real
- Reserva sin necesidad de crear cuenta
- Pago online (MercadoPago) o en efectivo
- Correo de confirmación automático
- Correo recordatorio 1 hora antes de la cita
- Cancelación de reserva desde la app

### Barbero
- Acceso con PIN
- Agenda del día con detalle de cada cita
- Agenda semanal
- Marcar citas como completadas o no asistidas

### Administrador
- Gestión de servicios y precios
- Configuración de horarios de atención
- Bloqueo de días o franjas horarias
- Historial completo de reservas
- Resumen de ingresos

## Stack tecnológico

- **TypeScript**
- **React Native + Expo**
- **React Navigation**
- **Supabase** (PostgreSQL + Edge Functions)
- **MercadoPago** (pagos online)
- **Resend** (correos automáticos)

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
   npm install
```
3. Copia `.env.example` a `.env` y completa las variables
4. Ejecuta la app:
```bash
   npx expo start --android
```

## Variables de entorno

Copia `.env.example` a `.env` y completa con tus credenciales:
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RESEND_API_KEY=
EXPO_PUBLIC_MP_PUBLIC_KEY=
EXPO_PUBLIC_MP_ACCESS_TOKEN=

## Desarrollado por

Alison Urrea — [GitHub](https://github.com/alysph)