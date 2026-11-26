// ============================================================================
// DATA STORE & SUPABASE REALTIME SYNC MANAGER
// ============================================================================
window.TMD = window.TMD || {};

(function initStoreModule() {
  const DATA_KEY = 'tmd_dataset_v7';
  const UI_KEY = 'tmd_ui_v7';
  const SUPABASE_KEY = 'tmd_supabase_cfg_v1';

  let sbClient = null;
  let realtimeChannel = null;
  let isConnected = false;
  const listeners = new Set();

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function validateDataset(ds) {
    if (!ds || !Array.isArray(ds.teams) || !Array.isArray(ds.checkpoints)) {
      return window.TMD.createDefaultDataset();
    }
    if (ds.teams.length === 0 || ds.checkpoints.length === 0) {
      return window.TMD.createDefaultDataset();
    }
    return {
      teams: ds.teams,
      checkpoints: ds.checkpoints,
      questions: Array.isArray(ds.questions) ? ds.questions : [],
      route_clues: Array.isArray(ds.route_clues) ? ds.route_clues : [],
      team_progress: Array.isArray(ds.team_progress) ? ds.team_progress : []
    };
  }

  const data = validateDataset(loadJson(DATA_KEY, null));
  const ui = Object.assign(
    {
      activeTeamId: data.teams[0]?.id || null,
      loggedInTeamId: null,
      activePosNumber: 1,
      demoShowTokenHint: false,
      adminPin: '',
      solvedQuestionKeys: {},
      selectedOptionKeys: {}
    },
    loadJson(UI_KEY, {})
  );
  const DEFAULT_SUPABASE_CFG = {
    url: 'https://jfgloeoyrvecdlqispjn.supabase.co',
    anonKey: 'sb_publishable_dBEvA8OBISGqjQ1DrzH-Ug_l0QINfHk'
  };
  const savedSbCfg = loadJson(SUPABASE_KEY, {});
  const rawSavedUrl = savedSbCfg && savedSbCfg.url ? savedSbCfg.url : '';
  const supabaseCfg = {
    url:
      !rawSavedUrl || rawSavedUrl === 'https://jfglceoyrvecdlqispjn.supabase.co'
        ? DEFAULT_SUPABASE_CFG.url
        : rawSavedUrl,
    anonKey: (savedSbCfg && savedSbCfg.anonKey) || DEFAULT_SUPABASE_CFG.anonKey
  };

  function notify() {
    saveJson(DATA_KEY, data);
    saveJson(UI_KEY, ui);
    listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Store listener error:', e);
      }
    });
  }

  function subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  // ---- Query Helpers ----
  function getSortedTeams() {
    return [...data.teams].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  function getSortedCheckpoints() {
    return [...data.checkpoints].sort((a, b) => (a.pos_number || 0) - (b.pos_number || 0));
  }

  function getActiveTeam() {
    const teams = getSortedTeams();
    return teams.find((t) => t.id === ui.activeTeamId) || teams[0] || null;
  }

  function getCheckpointByNumber(posNum) {
    const cps = getSortedCheckpoints();
    return cps.find((c) => Number(c.pos_number) === Number(posNum)) || cps[0] || null;
  }

  function getQuestionsFor(checkpointId, teamId) {
    const specific = data.questions.filter(
      (q) => q.checkpoint_id === checkpointId && q.team_id === teamId
    );
    if (specific.length > 0) return specific;
    return data.questions.filter((q) => q.checkpoint_id === checkpointId && !q.team_id);
  }

  function getQuestionFor(checkpointId, teamId) {
    return getQuestionsFor(checkpointId, teamId)[0] || null;
  }

  function getRouteClueFor(checkpointId, teamId) {
    return (
      data.route_clues.find(
        (rc) => rc.checkpoint_id === checkpointId && rc.team_id === teamId
      ) || null
    );
  }

  function getProgressFor(teamId, checkpointId) {
    return (
      data.team_progress.find(
        (p) => p.team_id === teamId && p.checkpoint_id === checkpointId
      ) || null
    );
  }

  function computeTeamXp(teamId) {
    let total = 0;
    data.checkpoints.forEach((cp) => {
      const prog = getProgressFor(teamId, cp.id);
      if (prog && prog.quiz_solved) total += Number(cp.xp_reward || 0);
    });
    return total;
  }

  function computeMaxXp() {
    return data.checkpoints.reduce((acc, cp) => acc + Number(cp.xp_reward || 0), 0);
  }

  function isPosReachable(teamId, posNumber) {
    const cps = getSortedCheckpoints();
    const idx = cps.findIndex((c) => Number(c.pos_number) === Number(posNumber));
    if (idx <= 0) return true;
    const prevCp = cps[idx - 1];
    const prevProg = getProgressFor(teamId, prevCp.id);
    return Boolean(prevProg && prevProg.quiz_solved);
  }

  // ---- Supabase Sync Helpers ----
  async function sbUpsert(table, rows, conflictCol) {
    if (!sbClient || !isConnected) return;
    try {
      const q = conflictCol
        ? sbClient.from(table).upsert(rows, { onConflict: conflictCol })
        : sbClient.from(table).upsert(rows);
      const { error } = await q;
      if (error) console.warn(`Supabase upsert [${table}] error:`, error.message);
    } catch (e) {
      console.warn(`Supabase upsert [${table}] exception:`, e);
    }
  }

  async function sbDelete(table, id) {
    if (!sbClient || !isConnected) return;
    try {
      const { error } = await sbClient.from(table).delete().eq('id', id);
      if (error) console.warn(`Supabase delete [${table}] error:`, error.message);
    } catch (e) {
      console.warn(`Supabase delete [${table}] exception:`, e);
    }
  }

  async function pullFromSupabase() {
    if (!sbClient) throw new Error('Supabase belum dikonfigurasi.');
    const [tRes, cRes, qRes, rRes, pRes] = await Promise.all([
      sbClient.from('teams').select('*').order('sort_order', { ascending: true }),
      sbClient.from('checkpoints').select('*').order('pos_number', { ascending: true }),
      sbClient.from('questions').select('*'),
      sbClient.from('route_clues').select('*'),
      sbClient.from('team_progress').select('*')
    ]);
    const err = tRes.error || cRes.error || qRes.error || rRes.error || pRes.error;
    if (err) throw err;

    if (tRes.data && tRes.data.length > 0) data.teams = tRes.data;
    if (cRes.data && cRes.data.length > 0) data.checkpoints = cRes.data;
    if (qRes.data && qRes.data.length > 0) data.questions = qRes.data;
    if (rRes.data && rRes.data.length > 0) data.route_clues = rRes.data;
    if (pRes.data && pRes.data.length > 0) data.team_progress = pRes.data;

    // Jika Supabase punya teams/checkpoints tapi questions/route_clues masih kosong, isi otomatis lengkap agar ID cocok!
    if ((qRes.data && qRes.data.length === 0) || (rRes.data && rRes.data.length === 0)) {
      const fresh = window.TMD.createDefaultDataset();
      data.teams = fresh.teams;
      data.checkpoints = fresh.checkpoints;
      data.questions = fresh.questions;
      data.route_clues = fresh.route_clues;
      data.team_progress = fresh.team_progress;
      await pushAllToSupabase({ resetFirst: true });
    }

    if (!data.teams.some((t) => t.id === ui.activeTeamId)) {
      ui.activeTeamId = data.teams[0]?.id || null;
    }
    notify();
    return true;
  }

  async function pushAllToSupabase(opts) {
    if (!sbClient) throw new Error('Supabase belum dikonfigurasi.');
    if (opts && opts.resetFirst) {
      const NIL_UUID = '00000000-0000-0000-0000-000000000000';
      await sbClient.from('team_progress').delete().neq('id', NIL_UUID);
      await sbClient.from('route_clues').delete().neq('id', NIL_UUID);
      await sbClient.from('questions').delete().neq('id', NIL_UUID);
      await sbClient.from('checkpoints').delete().neq('id', NIL_UUID);
      await sbClient.from('teams').delete().neq('id', NIL_UUID);
    }
    if (data.teams.length) {
      const { error } = await sbClient.from('teams').upsert(data.teams, { onConflict: 'id' });
      if (error) throw error;
    }
    if (data.checkpoints.length) {
      const { error } = await sbClient.from('checkpoints').upsert(data.checkpoints, { onConflict: 'id' });
      if (error) throw error;
    }
    if (data.questions.length) {
      const { error } = await sbClient.from('questions').upsert(data.questions, { onConflict: 'id' });
      if (error) throw error;
    }
    if (data.route_clues.length) {
      const { error } = await sbClient.from('route_clues').upsert(data.route_clues, { onConflict: 'id' });
      if (error) throw error;
    }
    if (data.team_progress.length) {
      const { error } = await sbClient.from('team_progress').upsert(data.team_progress, { onConflict: 'id' });
      if (error) throw error;
    }
    return true;
  }

  function setupRealtime() {
    if (!sbClient) return;
    if (realtimeChannel) {
      sbClient.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    const applyRealtimeRow = (table, payload) => {
      const { eventType, new: newRow, old: oldRow } = payload;
      const arr = data[table];
      if (!Array.isArray(arr)) return;
      if (eventType === 'DELETE' && oldRow?.id) {
        data[table] = arr.filter((item) => item.id !== oldRow.id);
      } else if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow?.id) {
        const idx = arr.findIndex((item) => item.id === newRow.id);
        if (idx >= 0) arr[idx] = newRow;
        else arr.push(newRow);
      }
      notify();
    };

    realtimeChannel = sbClient
      .channel('tmd-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (p) => applyRealtimeRow('teams', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkpoints' }, (p) => applyRealtimeRow('checkpoints', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, (p) => applyRealtimeRow('questions', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'route_clues' }, (p) => applyRealtimeRow('route_clues', p))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_progress' }, (p) => applyRealtimeRow('team_progress', p))
      .subscribe();
  }

  async function connectSupabase(url, anonKey) {
    const cleanUrl = (url || '').trim();
    const cleanKey = (anonKey || '').trim();
    supabaseCfg.url = cleanUrl;
    supabaseCfg.anonKey = cleanKey;
    saveJson(SUPABASE_KEY, supabaseCfg);

    if (!cleanUrl || !cleanKey || !window.supabase) {
      sbClient = null;
      isConnected = false;
      notify();
      return { connected: false, reason: 'URL atau Anon Key kosong.' };
    }

    try {
      sbClient = window.supabase.createClient(cleanUrl, cleanKey);
      const { data: existingTeams, error } = await sbClient.from('teams').select('id').limit(1);
      if (error) throw error;
      isConnected = true;
      if (!existingTeams || existingTeams.length === 0) {
        await pushAllToSupabase();
      } else {
        await pullFromSupabase();
      }
      setupRealtime();
      notify();
      return { connected: true };
    } catch (err) {
      isConnected = false;
      notify();
      const rawMsg = err?.message || String(err || '');
      let friendly = rawMsg || 'Gagal terhubung ke Supabase.';
      if (/failed to fetch|networkerror|load failed/i.test(rawMsg)) {
        friendly = `Gagal menghubungi server (${cleanUrl}). Pastikan URL proyek Supabase benar (cek di Dashboard Supabase -> Connect / Data API) dan proyek tidak sedang paused.`;
      } else if (/relation|does not exist|schema cache/i.test(rawMsg)) {
        friendly = 'Tabel database belum dibuat. Jalankan skrip supabase_schema.sql di SQL Editor Supabase terlebih dahulu.';
      } else if (/permission denied/i.test(rawMsg)) {
        friendly = 'Izin akses tabel Supabase belum dibuka (permission denied). Jalankan perintah GRANT di SQL Editor Supabase.';
      }
      return { connected: false, reason: friendly };
    }
  }

  // ---- CRUD Mutations ----
  function upsertTeam(teamObj) {
    const row = Object.assign(
      {
        id: window.TMD.generateUuid(),
        sort_order: data.teams.length + 1,
        name: 'Kelompok Baru',
        division_title: '',
        color_name: 'Merah',
        accent_hex: '#EF4444',
        route_code: 'Rute Baru',
        hero_first: 'TIM',
        hero_second: 'BARU',
        image_url: 'iron-man'
      },
      teamObj
    );
    const idx = data.teams.findIndex((t) => t.id === row.id);
    if (idx >= 0) data.teams[idx] = row;
    else {
      data.teams.push(row);
      // Auto-create Pos 1 token_verified progress & default route_clues
      const cps = getSortedCheckpoints();
      cps.forEach((cp, cpIdx) => {
        const clue = {
          id: window.TMD.generateUuid(),
          checkpoint_id: cp.id,
          team_id: row.id,
          access_token: `${row.hero_first.slice(0, 5).toUpperCase()}-0${cp.pos_number}`,
          next_clue_text: `Petunjuk menuju pos berikutnya untuk ${row.name}.`,
          distance_label: '~100M'
        };
        data.route_clues.push(clue);
        sbUpsert('route_clues', clue, 'id');
        if (cpIdx === 0) {
          const prog = {
            id: window.TMD.generateUuid(),
            team_id: row.id,
            checkpoint_id: cp.id,
            token_verified: true,
            quiz_solved: false,
            selected_option: 'A',
            verified_at: new Date().toISOString(),
            solved_at: null
          };
          data.team_progress.push(prog);
          sbUpsert('team_progress', prog, 'id');
        }
      });
    }
    notify();
    sbUpsert('teams', row, 'id');
    return row;
  }

  function deleteTeam(teamId) {
    if (data.teams.length <= 1) return false;
    data.teams = data.teams.filter((t) => t.id !== teamId);
    data.route_clues = data.route_clues.filter((rc) => rc.team_id !== teamId);
    data.team_progress = data.team_progress.filter((p) => p.team_id !== teamId);
    data.questions = data.questions.filter((q) => q.team_id !== teamId);
    if (ui.activeTeamId === teamId) {
      ui.activeTeamId = getSortedTeams()[0]?.id || null;
    }
    notify();
    sbDelete('teams', teamId);
    return true;
  }

  function upsertCheckpoint(cpObj) {
    const row = Object.assign(
      {
        id: window.TMD.generateUuid(),
        pos_number: data.checkpoints.length + 1,
        title: 'POS BARU',
        category_label: 'UJI KEPEMIMPINAN',
        xp_reward: 150,
        lat: -6.2085,
        lng: 106.8458,
        is_convergence: false
      },
      cpObj
    );
    const idx = data.checkpoints.findIndex((c) => c.id === row.id);
    if (idx >= 0) data.checkpoints[idx] = row;
    else {
      data.checkpoints.push(row);
      // Create default route_clues for all teams
      data.teams.forEach((t) => {
        const clue = {
          id: window.TMD.generateUuid(),
          checkpoint_id: row.id,
          team_id: t.id,
          access_token: `${(t.hero_first || 'POS').slice(0, 5).toUpperCase()}-0${row.pos_number}`,
          next_clue_text: `Petunjuk menuju pos berikutnya dari ${row.title}.`,
          distance_label: '~100M'
        };
        data.route_clues.push(clue);
        sbUpsert('route_clues', clue, 'id');
      });
    }
    notify();
    sbUpsert('checkpoints', row, 'id');
    return row;
  }

  function deleteCheckpoint(cpId) {
    if (data.checkpoints.length <= 1) return false;
    data.checkpoints = data.checkpoints.filter((c) => c.id !== cpId);
    data.questions = data.questions.filter((q) => q.checkpoint_id !== cpId);
    data.route_clues = data.route_clues.filter((rc) => rc.checkpoint_id !== cpId);
    data.team_progress = data.team_progress.filter((p) => p.checkpoint_id !== cpId);
    const cps = getSortedCheckpoints();
    if (!cps.some((c) => Number(c.pos_number) === Number(ui.activePosNumber))) {
      ui.activePosNumber = cps[0]?.pos_number || 1;
    }
    notify();
    sbDelete('checkpoints', cpId);
    return true;
  }

  function upsertQuestion(qObj) {
    const row = Object.assign(
      {
        id: window.TMD.generateUuid(),
        checkpoint_id: getSortedCheckpoints()[0]?.id,
        team_id: null,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
      },
      qObj
    );
    const idx = data.questions.findIndex((q) => q.id === row.id);
    if (idx >= 0) data.questions[idx] = row;
    else data.questions.push(row);
    notify();
    sbUpsert('questions', row, 'id');
    return row;
  }

  function deleteQuestion(questionId) {
    data.questions = data.questions.filter((q) => q.id !== questionId);
    notify();
    sbDelete('questions', questionId);
  }

  function upsertRouteClue(rcObj) {
    const existing = data.route_clues.find(
      (rc) => rc.checkpoint_id === rcObj.checkpoint_id && rc.team_id === rcObj.team_id
    );
    const row = Object.assign(
      {
        id: existing ? existing.id : window.TMD.generateUuid(),
        distance_label: '~100M'
      },
      existing || {},
      rcObj
    );
    const idx = data.route_clues.findIndex((rc) => rc.id === row.id);
    if (idx >= 0) data.route_clues[idx] = row;
    else data.route_clues.push(row);
    notify();
    sbUpsert('route_clues', row, 'id');
    return row;
  }

  function upsertProgress(teamId, checkpointId, patch) {
    const existing = getProgressFor(teamId, checkpointId);
    const row = Object.assign(
      {
        id: existing ? existing.id : window.TMD.generateUuid(),
        team_id: teamId,
        checkpoint_id: checkpointId,
        token_verified: false,
        quiz_solved: false,
        selected_option: 'A',
        verified_at: null,
        solved_at: null
      },
      existing || {},
      patch
    );
    const idx = data.team_progress.findIndex((p) => p.id === row.id);
    if (idx >= 0) data.team_progress[idx] = row;
    else data.team_progress.push(row);
    notify();
    sbUpsert('team_progress', row, 'id');
    return row;
  }

  function resetTeamProgress(teamId) {
    const firstCp = getSortedCheckpoints()[0];
    data.team_progress = data.team_progress.filter((p) => p.team_id !== teamId);
    if (ui.solvedQuestionKeys) {
      Object.keys(ui.solvedQuestionKeys).forEach((k) => {
        if (k.startsWith(`${teamId}:`)) delete ui.solvedQuestionKeys[k];
      });
    }
    if (ui.selectedOptionKeys) {
      Object.keys(ui.selectedOptionKeys).forEach((k) => {
        if (k.startsWith(`${teamId}:`)) delete ui.selectedOptionKeys[k];
      });
    }
    if (firstCp) {
      data.team_progress.push({
        id: window.TMD.generateUuid(),
        team_id: teamId,
        checkpoint_id: firstCp.id,
        token_verified: true,
        quiz_solved: false,
        selected_option: 'A',
        verified_at: new Date().toISOString(),
        solved_at: null
      });
    }
    if (ui.activeTeamId === teamId && firstCp) {
      ui.activePosNumber = firstCp.pos_number;
    }
    notify();
    if (sbClient && isConnected) {
      sbClient
        .from('team_progress')
        .delete()
        .eq('team_id', teamId)
        .then(() => {
          const prog = getProgressFor(teamId, firstCp?.id);
          if (prog) sbUpsert('team_progress', prog, 'id');
        });
    }
  }

  function loadDefaultMarvelTemplate() {
    const fresh = window.TMD.createDefaultDataset();
    data.teams = fresh.teams;
    data.checkpoints = fresh.checkpoints;
    data.questions = fresh.questions;
    data.route_clues = fresh.route_clues;
    data.team_progress = fresh.team_progress;
    ui.activeTeamId = data.teams[0].id;
    ui.activePosNumber = data.checkpoints[0].pos_number;
    notify();
    if (sbClient && isConnected) {
      pushAllToSupabase({ resetFirst: true }).catch((e) => console.warn('Auto-push template error:', e));
    }
  }

  function importFullDataset(jsonObj) {
    const validated = validateDataset(jsonObj);
    data.teams = validated.teams;
    data.checkpoints = validated.checkpoints;
    data.questions = validated.questions;
    data.route_clues = validated.route_clues;
    data.team_progress = validated.team_progress;
    ui.activeTeamId = data.teams[0]?.id || null;
    ui.activePosNumber = getSortedCheckpoints()[0]?.pos_number || 1;
    notify();
  }

  window.TMD.store = {
    data,
    ui,
    supabaseCfg,
    isConnected: () => isConnected,
    subscribe,
    notify,
    getSortedTeams,
    getSortedCheckpoints,
    getActiveTeam,
    getCheckpointByNumber,
    getQuestionsFor,
    getQuestionFor,
    getRouteClueFor,
    getProgressFor,
    computeTeamXp,
    computeMaxXp,
    isPosReachable,
    connectSupabase,
    pullFromSupabase,
    pushAllToSupabase,
    upsertTeam,
    deleteTeam,
    upsertCheckpoint,
    deleteCheckpoint,
    upsertQuestion,
    deleteQuestion,
    upsertRouteClue,
    upsertProgress,
    resetTeamProgress,
    loadDefaultMarvelTemplate,
    importFullDataset
  };
})();
