
import { defineRoute, setOutlet, startRouter } from './router.js';
import { Home } from './views/home.js';
import { ConsultarMesas } from './views/consultarMesas.js';
import { ListarReservas } from './views/listarReservas.js';
import { FazerReserva } from './views/fazerReserva.js';


defineRoute('#/consultar-mesas', ConsultarMesas);
defineRoute('#/listar-reservas', ListarReservas);
defineRoute('#/fazer-reserva', FazerReserva);
defineRoute('#/home', Home);


const app = document.getElementById('app');
setOutlet(app);
startRouter('#/consultar-mesas');
