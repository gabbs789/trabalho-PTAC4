
import { STORAGE_KEYS, seedMesas, load, save } from '../storage.js';
import { formatDateTimeLocal } from '../utils.js';

export function ListarReservas() {
  const wrap = document.createElement('section');
  wrap.className = 'panel';

  const title = document.createElement('h2');
  title.textContent = 'Listar Reservas';
  wrap.appendChild(title);

  const tableWrap = document.createElement('div');
  tableWrap.innerHTML = `
    <table class="table" aria-label="Lista de reservas">
      <thead>
        <tr>
          <th>Código</th>
          <th>Mesa</th>
          <th>Nome</th>
          <th>Pessoas</th>
          <th>Data/Hora</th>
          <th>Contato</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = tableWrap.querySelector('tbody');

  function render() {
    const reservasData = load(STORAGE_KEYS.reservas, []);
    const mesas = load(STORAGE_KEYS.mesas, seedMesas);
    tbody.innerHTML = '';
    reservasData.forEach(r => {
      const mesa = mesas.find(m => m.id === r.mesaId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>#${r.mesaId} (${mesa ? mesa.local : '?'})</td>
        <td>${r.nome}</td>
        <td>${r.pessoas}</td>
        <td>${formatDateTimeLocal(r.dataHora)}</td>
        <td>${r.contato}</td>
        <td class="row">
          <button class="btn danger" data-cancel="${r.id}">Cancelar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (!tbody.children.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7; td.className = 'empty'; td.textContent = 'Nenhuma reserva cadastrada';
      tr.appendChild(td); tbody.appendChild(tr);
    }
  }

  tableWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cancel]');
    if (btn) {
      const id = btn.getAttribute('data-cancel');
      const reservas = load(STORAGE_KEYS.reservas, []);
      const r = reservas.find(x => x.id === id);
      if (!r) return;
  
      const mesas = load(STORAGE_KEYS.mesas, seedMesas);
      const mesa = mesas.find(m => m.id === r.mesaId);
      if (mesa) mesa.status = 'livre';
      save(STORAGE_KEYS.mesas, mesas);
   
      const novas = reservas.filter(x => x.id !== id);
      save(STORAGE_KEYS.reservas, novas);
      render();
      alert('Reserva cancelada com sucesso.');
    }
  });

  wrap.appendChild(tableWrap);
  render();
  return wrap;
}
