
import { STORAGE_KEYS, seedMesas, load } from '../storage.js';

export function ConsultarMesas() {
  const mesas = load(STORAGE_KEYS.mesas, seedMesas);

  const wrap = document.createElement('section');
  wrap.className = 'panel';

  const filtros = document.createElement('div');
  filtros.className = 'grid cols-3';
  filtros.innerHTML = `
    <div class="field">
      <label for="lugares">Lugares</label>
      <select id="lugares">
        <option value="">Qualquer</option>
        <option value="2">2</option>
        <option value="4">4</option>
        <option value="6">6</option>
      </select>
    </div>
    <div class="field">
      <label for="local">Local</label>
      <select id="local">
        <option value="">Todos</option>
        <option>Salão</option>
        <option>Varanda</option>
        <option>Janela</option>
      </select>
    </div>
    <div class="field">
      <label for="status">Status</label>
      <select id="status">
        <option value="">Todos</option>
        <option value="livre">Livre</option>
        <option value="ocupada">Ocupada</option>
      </select>
    </div>
  `;

  const tabela = document.createElement('div');
  tabela.innerHTML = `
    <table class="table" aria-label="Tabela de mesas">
      <thead>
        <tr>
          <th>#</th>
          <th>Lugares</th>
          <th>Local</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = tabela.querySelector('tbody');

  function render() {
    const fLugares = filtros.querySelector('#lugares').value;
    const fLocal = filtros.querySelector('#local').value;
    const fStatus = filtros.querySelector('#status').value;

    tbody.innerHTML = '';
    mesas
      .filter(m => (fLugares ? m.lugares === Number(fLugares) : true))
      .filter(m => (fLocal ? m.local === fLocal : true))
      .filter(m => (fStatus ? m.status === fStatus : true))
      .forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.id}</td>
          <td>${m.lugares}</td>
          <td>${m.local}</td>
          <td>
            <span class="badge ${m.status === 'livre' ? 'ok' : 'busy'}">
              ${m.status}
            </span>
          </td>
          <td>
            <div class="row">
              <a class="btn" href="#/fazer-reserva" data-id="${m.id}">Reservar</a>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

    if (!tbody.children.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5; td.className = 'empty'; td.textContent = 'Nenhuma mesa encontrada';
      tr.appendChild(td); tbody.appendChild(tr);
    }
  }

  filtros.addEventListener('change', render);
  tabela.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-id]');
    if (a) {
      sessionStorage.setItem('ptac_selected_table', a.getAttribute('data-id'));
    }
  });

  const title = document.createElement('h2');
  title.textContent = 'Consultar Mesas';
  wrap.appendChild(title);
  wrap.appendChild(filtros);
  wrap.appendChild(document.createElement('br'));
  wrap.appendChild(tabela);

  render();
  return wrap;
}
