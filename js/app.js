/* ═══════════════════════════════════════════
   MWVRC 2026 — App Logic
   ═══════════════════════════════════════════ */

/* ── Application state ── */
const state = {
  oral: {
    chairId: null,
    scores: {},
    submissions: []          // { chairId, presenter, scores, total, timestamp }
  },
  poster: {
    chairId: null,
    scores: {},
    currentPoster: null,
    submissions: []          // { chairId, poster, scores, total, timestamp }
  }
};

/* ══════════════════════════════════════════
   TAB & SEGMENT NAVIGATION
══════════════════════════════════════════ */

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((btn, i) => {
    btn.classList.toggle('active', ['oral', 'poster', 'results'][i] === tab);
  });
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'results') renderResults();
}

function switchResults(tab) {
  document.querySelectorAll('.seg-btn').forEach((btn, i) => {
    btn.classList.toggle('active', ['oral', 'poster'][i] === tab);
  });
  document.getElementById('results-oral').style.display   = tab === 'oral'   ? 'block' : 'none';
  document.getElementById('results-poster').style.display = tab === 'poster' ? 'block' : 'none';
}

/* ══════════════════════════════════════════
   ORAL — CHAIR SELECTION
══════════════════════════════════════════ */

function renderOralChairs() {
  const container = document.getElementById('oral-chairs-list');
  container.innerHTML = '';

  CHAIRS.forEach(chair => {
    const div = document.createElement('div');
    div.className = 'chair-select-card' + (state.oral.chairId === chair.id ? ' active' : '');
    div.innerHTML = `
      <div class="chair-name">${chair.name}</div>
      <div class="chair-dept">${chair.dept}</div>
      <span class="chip">Room ${chair.room}</span>
      <span class="chip">Presenters ${chair.oral[0]}–${chair.oral[chair.oral.length - 1]}</span>`;
    div.onclick = () => {
      state.oral.chairId = chair.id;
      showOralForm(chair);
    };
    container.appendChild(div);
  });
}

function showOralForm(chair) {
  document.getElementById('oral-chair-select').style.display = 'none';
  document.getElementById('oral-form').style.display         = 'block';

  // Populate presenter dropdown with this chair's assigned presenters
  const sel = document.getElementById('oral-presenter');
  sel.innerHTML = '<option value="">— Select presenter —</option>';
  chair.oral.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = 'Presenter ' + n;
    sel.appendChild(opt);
  });

  state.oral.scores = {};
  renderOralRubric();
}

function backToOralChairs() {
  document.getElementById('oral-chair-select').style.display = 'block';
  document.getElementById('oral-form').style.display         = 'none';
  state.oral.chairId = null;
  renderOralChairs();
}

/* ══════════════════════════════════════════
   ORAL — RUBRIC RENDERING & SCORING
══════════════════════════════════════════ */

function renderOralRubric() {
  const container = document.getElementById('oral-rubric-items');
  container.innerHTML = '';

  ORAL_RUBRIC.forEach(rubric => {
    const wrap = document.createElement('div');
    wrap.className = 'rubric-item';
    wrap.innerHTML = `
      <div class="rubric-header">
        <span class="rubric-label">${rubric.label}</span>
        <span class="rubric-score" id="oral-score-${rubric.key}">—/4</span>
        <button class="info-btn" onclick="showInfo('${rubric.key}','oral')" aria-label="Scoring guide for ${rubric.label}">i</button>
      </div>
      <div class="rating-row">
        ${[1, 2, 3, 4].map(v => `
          <button
            class="rating-btn"
            data-key="${rubric.key}"
            data-val="${v}"
            onclick="setOralScore('${rubric.key}', ${v})"
            aria-label="Rate ${v} — ${['Poor','Fair','Good','Excellent'][v-1]}">
            ${v}<span class="rlabel">${['Poor','Fair','Good','Excellent'][v-1]}</span>
          </button>`).join('')}
      </div>`;
    container.appendChild(wrap);
  });

  updateOralTotal();
}

