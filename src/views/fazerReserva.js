
import { STORAGE_KEYS, seedMesas, load, save } from '../storage.js';
import { uid } from '../utils.js';

export function FazerReserva() {
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

 
  const selectMesa = form.querySelector('#mesa');
  const mesasLivres = mesas.filter(m => m.status === 'livre');
  selectMesa.innerHTML = '<option value="">Selecione...</option>' +
    mesasLivres.map(m => `<option value="${m.id}">#${m.id} - ${m.local} (${m.lugares} lugares)</option>`).join('');
  if (selected && mesasLivres.some(m => m.id === selected)) {
    selectMesa.value = String(selected);
  }

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

   
    const dt = new Date(dataHora);
    const conflito = reservas.some(r => r.mesaId === mesaId && Math.abs(new Date(r.dataHora) - dt) < 2 * 60 * 60 * 1000);
    if (conflito) return alert('Já existe reserva próxima para esta mesa. Escolha outro horário.');

    reservas.push(nova);
    save(STORAGE_KEYS.reservas, reservas);
    
    mesa.status = 'ocupada';
    save(STORAGE_KEYS.mesas, mesas);

    alert('Reserva confirmada!');
    window.location.hash = '#/listar-reservas';
  });

  wrap.appendChild(form);
  return wrap;
}
