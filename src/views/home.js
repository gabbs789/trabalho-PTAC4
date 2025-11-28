
export function Home() {
  const wrap = document.createElement('section');
  wrap.className = 'panel';
  wrap.innerHTML = `
    <h2>Bem-vindo</h2>
    <p>Use o menu para acessar as funcionalidades:</p>
    <ul>
      <li>Consultar Mesas</li>
      <li>Listar Reservas</li>
      <li>Fazer Reserva</li>
    </ul>
  `;
  return wrap;
}