function setOralScore(key, val) {
  state.oral.scores[key] = val;
  document.querySelectorAll(`.rating-btn[data-key="${key}"]`).forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.val) === val);
  });
  document.getElementById('oral-score-' + key).textContent = val + '/4';
  updateOralTotal();
}

function updateOralTotal() {
  const total = ORAL_RUBRIC.reduce((sum, r) => sum + (state.oral.scores[r.key] || 0), 0);
  document.getElementById('oral-total').textContent = total;
  document.getElementById('oral-rating').textContent = oralRating(total);
}

function submitOral() {
  const presenterVal = document.getElementById('oral-presenter').value;
  if (!presenterVal) {
    showAlert('oral-alert', 'Please select a presenter before submitting.', 'err');
    return;
  }

  const missing = ORAL_RUBRIC.filter(r => !state.oral.scores[r.key]);
  if (missing.length) {
    showAlert('oral-alert', `Please rate all categories. ${missing.length} still unrated.`, 'err');
    return;
  }

  const total = ORAL_RUBRIC.reduce((sum, r) => sum + state.oral.scores[r.key], 0);
  const entry = {
    chairId: state.oral.chairId,
    presenter: parseInt(presenterVal),
    scores: { ...state.oral.scores },
    total,
    timestamp: Date.now()
  };

  // Overwrite if same chair already scored this presenter
  const idx = state.oral.submissions.findIndex(
    x => x.chairId === entry.chairId && x.presenter === entry.presenter
  );
  if (idx >= 0) state.oral.submissions[idx] = entry;
  else          state.oral.submissions.push(entry);

  showAlert('oral-alert',
    `Assessment submitted! Presenter ${presenterVal} — ${total}/32 (${oralRating(total)})`, 'ok');

  // Reset for next presenter
  state.oral.scores = {};
  document.getElementById('oral-presenter').value = '';
  renderOralRubric();
}

function clearOralForm() {
  state.oral.scores = {};
  document.getElementById('oral-presenter').value = '';
  document.getElementById('oral-alert').innerHTML = '';
  renderOralRubric();
}

/* ══════════════════════════════════════════
   POSTER — CHAIR SELECTION
══════════════════════════════════════════ */

function renderPosterChairs() {
  const container = document.getElementById('poster-chairs-list');
  container.innerHTML = '';

  CHAIRS.forEach(chair => {
    const count = state.poster.submissions.filter(x => x.chairId === chair.id).length;
    const div = document.createElement('div');
    div.className = 'chair-select-card' + (state.poster.chairId === chair.id ? ' active' : '');
    div.innerHTML = `
      <div class="chair-name">${chair.name}</div>
      <div class="chair-dept">${chair.dept}</div>
      <span class="chip">Room ${chair.room}</span>
      <span class="chip">${count}/20 posters assessed</span>`;
    div.onclick = () => {
      state.poster.chairId = chair.id;
      showPosterForm();
    };
    container.appendChild(div);
  });
}

function showPosterForm() {
  document.getElementById('poster-chair-select').style.display = 'none';
  document.getElementById('poster-form').style.display         = 'block';
  document.getElementById('poster-rubric-section').style.display = 'none';
  state.poster.currentPoster = null;
  state.poster.scores = {};
  renderPosterGrid();
}

function backToPosterChairs() {
  document.getElementById('poster-chair-select').style.display = 'block';
  document.getElementById('poster-form').style.display         = 'none';
  document.getElementById('poster-rubric-section').style.display = 'none';
  state.poster.chairId      = null;
  state.poster.currentPoster = null;
  state.poster.scores       = {};
  renderPosterChairs();
}

/* ══════════════════════════════════════════
   POSTER — GRID & SCORING
══════════════════════════════════════════ */

