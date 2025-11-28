

export const STORAGE_KEYS = {
  mesas: 'ptac_mesas',
  reservas: 'ptac_reservas'
};

export const seedMesas = [
  { id: 1, lugares: 2, local: 'Janela', status: 'livre' },
  { id: 2, lugares: 4, local: 'Salão', status: 'ocupada' },
  { id: 3, lugares: 4, local: 'Varanda', status: 'livre' },
  { id: 4, lugares: 6, local: 'Salão', status: 'livre' },
  { id: 5, lugares: 2, local: 'Varanda', status: 'ocupada' }
];

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

(function ensureSeed() {
  if (!load(STORAGE_KEYS.mesas)) save(STORAGE_KEYS.mesas, seedMesas);
  if (!load(STORAGE_KEYS.reservas)) save(STORAGE_KEYS.reservas, []);
})();
