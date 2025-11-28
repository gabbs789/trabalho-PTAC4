

const routes = new Map();
let outlet = null;

export function defineRoute(path, component) {
  routes.set(path, component);
}

export function setOutlet(element) {
  outlet = element;
}

export function startRouter(defaultPath) {
  function render() {
    const hash = window.location.hash || defaultPath;
    const component = routes.get(hash) || routes.get(defaultPath);
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.appendChild(component());
  }
  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', render);
  render();
}
