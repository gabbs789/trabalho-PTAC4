

export function formatDateTimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
