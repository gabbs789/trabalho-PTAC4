

const STORAGE_KEYS = {
  mesas: 'ptac_mesas',
  reservas: 'ptac_reservas'
};


const seedMesas = [
  { id: 1, lugares: 2, local: 'Janela', status: 'livre' },
  { id: 2, lugares: 4, local: 'Salão', status: 'ocupada' },
  { id: 3, lugares: 4, local: 'Varanda', status: 'livre' },
  { id: 4, lugares: 6, local: 'Salão', status: 'livre' },
  { id: 5, lugares: 2, local: 'Varanda', status: 'ocupada' }
];

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// Inicializa storage uma única vez
(function ensureSeed() {
  if (!load(STORAGE_KEYS.mesas)) save(STORAGE_KEYS.mesas, seedMesas);
  if (!load(STORAGE_KEYS.reservas)) save(STORAGE_KEYS.reservas, []);
})();

// Utils
function formatDateTimeLocal(value) {
  // value: '2025-01-01T19:30'
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function uid() { return Math.random().toString(36).slice(2, 9); }

// Roteador simples
const routes = {
  '#/consultar-mesas': ConsultarMesas,
  '#/listar-reservas': ListarReservas,
  '#/fazer-reserva': FazerReserva,
  'default': Home
};

function router() {
  const hash = window.location.hash || '#/consultar-mesas';
  const view = routes[hash] || routes['default'];
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(view());
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Componentes
function Home() {
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

function ConsultarMesas() {
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

function ListarReservas() {
  const reservas = load(STORAGE_KEYS.reservas, []);
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
      // Liberar mesa
      const mesas = load(STORAGE_KEYS.mesas, seedMesas);
      const mesa = mesas.find(m => m.id === r.mesaId);
      if (mesa) mesa.status = 'livre';
      save(STORAGE_KEYS.mesas, mesas);
      // Remover reserva
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

function FazerReserva() {
  const mesas = load(STORAGE_KEYS.mesas, seedMesas);
  const selected = Number(sessionStorage.getItem('ptac_selected_table')) || '';

  const wrap = document.createElement('section');
  wrap.className = 'panel';

  const title = document.createElement('h2');
  title.textContent = 'Fazer Reserva';
  wrap.appendChild(title);

  const form = document.createElement('form');
  form.className = 'form';
  form.innerHTML = `
    <div class="grid cols-2">
      <div class="field">
        <label for="mesa">Mesa</label>
        <select id="mesa" name="mesa" required></select>
        <div class="helper">Selecione uma mesa livre</div>
      </div>
      <div class="field">
        <label for="pessoas">Número de Pessoas</label>
        <input id="pessoas" name="pessoas" type="number" min="1" max="12" required placeholder="Ex: 4" />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label for="nome">Nome</label>
        <input id="nome" name="nome" required placeholder="Nome do responsável" />
      </div>
      <div class="field">
        <label for="contato">Contato</label>
        <input id="contato" name="contato" type="tel" required placeholder="(xx) xxxxx-xxxx" />
      </div>
    </div>

    <div class="field">
      <label for="dataHora">Data e Hora</label>
      <input id="dataHora" name="dataHora" type="datetime-local" required />
    </div>

    <div class="row">
      <button class="btn" type="reset">Limpar</button>
      <button class="btn primary" type="submit">Confirmar Reserva</button>
    </div>
  `;

  // Popular select de mesas
  const selectMesa = form.querySelector('#mesa');
  const mesasLivres = mesas.filter(m => m.status === 'livre');
  selectMesa.innerHTML = '<option value="">Selecione...</option>' +
    mesasLivres.map(m => `<option value="${m.id}">#${m.id} - ${m.local} (${m.lugares} lugares)</option>`).join('');
  if (selected && mesasLivres.some(m => m.id === selected)) {
    selectMesa.value = String(selected);
  }

  // Validação simples
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const mesaId = Number(data.get('mesa'));
    const pessoas = Number(data.get('pessoas'));
    const nome = String(data.get('nome')).trim();
    const contato = String(data.get('contato')).trim();
    const dataHora = String(data.get('dataHora'));

    if (!mesaId) return alert('Selecione uma mesa.');
    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa) return alert('Mesa inválida.');
    if (mesa.status !== 'livre') return alert('Mesa não está disponível.');
    if (!nome || !contato || !dataHora || !pessoas) return alert('Preencha todos os campos.');
    if (pessoas > mesa.lugares) return alert(`Mesa #${mesa.id} comporta até ${mesa.lugares} pessoas.`);

    const reservas = load(STORAGE_KEYS.reservas, []);
    const nova = { id: uid(), mesaId, pessoas, nome, contato, dataHora };

    // Impedir conflito de horário (simplificado): mesma mesa com intervalo de 2 horas
    const dt = new Date(dataHora);
    const conflito = reservas.some(r => r.mesaId === mesaId && Math.abs(new Date(r.dataHora) - dt) < 2 * 60 * 60 * 1000);
    if (conflito) return alert('Já existe reserva próxima para esta mesa. Escolha outro horário.');

    reservas.push(nova);
    save(STORAGE_KEYS.reservas, reservas);
    // Atualiza status da mesa
    mesa.status = 'ocupada';
    save(STORAGE_KEYS.mesas, mesas);

    alert('Reserva confirmada!');
    window.location.hash = '#/listar-reservas';
  });

  wrap.appendChild(form);
  return wrap;
}
