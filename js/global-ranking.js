/* Arcade Hub: ranking compartido opcional (Supabase)
 * La clave publicable es pública. Nunca usar service_role en el navegador.
 */
(() => {
  'use strict';
  const allowed = new Set(['Culebrita', 'TigreSelva', 'BomberMan', 'TorreArcade']);
  const config = window.ARCADE_GLOBAL_CONFIG || {};
  const url = String(config.url || '').trim().replace(/\/$/, '');
  const publishableKey = String(config.publishableKey || '').trim();
  const ready = () => /^https:\/\/[^/]+\.supabase\.co$/.test(url) && publishableKey.length > 15;
  let clientPromise = null;
  let authPromise = null;
  const mounts = new Map();

  function loadSdk() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve(window.supabase);
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : reject(new Error('SDK no disponible'));
      script.onerror = () => reject(new Error('No se pudo cargar Supabase'));
      document.head.appendChild(script);
    });
  }
  async function getClient() {
    if (!ready()) return null;
    if (!clientPromise) {
      clientPromise = loadSdk().then(sdk => sdk.createClient(url, publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'arcade-global-auth' }
      })).catch(err => { clientPromise = null; throw err; });
    }
    return clientPromise;
  }
  async function authenticatedClient() {
    const sb = await getClient();
    if (!sb) return null;
    if (!authPromise) {
      authPromise = (async () => {
        const { data, error } = await sb.auth.getSession();
        if (error) throw error;
        if (data.session?.user?.id) return { sb, userId: data.session.user.id };
        const signed = await sb.auth.signInAnonymously();
        if (signed.error) throw signed.error;
        if (!signed.data?.user?.id) throw new Error('No se pudo iniciar una sesión anónima');
        return { sb, userId: signed.data.user.id };
      })().catch(error => { authPromise = null; throw error; });
    }
    return authPromise;
  }
  async function top(game) {
    if (!allowed.has(game)) throw new Error('Juego desconocido');
    const sb = await getClient();
    if (!sb) return [];
    const { data, error } = await sb.from('arcade_scores')
      .select('player_name,score').eq('game', game)
      .order('score', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(10);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
  async function submitScore(game, playerName, score) {
    const name = String(playerName || '').trim().slice(0, 12);
    if (!ready() || !allowed.has(game) || !name || !Number.isSafeInteger(score) || score <= 0 || score > 100000000) return false;
    const auth = await authenticatedClient();
    if (!auth) return false;
    const { error } = await auth.sb.from('arcade_scores').upsert({
      user_id: auth.userId, game, player_name: name, score
    }, { onConflict: 'user_id,game' });
    if (error) throw error;
    const mount = mounts.get(game);
    if (mount?.refresh) mount.refresh();
    return true;
  }
  function mount(game, tableOrSelector) {
    if (!allowed.has(game)) return;
    let table = typeof tableOrSelector === 'string'
      ? document.querySelector(tableOrSelector) : tableOrSelector;
    if (table?.tagName === 'TBODY') table = table.closest('table');
    if (!table || table.dataset.rankMounted === '1') return;
    table.dataset.rankMounted = '1';
    const tabBar = document.createElement('div');
    tabBar.className = 'ranking-switch';
    tabBar.setAttribute('role', 'group');
    tabBar.setAttribute('aria-label', 'Cambiar ranking');
    const localBtn = document.createElement('button');
    const globalBtn = document.createElement('button');
    for (const [button, label] of [[localBtn, '★ LOCAL'], [globalBtn, '🌍 GLOBAL']]) {
      button.type = 'button';
      button.textContent = label;
      button.className = 'ranking-tab';
      tabBar.appendChild(button);
    }
    const globalPanel = document.createElement('div');
    globalPanel.className = 'ranking-global';
    globalPanel.hidden = true;
    const status = document.createElement('p');
    status.className = 'ranking-message';
    status.setAttribute('role', 'status');
    globalPanel.appendChild(status);
    const globalTable = document.createElement('table');
    globalTable.className = 'ranking-global-table';
    const thead = document.createElement('thead');
    const header = document.createElement('tr');
    for (const label of ['JUGADOR', 'PTS']) {
      const th = document.createElement('th');
      th.textContent = label;
      header.appendChild(th);
    }
    thead.appendChild(header);
    const tbody = document.createElement('tbody');
    globalTable.append(thead, tbody);
    globalPanel.appendChild(globalTable);
    table.before(tabBar);
    table.after(globalPanel);
    let globalSelected = false;
    let requestToken = 0;
    function selectGlobal(global) {
      globalSelected = global;
      localBtn.classList.toggle('is-active', !global);
      globalBtn.classList.toggle('is-active', global);
      localBtn.setAttribute('aria-pressed', String(!global));
      globalBtn.setAttribute('aria-pressed', String(global));
      table.hidden = global;
      globalPanel.hidden = !global;
      if (global) refresh();
    }
    async function refresh() {
      if (!globalSelected) return;
      const token = ++requestToken;
      tbody.replaceChildren();
      globalTable.hidden = true;
      if (!ready()) {
        status.textContent = 'RANKING GLOBAL PENDIENTE DE CONEXIÓN. Los récords locales siguen funcionando.';
        return;
      }
      status.textContent = 'CARGANDO RÉCORDS GLOBALES...';
      try {
        const scores = await top(game);
        if (token !== requestToken || !globalSelected) return;
        if (!scores.length) {
          status.textContent = 'TODAVÍA NO HAY RÉCORDS GLOBALES. ¡SÉ EL PRIMERO!';
          return;
        }
        status.textContent = '';
        scores.forEach((entry, index) => {
          const tr = tbody.insertRow();
          const tdName = tr.insertCell();
          tdName.textContent = `${index + 1}. ${entry.player_name}`;
          tr.insertCell().textContent = Number(entry.score).toLocaleString('es-CO');
        });
        globalTable.hidden = false;
      } catch (error) {
        if (token !== requestToken) return;
        console.warn('Arcade ranking: no se pudo cargar', error);
        status.textContent = 'NO HAY CONEXIÓN CON EL RANKING GLOBAL. INTENTA DE NUEVO.';
      }
    }
    localBtn.addEventListener('click', () => selectGlobal(false));
    globalBtn.addEventListener('click', () => selectGlobal(true));
    mounts.set(game, { refresh });
    selectGlobal(false);
  }
  function initialize() {
    mount('Culebrita', '#scoreTableCulebra');
    mount('TigreSelva', '#scoreTableTigre');
    mount('BomberMan', '#scoreTableBomber');
    mount('TorreArcade', '#towerRecords');
  }
  window.ArcadeGlobal = { ready, mount, top, submitScore };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