function renderPosterGrid() {
  const grid = document.getElementById('poster-grid');
  grid.innerHTML = '';

  const submitted = state.poster.submissions
    .filter(x => x.chairId === state.poster.chairId)
    .map(x => x.poster);

  for (let i = 1; i <= 20; i++) {
    const done     = submitted.includes(i);
    const selected = state.poster.currentPoster === i;
    const tile = document.createElement('div');
    tile.className = 'poster-tile' + (done ? ' submitted' : '') + (selected ? ' selected' : '');
    tile.innerHTML = 'P' + i + (done ? '<span class="pt-check">✓</span>' : '');
    tile.onclick   = () => selectPoster(i);
    grid.appendChild(tile);
  }

  const count = submitted.length;
  document.getElementById('poster-progress').style.width = (count / 20 * 100) + '%';
  document.getElementById('poster-progress-label').textContent = count + ' of 20 assessed';
}

function selectPoster(n) {
  state.poster.currentPoster = n;

  // Pre-fill existing scores if this poster was already scored by this chair
  const existing = state.poster.submissions.find(
    x => x.chairId === state.poster.chairId && x.poster === n
  );
  state.poster.scores = existing ? { ...existing.scores } : {};

  document.getElementById('poster-current-label').textContent = 'Poster ' + n;
  document.getElementById('poster-rubric-section').style.display = 'block';

  renderPosterGrid();
  renderPosterRubric();
  document.getElementById('poster-rubric-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPosterRubric() {
  const container = document.getElementById('poster-rubric-items');
  container.innerHTML = '';

  POSTER_RUBRIC.forEach(rubric => {
    const currentVal = state.poster.scores[rubric.key] || null;
    const wrap = document.createElement('div');
    wrap.className = 'rubric-item';
    wrap.innerHTML = `
      <div class="rubric-header">
        <span class="rubric-label">${rubric.label}</span>
        <span class="rubric-score" id="poster-score-${rubric.key}">
          ${currentVal ? currentVal + '/' + rubric.max : '—/' + rubric.max}
        </span>
        <button class="info-btn" onclick="showInfo('${rubric.key}','poster')"
          aria-label="Scoring guide for ${rubric.label}">i</button>
      </div>
      <div class="rating-area">
        <div class="poster-rating-row">
          ${rubric.ranges.map(([lo, hi, lbl]) => {
            const active = currentVal && currentVal >= lo && currentVal <= hi;
            return `<button class="poster-rating-btn${active ? ' selected' : ''}"
              onclick="setPosterRangeMidpoint('${rubric.key}', ${lo}, ${hi}, ${rubric.max})">
              ${lo}${lo !== hi ? '–' + hi : ''}<br><span style="font-size:9px">${lbl}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="poster-score-input-row">
        <label>Exact score (1–${rubric.max}):</label>
        <input
          type="number"
          min="1"
          max="${rubric.max}"
          step="1"
          id="poster-num-${rubric.key}"
          value="${currentVal || ''}"
          placeholder="1–${rubric.max}"
          oninput="setPosterScore('${rubric.key}', this.value, ${rubric.max})"
        />
      </div>`;
    container.appendChild(wrap);
  });

  updatePosterTotal();
}

function setPosterRangeMidpoint(key, lo, hi, max) {
  // If already in range, keep current; else use midpoint
  const cur = state.poster.scores[key];
  const val = (cur && cur >= lo && cur <= hi) ? cur : Math.round((lo + hi) / 2);
  const input = document.getElementById('poster-num-' + key);
  input.value = val;
  applyPosterScore(key, val, max);
  input.focus();
}

function setPosterScore(key, raw, max) {
  const parsed = parseInt(raw);
  if (!raw || isNaN(parsed)) return;         // allow partial typing
  const val = Math.min(max, Math.max(1, parsed));
  applyPosterScore(key, val, max);
}

function applyPosterScore(key, val, max) {
  state.poster.scores[key] = val;
  document.getElementById('poster-score-' + key).textContent = val + '/' + max;

  const rubric  = POSTER_RUBRIC.find(r => r.key === key);
  const buttons = document.querySelectorAll(`#poster-rubric-items .poster-rating-btn`);
  // Update only buttons belonging to this rubric item
  const item = document.getElementById('poster-num-' + key).closest('.rubric-item');
  item.querySelectorAll('.poster-rating-btn').forEach((btn, i) => {
    const [lo, hi] = rubric.ranges[i];
    btn.classList.toggle('selected', val >= lo && val <= hi);
  });

  updatePosterTotal();
}

function updatePosterTotal() {
  const total = POSTER_RUBRIC.reduce((sum, r) => sum + (state.poster.scores[r.key] || 0), 0);
  document.getElementById('poster-total').textContent = total;
  document.getElementById('poster-rating').textContent = posterRating(total);
}

function submitPoster() {
  if (!state.poster.currentPoster) {
    showAlert('poster-alert', 'Please select a poster from the grid above.', 'err');
    return;
  }

  const missing = POSTER_RUBRIC.filter(r => !state.poster.scores[r.key]);
  if (missing.length) {
    showAlert('poster-alert', `Please score all categories. ${missing.length} still unscored.`, 'err');
    return;
  }

  const total = POSTER_RUBRIC.reduce((sum, r) => sum + state.poster.scores[r.key], 0);
  const entry = {
    chairId: state.poster.chairId,
    poster:  state.poster.currentPoster,
    scores:  { ...state.poster.scores },
    total,
    timestamp: Date.now()
  };

  const idx = state.poster.submissions.findIndex(
    x => x.chairId === entry.chairId && x.poster === entry.poster
  );
  if (idx >= 0) state.poster.submissions[idx] = entry;
  else          state.poster.submissions.push(entry);

  showAlert('poster-alert',
    `Poster ${state.poster.currentPoster} assessed! Score: ${total}/40 (${posterRating(total)})`, 'ok');

  // Reset for next poster
  state.poster.currentPoster = null;
  state.poster.scores = {};
  document.getElementById('poster-rubric-section').style.display = 'none';
  renderPosterGrid();
  renderPosterChairs();   // update progress chips on chair cards
}

function clearPosterForm() {
  state.poster.scores = {};
  document.getElementById('poster-alert').innerHTML = '';
  renderPosterRubric();
}

/* ══════════════════════════════════════════
   RESULTS
══════════════════════════════════════════ */

function renderResults() {
  renderOralResults();
  renderPosterResults();
}

/* ── Oral results ── */
function renderOralResults() {
  const subs = state.oral.submissions;
  const rankCard  = document.getElementById('oral-rankings-card');
  const chairDiv  = document.getElementById('oral-by-chair');

  if (!subs.length) {
    rankCard.innerHTML = '<p class="empty-state">No oral submissions yet.</p>';
    chairDiv.innerHTML = '';
    return;
  }

  // Aggregate by presenter (average if multiple assessors)
  const byPresenter = {};
  subs.forEach(s => {
    if (!byPresenter[s.presenter]) byPresenter[s.presenter] = { total: 0, count: 0 };
    byPresenter[s.presenter].total += s.total;
    byPresenter[s.presenter].count++;
  });

  const ranked = Object.entries(byPresenter)
    .map(([p, d]) => ({ presenter: p, avg: d.total / d.count, count: d.count }))
    .sort((a, b) => b.avg - a.avg);

  rankCard.innerHTML = ranked.map((r, i) => {
    const medal = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="result-row">
      <div class="rank-badge ${medal}">${i + 1}</div>
      <div>
        <div class="result-name">Presenter ${r.presenter}</div>
        <div class="result-detail">${r.count} assessor${r.count > 1 ? 's' : ''}</div>
      </div>
      <div class="result-meta">
        <div class="result-score">${r.avg.toFixed(1)}</div>
        <div class="result-detail">/ 32</div>
      </div>
    </div>`;
  }).join('');

  // Per-chair breakdown
  chairDiv.innerHTML = '';
  CHAIRS.forEach(chair => {
    const chairSubs = subs.filter(s => s.chairId === chair.id);
    if (!chairSubs.length) return;
    const block = document.createElement('div');
    block.className = 'chair-block';
    block.innerHTML =
      `<div class="chair-header">${chair.name}</div>` +
      chairSubs
        .sort((a, b) => a.presenter - b.presenter)
        .map(s => `<div class="chair-row">
          <span class="chair-row-name">Presenter ${s.presenter}</span>
          <span class="chair-row-score">${s.total}/32 — ${oralRating(s.total)}</span>
        </div>`).join('');
    chairDiv.appendChild(block);
  });
}

/* ── Poster results ── */
function renderPosterResults() {
  const subs     = state.poster.submissions;
  const rankCard = document.getElementById('poster-rankings-card');
  const chairDiv = document.getElementById('poster-by-chair');

  if (!subs.length) {
    rankCard.innerHTML = '<p class="empty-state">No poster submissions yet.</p>';
    chairDiv.innerHTML = '';
    return;
  }

  // Aggregate per poster across all chairs
  const byPoster = {};
  for (let i = 1; i <= 20; i++) byPoster[i] = { total: 0, count: 0 };
  subs.forEach(s => {
    byPoster[s.poster].total += s.total;
    byPoster[s.poster].count++;
  });

  const ranked = Object.entries(byPoster)
    .filter(([, d]) => d.count > 0)
    .map(([p, d]) => ({ poster: p, avg: d.total / d.count, count: d.count }))
    .sort((a, b) => b.avg - a.avg);

  rankCard.innerHTML = ranked.map((r, i) => {
    const medal = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="result-row">
      <div class="rank-badge ${medal}">${i + 1}</div>
      <div>
        <div class="result-name">Poster ${r.poster}</div>
        <div class="result-detail">${r.count} of 6 chairs assessed</div>
      </div>
      <div class="result-meta">
        <div class="result-score">${r.avg.toFixed(1)}</div>
        <div class="result-detail">/ 40 avg</div>
      </div>
    </div>`;
  }).join('');

  // Per-chair breakdown
  chairDiv.innerHTML = '';
  CHAIRS.forEach(chair => {
    const chairSubs = subs.filter(s => s.chairId === chair.id);
    if (!chairSubs.length) return;
    const block = document.createElement('div');
    block.className = 'chair-block';
    block.innerHTML =
      `<div class="chair-header">${chair.name}</div>` +
      chairSubs
        .sort((a, b) => a.poster - b.poster)
        .map(s => `<div class="chair-row">
          <span class="chair-row-name">Poster ${s.poster}</span>
          <span class="chair-row-score">${s.total}/40 — ${posterRating(s.total)}</span>
        </div>`).join('');
    chairDiv.appendChild(block);
  });
}

/* ══════════════════════════════════════════
   INFO MODAL
══════════════════════════════════════════ */

function showInfo(key, type) {
  const rubric = (type === 'oral' ? ORAL_RUBRIC : POSTER_RUBRIC).find(r => r.key === key);
  if (!rubric) return;

  document.getElementById('modal-title').textContent = rubric.label;
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-grade grade-excellent">
      <strong>Excellent</strong>${rubric.info.excellent}
    </div>
    <div class="modal-grade grade-good">
      <strong>Good</strong>${rubric.info.good}
    </div>
    <div class="modal-grade grade-fair">
      <strong>Fair</strong>${rubric.info.fair}
    </div>
    <div class="modal-grade grade-poor">
      <strong>Poor</strong>${rubric.info.poor}
    </div>`;

  document.getElementById('info-modal').style.display = 'flex';
}

function closeInfoModal() {
  document.getElementById('info-modal').style.display = 'none';
}

function closeModal(e) {
  if (e.target.id === 'info-modal') closeInfoModal();
}

/* ══════════════════════════════════════════
   UTILITY
══════════════════════════════════════════ */

function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="alert alert-${type === 'err' ? 'err' : 'ok'}">${msg}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 6000);
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
renderOralChairs();
renderPosterChairs();
