import { createContext, useContext, useState, ReactNode } from 'react';

type Servicio = {
  id: string;
  nombre: string;
  precio: number;
  duracion_minutos: number;
};

type ReservaContextType = {
  serviciosSeleccionados: Servicio[];
  setServiciosSeleccionados: (s: Servicio[]) => void;
  fechaSeleccionada: string;
  setFechaSeleccionada: (f: string) => void;
  horaSeleccionada: string;
  setHoraSeleccionada: (h: string) => void;
  metodoPago: string;
  setMetodoPago: (m: string) => void;
  clienteId: string;
  setClienteId: (id: string) => void;
  reservaId: string;
  setReservaId: (id: string) => void;
  totalPrecio: number;
  totalMinutos: number;
  resetReserva: () => void;
};

const ReservaContext = createContext<ReservaContextType | null>(null);

export function ReservaProvider({ children }: { children: ReactNode }) {
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Servicio[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [reservaId, setReservaId] = useState('');

  const totalPrecio = serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0);
  const totalMinutos = serviciosSeleccionados.reduce((sum, s) => sum + s.duracion_minutos, 0);

  function resetReserva() {
    setServiciosSeleccionados([]);
    setFechaSeleccionada('');
    setHoraSeleccionada('');
    setMetodoPago('');
    setClienteId('');
    setReservaId('');
  }

  return (
    <ReservaContext.Provider value={{
      serviciosSeleccionados, setServiciosSeleccionados,
      fechaSeleccionada, setFechaSeleccionada,
      horaSeleccionada, setHoraSeleccionada,
      metodoPago, setMetodoPago,
      clienteId, setClienteId,
      reservaId, setReservaId,
      totalPrecio, totalMinutos,
      resetReserva,
    }}>
      {children}
    </ReservaContext.Provider>
  );
}

export function useReserva() {
  const context = useContext(ReservaContext);
  if (!context) throw new Error('useReserva debe usarse dentro de ReservaProvider');
  return context;
}