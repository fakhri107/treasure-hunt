// ============================================================================
// PARTICIPANT APPLICATION CONTROLLER (MARVEL RIVALS EDITION — NO GPS)
// ============================================================================
window.TMD = window.TMD || {};

(function initParticipantApp() {
  const store = window.TMD.store;
  let pendingGateCp = null;
  let activeQuestionIdx = 0;

  function showToast(title, desc, xpText, isSuccess) {
    const toast = document.getElementById('quiz-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    const toastXp = document.getElementById('toast-xp');
    if (!toast) return;

    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    toastXp.textContent = xpText;
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

  function openQrGateModal(cp) {
    const team = store.getActiveTeam();
    if (!team || !cp) return;
    const rc = store.getRouteClueFor(cp.id, team.id);
    const expectedCode = (rc?.access_token || `POS-0${cp.pos_number}`).toUpperCase();
    pendingGateCp = cp;

    const modal = document.getElementById('qr-gate-modal');
    const titleEl = document.getElementById('qr-modal-title');
    const hintEl = document.getElementById('qr-modal-hint-code');
    const inputEl = document.getElementById('qr-code-input');

    titleEl.textContent = `VERIFIKASI PASSWORD / TOKEN POS 0${cp.pos_number}`;
    hintEl.textContent = store.ui.demoShowTokenHint
      ? `DEMO HINT: ${expectedCode}`
      : 'MINTA TOKEN DARI PENJAGA POS';
    inputEl.value = '';
    inputEl.placeholder = store.ui.demoShowTokenHint
      ? `Ketik ${expectedCode}`
      : 'Ketik Password / Token Pos...';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => inputEl.focus(), 50);
  }

  function closeQrGateModal() {
    const modal = document.getElementById('qr-gate-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    pendingGateCp = null;
  }

  function tryNavigateToPos(posNum) {
    const team = store.getActiveTeam();
    const cp = store.getCheckpointByNumber(posNum);
    if (!team || !cp) return;

    if (!store.isPosReachable(team.id, cp.pos_number)) {
      showToast(
        `POS 0${cp.pos_number} MASIH TERKUNCI`,
        `Selesaikan kuis di pos sebelumnya terlebih dahulu untuk membuka petunjuk menuju Pos 0${cp.pos_number}!`,
        'TERKUNCI',
        false
      );
      return;
    }

    const prog = store.getProgressFor(team.id, cp.id);
    if (!prog || !prog.token_verified) {
      openQrGateModal(cp);
      return;
    }

    activeQuestionIdx = 0;
    store.ui.activePosNumber = cp.pos_number;
    store.notify();
  }

  function renderTeamSelector(teams, activeTeam) {
    const container = document.getElementById('team-pill-selector');
    if (!container) return;

    container.innerHTML = teams
      .map((t, idx) => {
        const isActive = activeTeam && t.id === activeTeam.id;
        return `
        <button type="button"
          class="team-pill squad-thumb ${isActive ? 'active' : ''} relative w-28 sm:w-32 shrink-0 bg-slate-card border-2 ${
            isActive ? 'border-rivals-yellow' : 'border-white/10 hover:border-white/30'
          } rounded-sm overflow-hidden text-left group"
          data-team-id="${t.id}">
          <div class="h-16 sm:h-20 w-full relative overflow-hidden bg-slate-nav flex items-center justify-center p-2">
            <div class="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-110">
              ${window.TMD.getHeroIconSvg(t.image_url)}
            </div>
            <span class="absolute top-1 left-1 px-1.5 py-0.5 bg-slate-base/90 text-[9px] font-display font-bold uppercase text-white rounded-sm">${t.route_code}</span>
          </div>
          <div class="p-2 bg-slate-nav/95">
            <div class="font-display text-[10px] font-extrabold text-white uppercase truncate">${t.hero_first} ${t.hero_second}</div>
            <div class="text-[9px] font-display font-semibold uppercase truncate" style="color:${t.accent_hex || '#FACC15'}">KLP 0${idx + 1} • ${t.color_name}</div>
          </div>
        </button>
      `;
      })
      .join('');

    container.querySelectorAll('.team-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.ui.activeTeamId = btn.getAttribute('data-team-id');
        store.notify();
        if (navigator.vibrate) navigator.vibrate(15);
      });
    });
  }

  function renderPosNavigation(cps, team, activeCp) {
    const topNav = document.getElementById('top-pos-nav');
    if (topNav) {
      topNav.innerHTML = cps
        .map((cp, idx) => {
          const reachable = store.isPosReachable(team.id, cp.pos_number);
          const prog = store.getProgressFor(team.id, cp.id);
          const solved = Boolean(prog && prog.quiz_solved);
          const isCurrent = cp.id === activeCp.id;
          const label = `POS ${cp.pos_number}`;

          const cls = isCurrent
            ? 'h-full px-1 flex items-center gap-1.5 font-display text-[11px] font-extrabold tracking-[0.14em] uppercase text-rivals-yellow border-b-2 border-rivals-yellow shrink-0'
            : reachable
              ? 'h-full px-1 flex items-center gap-1.5 font-display text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-300 hover:text-white border-b-2 border-transparent shrink-0'
              : 'h-full px-1 flex items-center gap-1.5 font-display text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 border-b-2 border-transparent shrink-0';

          const icon = solved
            ? '<span class="material-symbols-outlined text-[14px] text-rivals-mint">check_circle</span>'
            : !reachable
              ? '<span class="material-symbols-outlined text-[13px]">lock</span>'
              : '';

          return `
            ${idx > 0 ? '<span class="text-white/15 text-xs">/</span>' : ''}
            <button type="button" data-pos-num="${cp.pos_number}" class="${cls}">${icon}<span>${label}</span></button>
          `;
        })
        .join('');

      topNav.querySelectorAll('[data-pos-num]').forEach((btn) => {
        btn.addEventListener('click', () => tryNavigateToPos(Number(btn.getAttribute('data-pos-num'))));
      });
    }

    const mobNav = document.getElementById('mobile-pos-nav');
    if (mobNav) {
      mobNav.innerHTML =
        cps
          .map((cp) => {
            const prog = store.getProgressFor(team.id, cp.id);
            const solved = Boolean(prog && prog.quiz_solved);
            const isCurrent = cp.id === activeCp.id;
            return `
            <button type="button" data-mob-pos="${cp.pos_number}" class="px-2.5 py-1 flex flex-col items-center justify-center shrink-0 ${
              isCurrent ? 'text-rivals-yellow' : solved ? 'text-rivals-mint' : 'text-slate-400'
            }">
              <span class="font-display text-[10px] font-extrabold uppercase">POS 0${cp.pos_number}</span>
              <span class="text-[9px] font-semibold">${solved ? '✓' : isCurrent ? 'AKTIF' : '•'}</span>
            </button>
          `;
          })
          .join('') +
        `<button type="button" id="mob-leaderboard-btn" class="px-2.5 py-1 flex flex-col items-center justify-center text-slate-300 shrink-0">
          <span class="material-symbols-outlined text-[16px]">leaderboard</span>
          <span class="font-display text-[9px] font-bold uppercase">Skor</span>
        </button>`;

      mobNav.querySelectorAll('[data-mob-pos]').forEach((btn) => {
        btn.addEventListener('click', () => tryNavigateToPos(Number(btn.getAttribute('data-mob-pos'))));
      });
      document.getElementById('mob-leaderboard-btn')?.addEventListener('click', openLeaderboardModal);
    }
  }

  function getTeamLoginCode(team, index) {
    const order = team.sort_order || index + 1;
    return `TIM${order}`;
  }

  function findTeamByLoginCode(code) {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return null;
    const teams = store.getSortedTeams();
    return teams.find((t, idx) => {
      const order = t.sort_order || idx + 1;
      return (
        clean === `TIM${order}` ||
        clean === `TIM0${order}` ||
        clean === `KLP${order}` ||
        clean === `KLP0${order}` ||
        clean === String(order) ||
        clean === (t.route_code || '').trim().toUpperCase()
      );
    }) || null;
  }

  function renderAll() {
    const teams = store.getSortedTeams();
    const cps = store.getSortedCheckpoints();

    const loginScreen = document.getElementById('cbt-login-screen');
    const mainStage = document.getElementById('participant-main');
    const mobBar = document.getElementById('mobile-bottom-bar');
    const logoutBtn = document.getElementById('logout-team-btn');
    const topNav = document.getElementById('top-pos-nav');

    const loggedTeam = store.ui.loggedInTeamId
      ? teams.find((t) => t.id === store.ui.loggedInTeamId)
      : null;

    if (!loggedTeam) {
      if (loginScreen) loginScreen.classList.remove('hidden');
      if (mainStage) {
        mainStage.classList.add('hidden');
        mainStage.classList.remove('flex');
      }
      if (mobBar) mobBar.classList.add('hidden');
      if (logoutBtn) {
        logoutBtn.classList.add('hidden');
        logoutBtn.classList.remove('flex');
      }
      if (topNav) topNav.innerHTML = '';
      return;
    }

    if (loginScreen) loginScreen.classList.add('hidden');
    if (mainStage) {
      mainStage.classList.remove('hidden');
      mainStage.classList.add('flex');
    }
    if (mobBar) mobBar.classList.remove('hidden');
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
      logoutBtn.classList.add('flex');
    }

    store.ui.activeTeamId = loggedTeam.id;
    const team = loggedTeam;
    if (!team || cps.length === 0) return;

    let cp = store.getCheckpointByNumber(store.ui.activePosNumber);
    if (!cp) {
      cp = cps[0];
      store.ui.activePosNumber = cp.pos_number;
    }

    const cpIndex = cps.findIndex((c) => c.id === cp.id);
    const nextCp = cpIndex >= 0 && cpIndex < cps.length - 1 ? cps[cpIndex + 1] : null;
    const isLastPos = !nextCp;

    const prog = store.getProgressFor(team.id, cp.id);
    const isQrOk = cpIndex === 0 || Boolean(prog && prog.token_verified);
    const isSolved = Boolean(prog && prog.quiz_solved);

    const questions = store.getQuestionsFor(cp.id, team.id);
    if (activeQuestionIdx >= questions.length) activeQuestionIdx = 0;
    const question = questions[activeQuestionIdx] || null;
    const solvedMap = store.ui.solvedQuestionKeys || {};
    const selectedMap = store.ui.selectedOptionKeys || {};
    const activeOpt = question ? (selectedMap[`${team.id}:${question.id}`] || null) : null;
    const isCurrentQSolved = isSolved || (question ? Boolean(solvedMap[`${team.id}:${question.id}`]) : false);
    const rc = store.getRouteClueFor(cp.id, team.id);

    renderPosNavigation(cps, team, cp);

    const headerSub = document.getElementById('header-squad-count');
    if (headerSub) headerSub.textContent = 'Treasure Hunt';

    const cloudBadge = document.getElementById('cloud-sync-badge');
    if (cloudBadge) {
      cloudBadge.textContent = store.isConnected() ? 'ONLINE ✓' : 'OFFLINE';
      cloudBadge.className = store.isConnected()
        ? 'text-[10px] font-display font-bold tracking-[0.14em] text-rivals-mint uppercase'
        : 'text-[10px] font-display font-bold tracking-[0.14em] text-muted uppercase';
    }

    document.getElementById('hero-title-first').textContent = team.hero_first || 'TIM';
    document.getElementById('hero-title-second').textContent = team.hero_second || '';
    document.getElementById('active-squad-label').textContent = `${team.name.toUpperCase()} • ${team.route_code.toUpperCase()}`;
    const emblemEl = document.getElementById('squad-header-emblem');
    if (emblemEl) emblemEl.innerHTML = window.TMD.getHeroIconSvg(team.image_url);

    const totalXp = store.computeTeamXp(team.id);
    const maxXp = store.computeMaxXp();
    const headerXp = document.getElementById('header-xp-badge');
    if (headerXp) headerXp.textContent = `${totalXp} POIN`;
    document.getElementById('squad-xp-badge').textContent = `${totalXp} / ${maxXp} POIN`;
    document.getElementById('pos-subtitle').textContent = `POS ${cp.pos_number}`;
    document.getElementById('top-step-counter').textContent = `POS ${cp.pos_number} / ${cps.length}`;
    document.getElementById('active-route-indicator').textContent = `RUTE: ${team.route_code.toUpperCase()} (${team.color_name.toUpperCase()})`;

    // Token badge
    const qrStatusBadge = document.getElementById('qr-status-badge');
    const qrStatusDot = document.getElementById('qr-status-dot');
    const qrStatusText = document.getElementById('qr-status-text');
    if (isQrOk) {
      qrStatusBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rivals-mint/15 border border-rivals-mint/40 text-rivals-mint font-display text-[10px] font-bold tracking-[0.12em] uppercase rounded-sm';
      qrStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-rivals-mint';
      qrStatusText.textContent = `SANDI POS 0${cp.pos_number} BENAR ✓`;
    } else {
      qrStatusBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rivals-red/15 border border-rivals-red/50 text-rivals-red font-display text-[10px] font-bold tracking-[0.12em] uppercase rounded-sm';
      qrStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-rivals-red';
      qrStatusText.textContent = `MASUKKAN SANDI POS 0${cp.pos_number}`;
    }

    // Quiz card
    document.getElementById('quiz-category-label').textContent = cp.category_label || `KUIS POS 0${cp.pos_number}`;
    document.getElementById('quiz-reward-label').textContent = isSolved ? `✓ SELESAI (+${cp.xp_reward} POIN)` : `+${cp.xp_reward} POIN`;

    const stepperEl = document.getElementById('quiz-question-stepper');
    const counterEl = document.getElementById('quiz-question-counter');
    if (stepperEl && counterEl) {
      if (questions.length > 1) {
        stepperEl.classList.remove('hidden');
        stepperEl.classList.add('flex');
        const qDone = isSolved || (question ? Boolean(solvedMap[`${team.id}:${question.id}`]) : false);
        counterEl.textContent = `Soal ${activeQuestionIdx + 1} / ${questions.length}${qDone ? ' ✓' : ''}`;
      } else {
        stepperEl.classList.add('hidden');
        stepperEl.classList.remove('flex');
      }
    }

    document.getElementById('quiz-question-text').textContent = question
      ? question.question_text
      : 'Belum ada soal untuk pos ini. Hubungi Panitia.';

    document.querySelectorAll('.quiz-option').forEach((optBtn) => {
      const letter = optBtn.getAttribute('data-option');
      const badge = optBtn.querySelector('.option-badge');
      const textEl = optBtn.querySelector('.option-text');
      const optKey = `option_${letter.toLowerCase()}`;
      const optVal = question && question[optKey] ? question[optKey].trim() : '';

      if (question && (letter === 'C' || letter === 'D') && !optVal) {
        optBtn.classList.add('hidden');
        return;
      }
      optBtn.classList.remove('hidden');
      textEl.textContent = optVal || `Opsi ${letter}`;

      const isSelected = letter === activeOpt;
      if (isSelected) {
        const isCorrectHighlight = isCurrentQSolved && question && letter === question.correct_option;
        const borderCol = isCorrectHighlight ? '#10B981' : '#FACC15';
        optBtn.className = 'quiz-option w-full text-left p-3.5 bg-slate-hover border rounded-sm flex items-start gap-3 transition-colors';
        optBtn.style.borderColor = borderCol;
        optBtn.style.boxShadow = `inset 3px 0 0 ${borderCol}`;
        badge.className = `option-badge w-6 h-6 ${
          isCorrectHighlight ? 'bg-rivals-mint text-slate-nav' : 'bg-rivals-yellow text-slate-nav'
        } font-display text-xs font-black flex items-center justify-center shrink-0 rounded-sm`;
        textEl.className = 'option-text text-xs sm:text-sm text-white font-semibold leading-snug';
      } else {
        optBtn.className = 'quiz-option w-full text-left p-3.5 bg-slate-base/80 hover:bg-slate-hover border border-white/10 rounded-sm flex items-start gap-3 transition-colors';
        optBtn.style.borderColor = '';
        optBtn.style.boxShadow = 'none';
        badge.className = 'option-badge w-6 h-6 bg-white/10 text-slate-300 font-display text-xs font-bold flex items-center justify-center shrink-0 rounded-sm';
        textEl.className = 'option-text text-xs sm:text-sm text-slate-300 leading-snug';
      }
    });

    document.getElementById('quiz-status-hint').textContent = isCurrentQSolved && question
      ? `Terjawab benar (${question.correct_option})`
      : activeOpt
        ? `Dipilih: ${activeOpt}`
        : 'Pilih salah satu jawaban';
    document.getElementById('submit-quiz-label').textContent = isSolved
      ? !isLastPos
        ? `PETUNJUK POS 0${nextCp.pos_number} TERBUKA ✓`
        : 'SELESAI ✓'
      : 'KIRIM JAWABAN';

    // Petunjuk Pos Card
    document.getElementById('clue-distance-badge').textContent = rc?.distance_label || (nextCp ? `POS 0${nextCp.pos_number}` : 'FINISH');
    const clueCard = document.getElementById('unlocked-clue-card');
    const clueHeaderStatus = document.getElementById('clue-header-status');
    const clueLockIcon = document.getElementById('clue-lock-icon');
    const clueBadgeTitle = document.getElementById('clue-badge-title');
    const clueSectionHeading = document.getElementById('clue-section-heading');
    const clueDynamicText = document.getElementById('clue-dynamic-text');
    const arriveBtn = document.getElementById('arrive-pos2-btn');
    const arriveBtnIcon = document.getElementById('arrive-btn-icon');
    const arriveBtnLabel = document.getElementById('arrive-btn-label');

    if (isSolved) {
      clueCard.style.borderColor = 'rgba(16, 185, 129, 0.45)';
      clueHeaderStatus.className = 'flex items-center gap-1.5 text-rivals-mint font-display text-[11px] font-extrabold tracking-[0.12em] uppercase';
      clueLockIcon.textContent = !isLastPos ? 'lock_open_right' : 'workspace_premium';
      clueBadgeTitle.textContent = !isLastPos
        ? `PETUNJUK POS 0${nextCp.pos_number} (TERBUKA)`
        : `SELESAI! (${team.name.toUpperCase()})`;
      clueSectionHeading.textContent = !isLastPos
        ? `PETUNJUK MENUJU POS 0${nextCp.pos_number}:`
        : 'INSTRUKSI AKHIR:';
      clueDynamicText.textContent = `“${rc?.next_clue_text || 'Lanjutkan perjalanan menuju pos berikutnya!'}”`;
      clueDynamicText.className = 'text-sm text-white leading-relaxed pl-3.5 border-l-2 border-rivals-mint';

      if (!isLastPos) {
        const nextProg = store.getProgressFor(team.id, nextCp.id);
        const nextVerified = Boolean(nextProg && nextProg.token_verified);
        arriveBtn.className = 'w-full py-3 px-4 bg-rivals-mint hover:brightness-110 text-slate-nav font-display text-xs font-black tracking-[0.12em] uppercase flex items-center justify-center gap-2 rounded-sm transition-all';
        arriveBtnIcon.textContent = nextVerified ? 'arrow_forward' : 'vpn_key';
        arriveBtnLabel.textContent = nextVerified ? `Buka Pos 0${nextCp.pos_number}` : `Masukkan Sandi Pos 0${nextCp.pos_number}`;
      } else {
        arriveBtn.className = 'w-full py-3 px-4 bg-rivals-yellow text-slate-nav font-display text-xs font-black tracking-[0.12em] uppercase flex items-center justify-center gap-2 rounded-sm';
        arriveBtnIcon.textContent = 'military_tech';
        arriveBtnLabel.textContent = 'Semua Pos Selesai ✓';
      }
    } else {
      clueCard.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      clueHeaderStatus.className = 'flex items-center gap-1.5 text-rivals-red font-display text-[11px] font-extrabold tracking-[0.12em] uppercase';
      clueLockIcon.textContent = 'lock';
      clueBadgeTitle.textContent = !isLastPos ? `PETUNJUK POS 0${nextCp.pos_number} (TERKUNCI)` : 'POS TERAKHIR (TERKUNCI)';
      clueSectionHeading.textContent = 'PETUNJUK LOKASI BERIKUTNYA:';
      clueDynamicText.textContent = `Selesaikan kuis Pos 0${cp.pos_number} di sebelah kiri untuk membuka petunjuk menuju pos berikutnya.`;
      clueDynamicText.className = 'text-sm text-slate-400 leading-relaxed pl-3.5 border-l-2 border-white/15';

      arriveBtn.className = 'w-full py-3 px-4 bg-white/10 text-slate-400 font-display text-xs font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-2 rounded-sm cursor-not-allowed';
      arriveBtnIcon.textContent = 'lock';
      arriveBtnLabel.textContent = !isLastPos ? `Pos 0${nextCp.pos_number} Terkunci` : 'Pos Terakhir Terkunci';
    }
  }

  function openLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    const list = document.getElementById('leaderboard-list');
    const teams = store.getSortedTeams();
    const cps = store.getSortedCheckpoints();
    const maxXp = store.computeMaxXp();

    const ranked = [...teams]
      .map((t) => ({
        team: t,
        xp: store.computeTeamXp(t.id),
        solved: cps.filter((c) => store.getProgressFor(t.id, c.id)?.quiz_solved).length
      }))
      .sort((a, b) => b.xp - a.xp);

    list.innerHTML = ranked
      .map(
        (item, idx) => `
      <div class="p-3.5 bg-slate-base border border-white/10 rounded-sm flex items-center justify-between gap-3" style="border-left: 3px solid ${item.team.accent_hex || '#FACC15'}">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 bg-slate-nav font-display text-xs font-black flex items-center justify-center text-white rounded-sm">#${idx + 1}</span>
          <div>
            <div class="font-display text-xs font-extrabold text-white uppercase">${item.team.name} (${item.team.hero_first} ${item.team.hero_second})</div>
            <div class="text-[11px] text-muted">Pos Selesai: ${item.solved} / ${cps.length} • ${item.team.route_code}</div>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-rivals-yellow/15 border border-rivals-yellow/40 text-rivals-yellow font-display text-xs font-black rounded-sm">${item.xp} / ${maxXp} XP</span>
      </div>
    `
      )
      .join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function bindEvents() {
    store.subscribe(renderAll);

    document.querySelectorAll('.quiz-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const team = store.getActiveTeam();
        const cp = store.getCheckpointByNumber(store.ui.activePosNumber);
        if (!team || !cp) return;
        const questions = store.getQuestionsFor(cp.id, team.id);
        const question = questions[activeQuestionIdx] || null;
        if (!question) return;
        const chosen = opt.getAttribute('data-option');
        store.ui.selectedOptionKeys = store.ui.selectedOptionKeys || {};
        store.ui.selectedOptionKeys[`${team.id}:${question.id}`] = chosen;
        store.notify();
        if (navigator.vibrate) navigator.vibrate(12);
      });
    });

    document.getElementById('prev-question-btn')?.addEventListener('click', () => {
      const team = store.getActiveTeam();
      const cp = store.getCheckpointByNumber(store.ui.activePosNumber);
      if (!team || !cp) return;
      const questions = store.getQuestionsFor(cp.id, team.id);
      if (questions.length <= 1) return;
      activeQuestionIdx = (activeQuestionIdx - 1 + questions.length) % questions.length;
      renderAll();
    });

    document.getElementById('next-question-btn')?.addEventListener('click', () => {
      const team = store.getActiveTeam();
      const cp = store.getCheckpointByNumber(store.ui.activePosNumber);
      if (!team || !cp) return;
      const questions = store.getQuestionsFor(cp.id, team.id);
      if (questions.length <= 1) return;
      activeQuestionIdx = (activeQuestionIdx + 1) % questions.length;
      renderAll();
    });

    document.getElementById('submit-quiz-btn')?.addEventListener('click', () => {
      const team = store.getActiveTeam();
      const cps = store.getSortedCheckpoints();
      const cp = store.getCheckpointByNumber(store.ui.activePosNumber);
      const questions = store.getQuestionsFor(cp.id, team.id);
      const question = questions[activeQuestionIdx] || null;
      if (!team || !cp || !question) return;

      const prog = store.getProgressFor(team.id, cp.id);
      const isFirstPos = cps[0] && cp.id === cps[0].id;
      if (!isFirstPos && (!prog || !prog.token_verified)) {
        openQrGateModal(cp);
        return;
      }

      const selectedMap = store.ui.selectedOptionKeys || {};
      const chosen = selectedMap[`${team.id}:${question.id}`] || null;
      if (!chosen) {
        showToast('PILIH JAWABAN DULU', 'Ketuk salah satu pilihan jawaban sebelum mengirim.', 'PILIH', false);
        return;
      }

      if (chosen === question.correct_option) {
        store.ui.solvedQuestionKeys = store.ui.solvedQuestionKeys || {};
        store.ui.solvedQuestionKeys[`${team.id}:${question.id}`] = true;

        const nextUnsolvedIdx = questions.findIndex((q) => !store.ui.solvedQuestionKeys[`${team.id}:${q.id}`]);
        if (nextUnsolvedIdx >= 0) {
          activeQuestionIdx = nextUnsolvedIdx;
          store.notify();
          showToast(
            `SOAL ${questions.indexOf(question) + 1} / ${questions.length} BENAR ✓`,
            `Lanjutkan ke Soal ${nextUnsolvedIdx + 1} untuk membuka petunjuk berikutnya!`,
            'LANJUT',
            true
          );
          return;
        }

        store.upsertProgress(team.id, cp.id, {
          quiz_solved: true,
          selected_option: chosen,
          solved_at: new Date().toISOString()
        });
        const cpIdx = cps.findIndex((c) => c.id === cp.id);
        const nextCp = cpIdx >= 0 && cpIdx < cps.length - 1 ? cps[cpIdx + 1] : null;
        showToast(
          nextCp ? `POS 0${cp.pos_number} SELESAI` : 'SEMUA POS SELESAI',
          nextCp
            ? `Petunjuk menuju Pos 0${nextCp.pos_number} kini terbuka!`
            : `Selamat! ${team.name} telah menyelesaikan seluruh rangkaian pos!`,
          `+${cp.xp_reward} POIN`,
          true
        );
      } else {
        showToast(
          `JAWABAN BELUM TEPAT`,
          'Diskusikan kembali bersama kelompokmu dan pilih jawaban yang paling tepat.',
          'COBA LAGI',
          false
        );
      }
    });

    document.getElementById('arrive-pos2-btn')?.addEventListener('click', () => {
      const team = store.getActiveTeam();
      const cps = store.getSortedCheckpoints();
      const cp = store.getCheckpointByNumber(store.ui.activePosNumber);
      const prog = store.getProgressFor(team.id, cp.id);
      if (!prog || !prog.quiz_solved) {
        showToast('SELESAIKAN KUIS DULU', `Jawab soal Pos 0${cp.pos_number} dengan benar terlebih dahulu.`, 'TERKUNCI', false);
        return;
      }
      const cpIdx = cps.findIndex((c) => c.id === cp.id);
      if (cpIdx < cps.length - 1) {
        tryNavigateToPos(cps[cpIdx + 1].pos_number);
      } else {
        showToast('MISI SELESAI 100%', `Total skor skuad: ${store.computeTeamXp(team.id)} XP!`, 'SELESAI', true);
      }
    });

    document.getElementById('qr-status-badge')?.addEventListener('click', () => {
      const cp = store.getCheckpointByNumber(store.ui.activePosNumber);
      if (cp) openQrGateModal(cp);
    });

    document.getElementById('close-qr-modal-btn')?.addEventListener('click', closeQrGateModal);
    document.getElementById('verify-qr-code-btn')?.addEventListener('click', () => {
      if (!pendingGateCp) return;
      const team = store.getActiveTeam();
      const rc = store.getRouteClueFor(pendingGateCp.id, team.id);
      const expected = (rc?.access_token || `POS-0${pendingGateCp.pos_number}`).trim().toUpperCase();
      const entered = (document.getElementById('qr-code-input')?.value || '').trim().toUpperCase();
      if (entered === expected) {
        store.upsertProgress(team.id, pendingGateCp.id, {
          token_verified: true,
          verified_at: new Date().toISOString()
        });
        store.ui.activePosNumber = pendingGateCp.pos_number;
        store.notify();
        const unlockedPos = pendingGateCp.pos_number;
        const unlockedTitle = pendingGateCp.title;
        closeQrGateModal();
        showToast(`TOKEN POS 0${unlockedPos} VALID ✓`, `Soal ${unlockedTitle} kini terbuka.`, `POS 0${unlockedPos}`, true);
      } else {
        showToast('TOKEN TIDAK SESUAI', 'Periksa kembali Password/Token dari Penjaga Pos.', 'INVALID', false);
      }
    });
    document.getElementById('qr-code-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('verify-qr-code-btn')?.click();
    });

    document.getElementById('reset-progress-btn')?.addEventListener('click', () => {
      const team = store.getActiveTeam();
      if (!team) return;
      if (window.confirm(`Reset progres ${team.name} kembali ke Pos 01?`)) {
        store.resetTeamProgress(team.id);
        showToast(`PROGRES DIRESET`, `${team.name} kembali ke Pos 01.`, 'RESET', true);
      }
    });

    document.getElementById('open-leaderboard-btn')?.addEventListener('click', openLeaderboardModal);
    document.getElementById('close-leaderboard-modal-btn')?.addEventListener('click', closeLeaderboardModal);

    document.getElementById('cbt-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('cbt-login-code-input');
      const errEl = document.getElementById('cbt-login-error');
      const matched = findTeamByLoginCode(input?.value);
      if (!matched) {
        if (errEl) {
          errEl.textContent = 'Kode regu tidak ditemukan. Cek kembali kode dari panitia (contoh: TIM1, TIM2, TIM3...).';
          errEl.classList.remove('hidden');
        }
        return;
      }
      if (errEl) errEl.classList.add('hidden');
      activeQuestionIdx = 0;
      store.ui.loggedInTeamId = matched.id;
      store.ui.activeTeamId = matched.id;
      store.ui.activePosNumber = 1;
      store.notify();
      showToast(`SELAMAT DATANG`, `${matched.name} (${matched.hero_first} ${matched.hero_second}) siap bertugas!`, `TIM${matched.sort_order || ''}`, true);
    });

    document.getElementById('logout-team-btn')?.addEventListener('click', () => {
      if (window.confirm('Keluar dari regu ini dan kembali ke halaman login peserta?')) {
        store.ui.loggedInTeamId = null;
        store.notify();
      }
    });
  }

  // Cek parameter URL ?tim=1 jika ada
  const urlTim = new URLSearchParams(window.location.search).get('tim');
  if (urlTim) {
    const matched = findTeamByLoginCode(urlTim);
    if (matched) {
      store.ui.loggedInTeamId = matched.id;
      store.ui.activeTeamId = matched.id;
    }
  }

  bindEvents();
  renderAll();

  if (store.supabaseCfg.url && store.supabaseCfg.anonKey) {
    store.connectSupabase(store.supabaseCfg.url, store.supabaseCfg.anonKey);
  }
})();
