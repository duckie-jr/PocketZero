// PlaystoreImportApps/FreeMovies.js
// APIs injected: AppRegistry, Store, Router, Notify, Dialog, EventBus, Badge, Sound, Http

const FM_ICON = `<svg viewBox="0 0 48 48" ...>...</svg>`;

AppRegistry.register({
  id: 'freemovies',
  name: 'Free Movies',
  icon: FM_ICON,
  removable: true,
  render: renderFreeMoviesApp,
});

function fmInjectStyles() {
  if (document.querySelector('style[data-app="freemovies"]')) return;
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-app', 'freemovies');
  styleElement.textContent = `/* your styles here */`;
  document.head.appendChild(styleElement);
}

function renderFreeMoviesApp(container) {
  fmInjectStyles();
  container.innerHTML = `<!-- your HTML here -->`;
  // wire up events...
  container.querySelector('#fm-back').addEventListener('click', () => Router.home());
}
