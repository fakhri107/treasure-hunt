// ============================================================================
// HALAMAN PANITIA (BAHASA SEDERHANA & RAMAH SISWA SMP)
// ============================================================================
window.TMD = window.TMD || {};

(function initAdminPage() {
  const store = window.TMD.store;
  let activeTab = 'teams'; // 'teams' | 'checkpoints' | 'content' | 'monitor' | 'supabase'
  let editingTeamId = null;
  let editingCpId = null;
  let selectedContentCpId = null;
  let selectedQuestionScope = 'general';
  let editingQuestionId = null;
  let isAddingNewQuestion = false;
  let pinUnlocked = !store.ui.adminPin;

  function showToast(title, desc, badgeText, isSuccess) {
    const toast = document.getElementById('quiz-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    const toastXp = document.getElementById('toast-xp');
    if (!toast) return;

    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    toastXp.textContent = badgeText;
    toast.style.borderColor = isSuccess ? '#10B981' : '#EF4444';
    toastXp.className = isSuccess
      ? 'px-2.5 py-1 bg-rivals-mint text-slate-nav font-display text-[11px] font-black tracking-wider uppercase shrink-0 rounded-sm'
      : 'px-2.5 py-1 bg-rivals-red text-white font-display text-[11px] font-black tracking-wider uppercase shrink-0 rounded-sm';

    toast.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3400);
  }
  window.TMD.showToast = showToast;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateCloudBadge() {
    const badge = document.getElementById('admin-cloud-badge');
    if (!badge) return;
    if (store.isConnected()) {
      badge.textContent = 'TERSIMPAN ONLINE ✓';
      badge.className = 'hidden sm:inline-flex items-center px-3 py-1 mr-3 bg-rivals-mint/20 border border-rivals-mint/40 text-rivals-mint font-display text-[10px] font-bold uppercase rounded-sm';
    } else {
      badge.textContent = 'SIMPAN DI HP INI';
      badge.className = 'hidden sm:inline-flex items-center px-3 py-1 mr-3 bg-white/10 text-muted font-display text-[10px] font-bold uppercase rounded-sm';
    }
  }

  function renderAdminTabs() {
    const tabs = [
      { id: 'teams', label: '1. Kelompok', icon: 'groups' },
      { id: 'checkpoints', label: '2. Daftar Pos', icon: 'flag' },
      { id: 'content', label: '3. Soal & Petunjuk', icon: 'quiz' },
      { id: 'monitor', label: '4. Nilai & Progres', icon: 'leaderboard' }
    ];
    const nav = document.getElementById('admin-tabs-nav');
    if (!nav) return;
    nav.innerHTML = tabs
      .map((t) => {
        const isActive = t.id === activeTab;
        return `
          <button type="button" data-admin-tab="${t.id}" class="px-4 py-3 flex items-center gap-1.5 font-display text-[11px] font-extrabold tracking-[0.12em] uppercase border-b-2 transition-all shrink-0 ${
            isActive
              ? 'border-rivals-yellow text-rivals-yellow bg-slate-card/60'
              : 'border-transparent text-muted hover:text-white hover:bg-white/5'
          }">
            <span class="material-symbols-outlined text-[16px]">${t.icon}</span>
            <span>${t.label}</span>
          </button>
        `;
      })
      .join('');

    nav.querySelectorAll('[data-admin-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-admin-tab');
        renderAdminBody();
      });
    });
  }

  function renderTeamsTab(container) {
    const teams = store.getSortedTeams();
    const editing = editingTeamId ? teams.find((t) => t.id === editingTeamId) : null;
    const selectedIconId = editing
      ? editing.image_url
      : window.TMD.HERO_ICONS[teams.length % window.TMD.HERO_ICONS.length]?.id || 'iron-man';

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-display text-xs font-extrabold tracking-[0.14em] uppercase text-white">Daftar Kelompok (${teams.length})</h3>
            <button type="button" id="admin-load-default-btn" class="px-2.5 py-1.5 bg-rivals-yellow/15 hover:bg-rivals-yellow/25 border border-rivals-yellow/40 text-rivals-yellow font-display text-[10px] font-bold uppercase rounded-sm">
              Pakai Contoh 5 Kelompok
            </button>
          </div>
          <div class="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            ${teams
              .map(
                (t) => `
              <div class="p-3 bg-slate-card border border-white/10 rounded-sm flex items-center justify-between gap-2" style="border-left: 3px solid ${esc(t.accent_hex)}">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 shrink-0">${window.TMD.getHeroIconSvg(t.image_url)}</div>
                  <div class="min-w-0">
                    <div class="font-display text-xs font-extrabold text-white uppercase truncate">${esc(t.name)} — ${esc(t.hero_first)} ${esc(t.hero_second)}</div>
                    <div class="text-[11px] text-muted truncate">Kode Login: <strong class="text-rivals-yellow">TIM${esc(t.sort_order)}</strong> • ${esc(t.color_name)} • ${esc(t.route_code)}</div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" data-edit-team="${t.id}" class="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-display text-[10px] font-bold uppercase rounded-sm">Ubah</button>
                  <button type="button" data-del-team="${t.id}" class="px-2.5 py-1 bg-rivals-red/20 hover:bg-rivals-red text-rivals-red hover:text-white font-display text-[10px] font-bold uppercase rounded-sm">Hapus</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <button type="button" id="admin-new-team-btn" class="w-full py-2.5 bg-slate-card hover:bg-slate-hover border border-white/15 text-white font-display text-[11px] font-bold tracking-[0.12em] uppercase rounded-sm">
            + Tambah Kelompok Baru
          </button>
        </div>

        <form id="admin-team-form" class="lg:col-span-7 bg-slate-card border border-white/10 rounded-sm p-5 space-y-4">
          <div class="font-display text-xs font-extrabold tracking-[0.14em] uppercase text-rivals-yellow pb-2 border-b border-white/10">
            ${editing ? `Ubah Data: ${esc(editing.name)}` : 'Tambah Kelompok Baru'}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Urutan</label>
              <input name="sort_order" type="number" min="1" value="${esc(editing ? editing.sort_order : teams.length + 1)}" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Kelompok</label>
              <input name="name" type="text" required value="${esc(editing ? editing.name : `Kelompok 0${teams.length + 1}`)}" placeholder="Kelompok 06" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Rute</label>
              <input name="route_code" type="text" required value="${esc(editing ? editing.route_code : `Rute ${String.fromCharCode(65 + teams.length)}`)}" placeholder="Rute F" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Regu / Divisi</label>
              <input name="division_title" type="text" value="${esc(editing ? editing.division_title : '')}" placeholder="Regu Elang" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Warna</label>
              <input name="color_name" type="text" value="${esc(editing ? editing.color_name : 'Oranye')}" placeholder="Merah / Biru" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Pilih Warna</label>
              <input id="admin-team-accent" name="accent_hex" type="color" value="${esc(editing ? editing.accent_hex : '#EF4444')}" class="w-full h-10 px-1 py-1 bg-slate-base border border-white/15 rounded-sm cursor-pointer"/>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Hero (Kata 1)</label>
              <input id="admin-team-first" name="hero_first" type="text" required value="${esc(editing ? editing.hero_first : '')}" placeholder="DEAD" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm uppercase rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Hero (Kata 2)</label>
              <input id="admin-team-second" name="hero_second" type="text" required value="${esc(editing ? editing.hero_second : '')}" placeholder="POOL" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm uppercase rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-display font-bold text-muted uppercase mb-2">Pilih Logo Tim (Tinggal Klik):</label>
            <input id="admin-team-icon-input" name="image_url" type="hidden" value="${esc(selectedIconId)}"/>
            <div id="admin-icon-picker" class="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 bg-slate-base border border-white/10 rounded-sm">
              ${window.TMD.HERO_ICONS.map(
                (ic) => `
                <button type="button" data-pick-icon="${ic.id}" title="${ic.label}" class="p-1.5 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
                  ic.id === selectedIconId
                    ? 'border-rivals-yellow bg-slate-card scale-105'
                    : 'border-transparent hover:border-white/30 bg-slate-nav/60'
                }">
                  <div class="w-9 h-9">${ic.svg}</div>
                  <span class="text-[8px] font-display font-bold text-slate-300 uppercase truncate w-full text-center">${ic.label}</span>
                </button>
              `
              ).join('')}
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2">
            <button type="submit" class="px-5 py-2.5 bg-rivals-yellow text-slate-nav font-display text-xs font-black tracking-[0.12em] uppercase rounded-sm">
              ${editing ? 'Simpan Perubahan' : 'Simpan Kelompok'}
            </button>
            ${
              editing
                ? '<button type="button" id="admin-cancel-team-btn" class="px-4 py-2.5 bg-white/10 text-muted hover:text-white font-display text-xs font-bold uppercase rounded-sm">Batal</button>'
                : ''
            }
          </div>
        </form>
      </div>
    `;

    container.querySelectorAll('[data-pick-icon]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const iconId = btn.getAttribute('data-pick-icon');
        const iconMeta = window.TMD.HERO_ICONS.find((ic) => ic.id === iconId);
        const hiddenInput = container.querySelector('#admin-team-icon-input');
        if (hiddenInput) hiddenInput.value = iconId;

        container.querySelectorAll('[data-pick-icon]').forEach((b) => {
          const isSel = b.getAttribute('data-pick-icon') === iconId;
          b.className = `p-1.5 rounded-sm border-2 transition-all flex flex-col items-center gap-1 ${
            isSel
              ? 'border-rivals-yellow bg-slate-card scale-105'
              : 'border-transparent hover:border-white/30 bg-slate-nav/60'
          }`;
        });

        if (iconMeta && !editing) {
          const firstEl = container.querySelector('#admin-team-first');
          const secondEl = container.querySelector('#admin-team-second');
          const accentEl = container.querySelector('#admin-team-accent');
          if (firstEl && !firstEl.value) firstEl.value = iconMeta.first;
          if (secondEl && !secondEl.value) secondEl.value = iconMeta.second;
          if (accentEl) accentEl.value = iconMeta.accent;
        }
      });
    });

    container.querySelector('#admin-load-default-btn')?.addEventListener('click', () => {
      if (window.confirm('Pakai contoh 5 kelompok & 4 pos bawaan?')) {
        store.loadDefaultMarvelTemplate();
        editingTeamId = null;
        renderAdminBody();
        showToast('CONTOH DIMUAT', '5 Kelompok & 4 Pos berhasil dimuat.', 'SIAP', true);
      }
    });

    container.querySelector('#admin-new-team-btn')?.addEventListener('click', () => {
      editingTeamId = null;
      renderAdminBody();
    });
    container.querySelector('#admin-cancel-team-btn')?.addEventListener('click', () => {
      editingTeamId = null;
      renderAdminBody();
    });
    container.querySelectorAll('[data-edit-team]').forEach((btn) => {
      btn.addEventListener('click', () => {
        editingTeamId = btn.getAttribute('data-edit-team');
        renderAdminBody();
      });
    });
    container.querySelectorAll('[data-del-team]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-team');
        if (teams.length <= 1) {
          showToast('TIDAK BISA HAPUS', 'Minimal harus ada 1 kelompok.', 'MIN 1', false);
          return;
        }
        if (window.confirm('Hapus kelompok ini?')) {
          store.deleteTeam(id);
          if (editingTeamId === id) editingTeamId = null;
          renderAdminBody();
        }
      });
    });

    container.querySelector('#admin-team-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      store.upsertTeam({
        id: editing ? editing.id : window.TMD.generateUuid(),
        sort_order: Number(fd.get('sort_order') || 1),
        name: String(fd.get('name') || '').trim(),
        division_title: String(fd.get('division_title') || '').trim(),
        color_name: String(fd.get('color_name') || '').trim(),
        accent_hex: String(fd.get('accent_hex') || '#EF4444'),
        route_code: String(fd.get('route_code') || '').trim(),
        hero_first: String(fd.get('hero_first') || '').trim().toUpperCase(),
        hero_second: String(fd.get('hero_second') || '').trim().toUpperCase(),
        image_url: String(fd.get('image_url') || '').trim()
      });
      editingTeamId = null;
      renderAdminBody();
      showToast('KELOMPOK DISIMPAN', 'Data kelompok berhasil disimpan.', 'TERSIMPAN', true);
    });
  }

  function renderCheckpointsTab(container) {
    const cps = store.getSortedCheckpoints();
    const editing = editingCpId ? cps.find((c) => c.id === editingCpId) : null;

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5 space-y-3">
          <h3 class="font-display text-xs font-extrabold tracking-[0.14em] uppercase text-white">Daftar Pos (${cps.length})</h3>
          <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            ${cps
              .map(
                (cp) => `
              <div class="p-3.5 bg-slate-card border border-white/10 rounded-sm flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="font-display text-xs font-extrabold text-white uppercase truncate">
                    POS ${cp.pos_number} ${cp.is_convergence ? '<span class="text-rivals-yellow">(FINISH)</span>' : ''}
                  </div>
                  <div class="text-[11px] text-muted truncate">+${cp.xp_reward} Poin • ${esc(cp.category_label)}</div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" data-edit-cp="${cp.id}" class="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-display text-[10px] font-bold uppercase rounded-sm">Ubah</button>
                  <button type="button" data-del-cp="${cp.id}" class="px-2.5 py-1 bg-rivals-red/20 hover:bg-rivals-red text-rivals-red hover:text-white font-display text-[10px] font-bold uppercase rounded-sm">Hapus</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <button type="button" id="admin-new-cp-btn" class="w-full py-2.5 bg-slate-card hover:bg-slate-hover border border-white/15 text-white font-display text-[11px] font-bold tracking-[0.12em] uppercase rounded-sm">
            + Tambah Pos Baru
          </button>
        </div>

        <form id="admin-cp-form" class="lg:col-span-7 bg-slate-card border border-white/10 rounded-sm p-5 space-y-4">
          <div class="font-display text-xs font-extrabold tracking-[0.14em] uppercase text-rivals-yellow pb-2 border-b border-white/10">
            ${editing ? `Ubah Pos 0${editing.pos_number}` : 'Tambah Pos Baru'}
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Pos ke-</label>
              <input name="pos_number" type="number" min="1" required value="${esc(editing ? editing.pos_number : cps.length + 1)}" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Nama Pos</label>
              <input name="title" type="text" required value="${esc(editing ? editing.title : '')}" placeholder="POS TANTANGAN TALI" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm uppercase rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Tema / Judul Tantangan</label>
              <input name="category_label" type="text" value="${esc(editing ? editing.category_label : '')}" placeholder="UJI KERJA SAMA TIM" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm uppercase rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
            <div>
              <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Poin / Nilai (XP)</label>
              <input name="xp_reward" type="number" min="0" step="10" required value="${esc(editing ? editing.xp_reward : 150)}" class="w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm rounded-sm outline-none focus:border-rivals-yellow"/>
            </div>
          </div>
          <label class="flex items-center gap-2.5 py-1 text-sm text-slate-200 cursor-pointer">
            <input name="is_convergence" type="checkbox" ${editing && editing.is_convergence ? 'checked' : ''} class="accent-rivals-yellow w-4 h-4"/>
            <span>Ini adalah Pos Terakhir / Titik Kumpul Akhir (Finish)</span>
          </label>
          <div class="flex items-center gap-2 pt-2">
            <button type="submit" class="px-5 py-2.5 bg-rivals-yellow text-slate-nav font-display text-xs font-black tracking-[0.12em] uppercase rounded-sm">
              ${editing ? 'Simpan Perubahan Pos' : 'Simpan Pos'}
            </button>
            ${
              editing
                ? '<button type="button" id="admin-cancel-cp-btn" class="px-4 py-2.5 bg-white/10 text-muted hover:text-white font-display text-xs font-bold uppercase rounded-sm">Batal</button>'
                : ''
            }
          </div>
        </form>
      </div>
    `;

    container.querySelector('#admin-new-cp-btn')?.addEventListener('click', () => {
      editingCpId = null;
      renderAdminBody();
    });
    container.querySelector('#admin-cancel-cp-btn')?.addEventListener('click', () => {
      editingCpId = null;
      renderAdminBody();
    });
    container.querySelectorAll('[data-edit-cp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        editingCpId = btn.getAttribute('data-edit-cp');
        renderAdminBody();
      });
    });
    container.querySelectorAll('[data-del-cp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-cp');
        if (cps.length <= 1) {
          showToast('TIDAK BISA HAPUS', 'Minimal harus ada 1 pos.', 'MIN 1', false);
          return;
        }
        if (window.confirm('Hapus pos ini beserta soal dan petunjuknya?')) {
          store.deleteCheckpoint(id);
          if (editingCpId === id) editingCpId = null;
          renderAdminBody();
        }
      });
    });

    container.querySelector('#admin-cp-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      store.upsertCheckpoint({
        id: editing ? editing.id : window.TMD.generateUuid(),
        pos_number: Number(fd.get('pos_number') || 1),
        title: String(fd.get('title') || '').trim().toUpperCase(),
        category_label: String(fd.get('category_label') || '').trim().toUpperCase(),
        xp_reward: Number(fd.get('xp_reward') || 150),
        is_convergence: Boolean(fd.get('is_convergence'))
      });
      editingCpId = null;
      renderAdminBody();
      showToast('POS DISIMPAN', 'Data pos berhasil disimpan.', 'TERSIMPAN', true);
    });
  }

  function renderContentTab(container) {
    const cps = store.getSortedCheckpoints();
    const teams = store.getSortedTeams();
    if (!selectedContentCpId || !cps.some((c) => c.id === selectedContentCpId)) {
      selectedContentCpId = cps[0]?.id;
    }
    const activeCp = cps.find((c) => c.id === selectedContentCpId);
    const scopeTeamId = selectedQuestionScope === 'general' ? null : selectedQuestionScope;
    const posQuestions = activeCp
      ? store.data.questions.filter(
          (q) => q.checkpoint_id === activeCp.id && (q.team_id || null) === scopeTeamId
        )
      : [];
    if (!isAddingNewQuestion && (!editingQuestionId || !posQuestions.some((q) => q.id === editingQuestionId))) {
      editingQuestionId = posQuestions[0]?.id || null;
    }
    const existingQ = isAddingNewQuestion
      ? null
      : posQuestions.find((q) => q.id === editingQuestionId) || null;

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center gap-4 p-4 bg-slate-card border border-white/10 rounded-sm">
          <div class="flex items-center gap-2">
            <span class="font-display text-xs font-bold text-muted uppercase">Pilih Pos:</span>
            <select id="content-cp-select" class="px-3 py-1.5 bg-slate-base border border-white/20 text-white text-xs font-display font-bold uppercase rounded-sm outline-none focus:border-rivals-yellow">
              ${cps
                .map(
                  (c) => `<option value="${c.id}" ${c.id === selectedContentCpId ? 'selected' : ''}>POS ${c.pos_number}</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-display text-xs font-bold text-muted uppercase">Soal Untuk:</span>
            <select id="content-q-scope" class="px-3 py-1.5 bg-slate-base border border-white/20 text-white text-xs font-display font-bold uppercase rounded-sm outline-none focus:border-rivals-yellow">
              <option value="general" ${selectedQuestionScope === 'general' ? 'selected' : ''}>Semua Kelompok (Sama)</option>
              ${teams
                .map(
                  (t) => `<option value="${t.id}" ${selectedQuestionScope === t.id ? 'selected' : ''}>Khusus: ${esc(t.name)}</option>`
                )
                .join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-5 space-y-4">
            <div class="bg-slate-card border border-white/10 rounded-sm p-4 space-y-3">
              <div class="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span class="font-display text-xs font-extrabold uppercase text-white">
                  Daftar Soal Pos 0${activeCp.pos_number} (${posQuestions.length} Soal)
                </span>
                <button type="button" id="admin-new-question-btn" class="px-2.5 py-1 bg-rivals-yellow text-slate-nav font-display text-[10px] font-black uppercase rounded-sm">
                  + Tambah Soal
                </button>
              </div>
              <div class="space-y-2">
                ${
                  posQuestions.length === 0
                    ? '<p class="text-xs text-muted italic">Belum ada soal. Isi form di bawah untuk menambah soal pertama.</p>'
                    : posQuestions
                        .map(
                          (q, qIdx) => `
                        <div class="p-2.5 bg-slate-base border rounded-sm flex items-center justify-between gap-2 ${
                          !isAddingNewQuestion && q.id === editingQuestionId ? 'border-rivals-yellow' : 'border-white/10'
                        }">
                          <div class="min-w-0">
                            <div class="font-display text-[11px] font-extrabold text-rivals-yellow uppercase">Soal #${qIdx + 1} • Jawaban: ${esc(q.correct_option)}</div>
                            <div class="text-xs text-slate-200 truncate">${esc(q.question_text)}</div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" data-edit-q="${q.id}" class="px-2 py-1 bg-white/10 hover:bg-white/20 text-white font-display text-[10px] font-bold uppercase rounded-sm">Ubah</button>
                            <button type="button" data-del-q="${q.id}" class="px-2 py-1 bg-rivals-red/20 hover:bg-rivals-red text-rivals-red hover:text-white font-display text-[10px] font-bold uppercase rounded-sm">Hapus</button>
                          </div>
                        </div>
                      `
                        )
                        .join('')
                }
              </div>
            </div>

            <form id="admin-question-form" class="bg-slate-card border border-white/10 rounded-sm p-5 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span class="font-display text-xs font-extrabold uppercase text-rivals-yellow">
                  ${existingQ ? 'Ubah Soal' : 'Buat Soal Baru'}
                </span>
                <select id="admin-q-type" class="px-2.5 py-1 bg-slate-base border border-white/20 text-white font-display text-[10px] font-bold uppercase rounded-sm outline-none focus:border-rivals-yellow">
                  <option value="abcd" ${!existingQ || existingQ.option_c || existingQ.option_d ? 'selected' : ''}>Pilihan Ganda (A–D)</option>
                  <option value="tf" ${existingQ && !existingQ.option_c && !existingQ.option_d ? 'selected' : ''}>Benar / Salah (A–B)</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Pertanyaan</label>
                <textarea name="question_text" rows="3" required class="auto-grow-textarea w-full px-3 py-2.5 bg-slate-base border border-white/15 text-white text-sm leading-relaxed rounded-sm outline-none focus:border-rivals-yellow resize-none overflow-hidden">${esc(existingQ ? existingQ.question_text : '')}</textarea>
              </div>
              <div class="grid grid-cols-1 gap-2.5">
                ${['A', 'B', 'C', 'D']
                  .map((opt) => {
                    const field = `option_${opt.toLowerCase()}`;
                    const isTf = existingQ && !existingQ.option_c && !existingQ.option_d;
                    const hideRow = isTf && (opt === 'C' || opt === 'D');
                    return `
                    <div class="flex items-start gap-2 ${hideRow ? 'hidden' : ''}" data-opt-row="${opt}">
                      <span class="w-7 h-7 mt-1 bg-white/10 font-display text-xs font-bold flex items-center justify-center shrink-0 rounded-sm">${opt}</span>
                      <textarea name="${field}" rows="2" ${hideRow ? '' : 'required'} class="auto-grow-textarea w-full px-3 py-2 bg-slate-base border border-white/15 text-white text-sm leading-snug rounded-sm outline-none focus:border-rivals-yellow resize-none overflow-hidden">${esc(existingQ ? existingQ[field] : '')}</textarea>
                    </div>
                  `;
                  })
                  .join('')}
              </div>
              <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-display font-bold text-muted uppercase">Jawaban Benar:</span>
                  <select id="admin-q-correct" name="correct_option" class="px-3 py-1.5 bg-slate-base border border-white/20 text-rivals-mint font-display text-xs font-extrabold uppercase rounded-sm">
                    ${['A', 'B', 'C', 'D']
                      .map((o) => `<option value="${o}" ${existingQ && existingQ.correct_option === o ? 'selected' : ''}>Pilihan ${o}</option>`)
                      .join('')}
                  </select>
                </div>
                <button type="submit" class="px-4 py-2 bg-rivals-yellow text-slate-nav font-display text-xs font-black tracking-[0.1em] uppercase rounded-sm">
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>

          <div class="lg:col-span-7 bg-slate-card border border-white/10 rounded-sm p-5 space-y-4">
            <div class="font-display text-xs font-extrabold uppercase text-rivals-yellow pb-2 border-b border-white/10">
              Kata Sandi Pos &amp; Petunjuk Jalan Tiap Kelompok
            </div>
            <div class="space-y-4">
              ${teams
                .map((t) => {
                  const rc = store.getRouteClueFor(activeCp.id, t.id);
                  return `
                  <div class="p-4 bg-slate-base border border-white/10 rounded-sm space-y-2.5" style="border-left: 3px solid ${esc(t.accent_hex)}">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span class="font-display text-xs font-extrabold text-white uppercase">${esc(t.name)} (${esc(t.color_name)})</span>
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-display font-bold text-muted uppercase">Kata Sandi:</span>
                        <input type="text" data-token-input="${t.id}" value="${esc(rc ? rc.access_token : `${t.hero_first}-0${activeCp.pos_number}`)}" placeholder="CONTOH: STARK-01" class="w-36 px-3 py-1.5 bg-slate-card border border-rivals-yellow/40 text-rivals-yellow font-display text-xs font-bold uppercase rounded-sm outline-none focus:border-rivals-yellow"/>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-display font-bold text-muted uppercase mb-1">Petunjuk Menuju Pos Berikutnya:</label>
                      <textarea rows="3" data-clue-input="${t.id}" placeholder="Tulis teka-teki atau arah jalan ke pos berikutnya..." class="auto-grow-textarea w-full px-3 py-2.5 bg-slate-card border border-white/15 text-white text-sm leading-relaxed rounded-sm outline-none focus:border-rivals-yellow resize-none overflow-hidden">${esc(rc ? rc.next_clue_text : '')}</textarea>
                    </div>
                    <div class="pt-1 space-y-1.5">
                      <label class="block text-[10px] font-display font-bold text-muted uppercase">
                        Keterangan Jarak / Area Tujuan (contoh: ~120M, Lantai 2, Dekat Kantin):
                      </label>
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <input type="text" data-dist-input="${t.id}" value="${esc(rc ? rc.distance_label : '~100M')}" placeholder="Misal: Dekat Kantin atau ~120M" class="w-56 px-3 py-1.5 bg-slate-card border border-white/15 text-white text-xs rounded-sm outline-none focus:border-rivals-yellow"/>
                        <button type="button" data-save-clue="${t.id}" class="px-3.5 py-1.5 bg-rivals-mint/20 hover:bg-rivals-mint text-rivals-mint hover:text-slate-nav border border-rivals-mint/40 font-display text-[11px] font-extrabold uppercase rounded-sm transition-colors">
                          Simpan Petunjuk
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.auto-grow-textarea').forEach((ta) => {
      const resize = () => {
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight + 4}px`;
      };
      resize();
      ta.addEventListener('input', resize);
    });

    container.querySelector('#content-cp-select')?.addEventListener('change', (e) => {
      selectedContentCpId = e.target.value;
      editingQuestionId = null;
      isAddingNewQuestion = false;
      renderAdminBody();
    });
    container.querySelector('#content-q-scope')?.addEventListener('change', (e) => {
      selectedQuestionScope = e.target.value;
      editingQuestionId = null;
      isAddingNewQuestion = false;
      renderAdminBody();
    });

    container.querySelector('#admin-new-question-btn')?.addEventListener('click', () => {
      isAddingNewQuestion = true;
      editingQuestionId = null;
      renderAdminBody();
    });

    container.querySelectorAll('[data-edit-q]').forEach((btn) => {
      btn.addEventListener('click', () => {
        isAddingNewQuestion = false;
        editingQuestionId = btn.getAttribute('data-edit-q');
        renderAdminBody();
      });
    });

    container.querySelectorAll('[data-del-q]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-del-q');
        if (window.confirm('Hapus soal ini?')) {
          store.deleteQuestion(qId);
          if (editingQuestionId === qId) editingQuestionId = null;
          renderAdminBody();
        }
      });
    });

    container.querySelector('#admin-q-type')?.addEventListener('change', (e) => {
      const isTf = e.target.value === 'tf';
      ['C', 'D'].forEach((opt) => {
        const row = container.querySelector(`[data-opt-row="${opt}"]`);
        const ta = row?.querySelector('textarea');
        if (row) row.classList.toggle('hidden', isTf);
        if (ta) {
          if (isTf) ta.removeAttribute('required');
          else ta.setAttribute('required', 'required');
        }
      });
      if (isTf) {
        const taA = container.querySelector('[data-opt-row="A"] textarea');
        const taB = container.querySelector('[data-opt-row="B"] textarea');
        if (taA && !taA.value.trim()) taA.value = 'Benar';
        if (taB && !taB.value.trim()) taB.value = 'Salah';
        const sel = container.querySelector('#admin-q-correct');
        if (sel && (sel.value === 'C' || sel.value === 'D')) sel.value = 'A';
      }
    });

    container.querySelector('#admin-question-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const isTf = container.querySelector('#admin-q-type')?.value === 'tf';
      const saved = store.upsertQuestion({
        id: existingQ ? existingQ.id : window.TMD.generateUuid(),
        checkpoint_id: activeCp.id,
        team_id: scopeTeamId,
        question_text: String(fd.get('question_text') || '').trim(),
        option_a: String(fd.get('option_a') || '').trim(),
        option_b: String(fd.get('option_b') || '').trim(),
        option_c: isTf ? '' : String(fd.get('option_c') || '').trim(),
        option_d: isTf ? '' : String(fd.get('option_d') || '').trim(),
        correct_option: String(fd.get('correct_option') || 'A')
      });
      isAddingNewQuestion = false;
      editingQuestionId = saved.id;
      renderAdminBody();
      showToast('SOAL DISIMPAN', `Soal Pos 0${activeCp.pos_number} berhasil disimpan.`, 'TERSIMPAN', true);
    });

    container.querySelectorAll('[data-save-clue]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-save-clue');
        const tokenVal = container.querySelector(`[data-token-input="${tId}"]`)?.value.trim().toUpperCase() || '';
        const clueVal = container.querySelector(`[data-clue-input="${tId}"]`)?.value.trim() || '';
        const distVal = container.querySelector(`[data-dist-input="${tId}"]`)?.value.trim() || '~100M';
        store.upsertRouteClue({
          checkpoint_id: activeCp.id,
          team_id: tId,
          access_token: tokenVal,
          next_clue_text: clueVal,
          distance_label: distVal
        });
        showToast('PETUNJUK DISIMPAN', `Kata sandi (${tokenVal}) & petunjuk berhasil disimpan.`, 'TERSIMPAN', true);
      });
    });
  }

  function renderMonitorTab(container) {
    const teams = store.getSortedTeams();
    const cps = store.getSortedCheckpoints();
    const maxXp = store.computeMaxXp();

    const ranked = [...teams]
      .map((t) => ({
        team: t,
        xp: store.computeTeamXp(t.id),
        solved: cps.filter((cp) => store.getProgressFor(t.id, cp.id)?.quiz_solved).length
      }))
      .sort((a, b) => b.xp - a.xp);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-xs font-extrabold tracking-[0.14em] uppercase text-white">Papan Nilai &amp; Progres Kelompok</h3>
          <span class="text-xs text-muted">${cps.length} Pos • Nilai Maksimal ${maxXp} Poin</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${ranked
            .map(
              (item, idx) => `
            <div class="p-4 bg-slate-card border border-white/10 rounded-sm flex items-center justify-between gap-3" style="border-left: 4px solid ${esc(item.team.accent_hex)}">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 shrink-0">${window.TMD.getHeroIconSvg(item.team.image_url)}</div>
                <div class="min-w-0">
                  <div class="font-display text-xs font-extrabold text-white uppercase truncate">#${idx + 1} ${esc(item.team.name)} (${esc(item.team.hero_first)} ${esc(item.team.hero_second)})</div>
                  <div class="text-xs text-muted mt-0.5">Selesai: <strong class="text-white">${item.solved} dari ${cps.length} Pos</strong></div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="px-2.5 py-1 bg-rivals-yellow/15 border border-rivals-yellow/40 text-rivals-yellow font-display text-xs font-black rounded-sm">${item.xp} Poin</span>
                <button type="button" data-reset-team="${item.team.id}" class="px-2.5 py-1 bg-rivals-red/20 hover:bg-rivals-red text-rivals-red hover:text-white font-display text-[10px] font-bold uppercase rounded-sm">
                  Ulangi
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-reset-team]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-reset-team');
        if (window.confirm('Ulangi progres kelompok ini kembali ke Pos 1?')) {
          store.resetTeamProgress(id);
          renderAdminBody();
        }
      });
    });
  }

  function renderAdminBody() {
    updateCloudBadge();
    if (!pinUnlocked) return;
    renderAdminTabs();
    const body = document.getElementById('admin-builder-body');
    if (!body) return;
    if (activeTab === 'teams') renderTeamsTab(body);
    else if (activeTab === 'checkpoints') renderCheckpointsTab(body);
    else if (activeTab === 'content') renderContentTab(body);
    else if (activeTab === 'monitor') renderMonitorTab(body);
  }

  const pinGate = document.getElementById('admin-pin-gate');
  const workspace = document.getElementById('admin-workspace');
  if (!pinUnlocked && pinGate && workspace) {
    pinGate.classList.remove('hidden');
    pinGate.classList.add('flex');
    workspace.classList.add('hidden');
    document.getElementById('admin-pin-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('admin-pin-input')?.value || '';
      if (val === store.ui.adminPin) {
        pinUnlocked = true;
        pinGate.classList.add('hidden');
        pinGate.classList.remove('flex');
        workspace.classList.remove('hidden');
        renderAdminBody();
      } else {
        showToast('PIN SALAH', 'Masukkan PIN Panitia yang benar.', 'SALAH', false);
      }
    });
  }

  store.subscribe(renderAdminBody);
  renderAdminBody();

  if (store.supabaseCfg.url && store.supabaseCfg.anonKey) {
    store.connectSupabase(store.supabaseCfg.url, store.supabaseCfg.anonKey);
  }
})();
