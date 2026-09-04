(async () => {
  const root = document.getElementById('zzz-universal-planner');

  // JSON-compatible source of truth. Replace this object to update channels,
  // dates, pity rules, defaults, Agent assignments, and initial priority.
  const PLANNER_CONFIG = window.ZZZ_PLANNER_CONFIG;
  const translations = window.ZZZ_PLANNER_LOCALES;
  const localeLoader = window.ZZZLocaleLoader;
  const loadLocale = localeLoader?.load;

  if (!PLANNER_CONFIG || !translations || !loadLocale) {
    throw new Error('Planner configuration or locale loader is unavailable.');
  }

  const els = {
    languageSelect: root.querySelector('#t-language-select'), themeSelect: root.querySelector('#t-theme-select'),
    currentSearches: root.querySelector('#t-current-searches'), resourceBreakdown: root.querySelector('#t-resource-breakdown'),
    resourceAmounts: Object.fromEntries([...root.querySelectorAll('.t-resource-amount')].map(input => [input.dataset.resource, input])),
    resourceEnabled: Object.fromEntries([...root.querySelectorAll('.t-resource-enabled')].map(input => [input.dataset.resource, input])),
    pullTracker: root.querySelector('#t-pull-tracker'), useTrackedIncome: root.querySelector('#t-use-tracked-income'), trackedIncomeBasis: root.querySelector('#t-tracked-income-basis'),
    pullSnapshotForm: root.querySelector('#t-pull-snapshot-form'), pullSnapshotDate: root.querySelector('#t-pull-snapshot-date'),
    pullSnapshotSpent: root.querySelector('#t-pull-snapshot-spent'), pullSnapshotPurchased: root.querySelector('#t-pull-snapshot-purchased'), pullSnapshotAdjustment: root.querySelector('#t-pull-snapshot-adjustment'),
    recordPullSnapshot: root.querySelector('#t-record-pull-snapshot'), pullGainTotal: root.querySelector('#t-pull-gain-total'), pullGainSeven: root.querySelector('#t-pull-gain-seven'), pullGainThirty: root.querySelector('#t-pull-gain-thirty'), pullGainAverage: root.querySelector('#t-pull-gain-average'),
    pullHistoryWrap: root.querySelector('#t-pull-history-wrap'), pullHistoryRows: root.querySelector('#t-pull-history-rows'), pullHistoryEmpty: root.querySelector('#t-pull-history-empty'), pullTrackerMessage: root.querySelector('#t-pull-tracker-message'),
    exportPullHistory: root.querySelector('#t-export-pull-history'), importPullHistory: root.querySelector('#t-import-pull-history'), importPullHistoryFile: root.querySelector('#t-import-pull-history-file'),
    incomeNote: root.querySelector('#t-income-note'), agentChannelRows: root.querySelector('#t-agent-channel-rows'), wEngineChannelRows: root.querySelector('#t-w-engine-channel-rows'), agentRows: root.querySelector('#t-agent-rows'), error: root.querySelector('#t-error'),
    order: root.querySelector('#t-order'), summary: root.querySelector('#t-summary'), targetChances: root.querySelector('#t-target-chances'), outcomes: root.querySelector('#t-outcomes'),
    separateWEnginePriorities: root.querySelector('#t-separate-w-engine-priorities'), selectedTargetCount: root.querySelector('#t-selected-target-count'), targetOrderPanel: root.querySelector('#t-target-order-panel'), targetOrderRows: root.querySelector('#t-target-order-rows'),
    addProvisional: root.querySelector('#t-add-provisional'), provisionalForm: root.querySelector('#t-provisional-form'), provisionalFormTitle: root.querySelector('#t-provisional-form-title'),
    provisionalCount: root.querySelector('#t-provisional-count'), provisionalId: root.querySelector('#t-provisional-id'), provisionalName: root.querySelector('#t-provisional-name'),
    provisionalChannel: root.querySelector('#t-provisional-channel'), provisionalSchedule: root.querySelector('#t-provisional-schedule'), provisionalCustomDates: root.querySelector('#t-provisional-custom-dates'),
    provisionalStart: root.querySelector('#t-provisional-start'), provisionalEnd: root.querySelector('#t-provisional-end'), provisionalNote: root.querySelector('#t-provisional-note'),
    provisionalError: root.querySelector('#t-provisional-error'), cancelProvisional: root.querySelector('#t-cancel-provisional'),
    mindscapeDialog: root.querySelector('#t-mindscape-dialog'), mindscapeForm: root.querySelector('#t-mindscape-form'), mindscapeAgentName: root.querySelector('#t-mindscape-agent-name'),
    currentMindscape: root.querySelector('#t-current-mindscape'), targetMindscape: root.querySelector('#t-target-mindscape'), cancelMindscape: root.querySelector('#t-cancel-mindscape')
  };
  let language = 'en';
  const t = key => translations[language][key];
  const maxAgentsReachedText = () => t('maxAgentsReached').replace('{limit}', PLANNER_CONFIG.maxAgents);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const availabilityBadge = (labelKey, tooltipKey) => `<span class="unconfirmed-badge current-balance-availability" tabindex="0" aria-describedby="t-planner-tooltip" data-tooltip="${escapeHtml(t(tooltipKey))}">${escapeHtml(t(labelKey))}</span>`;
  const renderLanguageOptions = () => {
    els.languageSelect.innerHTML = localeLoader.available().map(locale => `<option value="${escapeHtml(locale.code)}">${escapeHtml(locale.label)}</option>`).join('');
  };
  const tooltip = document.createElement('div');
  tooltip.id = 't-planner-tooltip';
  tooltip.className = 'tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  let tooltipTarget = null;
  const hideTooltip = () => {
    tooltip.hidden = true;
    tooltipTarget = null;
  };
  const showTooltip = target => {
    const message = target.dataset.tooltip;
    if (!message) return;
    tooltipTarget = target;
    tooltip.textContent = message;
    tooltip.style.setProperty('--tooltip-available-width', `${Math.max(0, window.innerWidth - 10)}px`);
    tooltip.style.setProperty('--tooltip-available-height', `${Math.max(0, window.innerHeight - 10)}px`);
    tooltip.style.left = '0px';
    tooltip.style.top = '0px';
    tooltip.hidden = false;
    const margin = 5;
    const gap = 6;
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = Math.min(Math.max(margin, targetRect.left + (targetRect.width - tooltipRect.width) / 2), Math.max(margin, window.innerWidth - tooltipRect.width - margin));
    const above = targetRect.top - tooltipRect.height - gap;
    const below = targetRect.bottom + gap;
    const top = above >= margin ? above : Math.min(below, Math.max(margin, window.innerHeight - tooltipRect.height - margin));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };
  root.addEventListener('pointerover', event => {
    const target = event.target.closest?.('[data-tooltip]');
    if (target && !target.contains(event.relatedTarget)) showTooltip(target);
  });
  root.addEventListener('pointerout', event => {
    const target = event.target.closest?.('[data-tooltip]');
    if (target && target === tooltipTarget && !target.contains(event.relatedTarget)) hideTooltip();
  });
  root.addEventListener('focusin', event => {
    const target = event.target.closest?.('[data-tooltip]');
    if (target) showTooltip(target);
  });
  root.addEventListener('focusout', event => {
    if (event.target === tooltipTarget) hideTooltip();
  });
  window.addEventListener('resize', hideTooltip);
  window.addEventListener('scroll', hideTooltip, true);
  const preferredLanguage = () => localeLoader.preferred();
  const themeStorageKey = 'zzz-universal-pull-planner-theme';
  const languageStorageKey = 'zzz-universal-pull-planner-language';
  const plannerStateStorageKey = 'zzz-universal-pull-planner-state-v10';
  const previousPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v9';
  const olderPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v8';
  const earlierPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v7';
  const oldestPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v6';
  const ancientPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v5';
  const prehistoricPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v4';
  const primitivePlannerStateStorageKey = 'zzz-universal-pull-planner-state-v3';
  const primordialPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v2';
  const legacyPlannerStateStorageKey = 'zzz-universal-pull-planner-state-v1';
  const currencyPerSearch = 160;
  const maximumAvailableSearches = 600;
  const maximumMindscape = 6;
  const resourceKeys = ['monochromes', 'polychromes', 'encryptedMasterTapes'];
  const maximumPullHistoryEntries = 500;

  const agentChannels = PLANNER_CONFIG.channels;
  const wEngineChannels = PLANNER_CONFIG.wEngineChannels;
  const allChannels = [...agentChannels, ...wEngineChannels];
  const channelById = new Map(allChannels.map(channel => [channel.id, channel]));
  const agentChannelById = new Map(agentChannels.map(channel => [channel.id, channel]));
  const builtInCharacters = agentChannels.flatMap(channel => channel.agents.map(character => ({ ...character, channelId: channel.id, provisional: false })));
  let characters = builtInCharacters.slice();
  let characterById = new Map(characters.map(character => [character.id, character]));
  const targetId = (kind, characterId) => `${kind}:${characterId}`;
  const makeTargets = sourceCharacters => sourceCharacters.flatMap(character => {
    const agentChannel = channelById.get(character.channelId);
    const wEngineChannel = channelById.get(agentChannel.wEngineChannelId);
    const shared = { characterId: character.id, characterName: character.name, startDate: character.startDate, endDate: character.endDate };
    return [
      { ...shared, id: targetId('agent', character.id), kind: 'agent', channelId: agentChannel.id, pityGroupId: agentChannel.pity.groupId },
      { ...shared, id: targetId('w-engine', character.id), kind: 'w-engine', channelId: wEngineChannel.id, pityGroupId: wEngineChannel.pity.groupId }
    ];
  });
  let targets = makeTargets(characters);
  let targetById = new Map(targets.map(target => [target.id, target]));
  const chronologyPrecedes = (earlier, later) => earlier.endDate <= later.startDate;
  const runsOverlap = (first, second) => first.startDate < second.endDate && second.startDate < first.endDate;
  const constrainOrder = (preferredOrder, itemById) => {
    const preference = new Map(preferredOrder.map((id, index) => [id, index]));
    const remaining = new Set(preferredOrder);
    const result = [];
    while (remaining.size) {
      const available = [...remaining].filter(id => ![...remaining].some(otherId => otherId !== id && chronologyPrecedes(itemById.get(otherId), itemById.get(id))));
      available.sort((a, b) => preference.get(a) - preference.get(b));
      if (!available.length) return preferredOrder.slice();
      const next = available[0];
      remaining.delete(next);
      result.push(next);
    }
    return result;
  };
  const defaultCharacterOrder = constrainOrder(builtInCharacters.slice().sort((a, b) => a.priority - b.priority).map(character => character.id), characterById);
  const defaultTargetOrder = defaultCharacterOrder.flatMap(characterId => [targetId('agent', characterId), targetId('w-engine', characterId)]);
  const periodDefaults = new Map();
  const pityDefaults = new Map();
  allChannels.forEach(channel => {
    if (!pityDefaults.has(channel.pity.groupId)) pityDefaults.set(channel.pity.groupId, {
      mode: channel.pity.mode, count: channel.pity.count, guaranteed: channel.pity.guaranteed,
      specialGuaranteed: channel.pity.specialGuaranteed
    });
  });
  agentChannels.forEach(channel => {
    channel.agents.forEach(character => {
      if (!periodDefaults.has(character.budget.periodId)) periodDefaults.set(character.budget.periodId, { phase: character.budget.phase, endDate: character.endDate });
    });
  });
  const runtime = {
    availableNow: PLANNER_CONFIG.availableNow,
    resourceBalances: { monochromes: 0, polychromes: 0, encryptedMasterTapes: PLANNER_CONFIG.availableNow },
    resourceEnabled: { monochromes: false, polychromes: true, encryptedMasterTapes: true },
    pullHistory: [], pullTrackerOpen: false, useTrackedIncome: false,
    pityGroups: Object.fromEntries([...pityDefaults].map(([id, value]) => [id, { count: value.count, guaranteed: value.guaranteed, specialGuaranteed: value.specialGuaranteed }])),
    customPeriods: [], customCharacters: [],
    enabled: Object.fromEntries(builtInCharacters.map(character => [character.id, character.enabled])),
    agentCurrentMindscapes: Object.fromEntries(builtInCharacters.map(character => [character.id, -1])),
    agentMindscapes: Object.fromEntries(builtInCharacters.map(character => [character.id, 0])),
    wEngineEnabled: Object.fromEntries(builtInCharacters.map(character => [character.id, false])),
    characterOrder: defaultCharacterOrder.slice(), targetOrder: defaultTargetOrder.slice(),
    separateWEnginePriorities: false, separateOrderInitialized: false
  };

  const rebuildCharacterRegistry = (preferredCharacterOrder = runtime.characterOrder, preferredTargetOrder = runtime.targetOrder) => {
    const customPeriodById = new Map(runtime.customPeriods.map(period => [period.id, period]));
    const resolvedCustomCharacters = runtime.customCharacters.map(character => {
      const period = customPeriodById.get(character.scheduleId);
      return { ...character, confirmed: false, provisional: true, enabled: false, startDate: period.startDate, endDate: period.endDate };
    });
    characters = [...builtInCharacters, ...resolvedCustomCharacters];
    characterById = new Map(characters.map(character => [character.id, character]));
    const knownIds = new Set(characters.map(character => character.id));
    const completeOrder = [...preferredCharacterOrder.filter(id => knownIds.has(id)), ...characters.map(character => character.id).filter(id => !preferredCharacterOrder.includes(id))];
    runtime.characterOrder = constrainOrder(completeOrder, characterById);
    runtime.enabled = Object.fromEntries(characters.map(character => [character.id,
      typeof runtime.enabled[character.id] === 'boolean' ? runtime.enabled[character.id] : Boolean(character.enabled)]));
    runtime.agentCurrentMindscapes = Object.fromEntries(characters.map(character => [character.id,
      Number.isInteger(runtime.agentCurrentMindscapes[character.id]) && runtime.agentCurrentMindscapes[character.id] >= -1 && runtime.agentCurrentMindscapes[character.id] < maximumMindscape ? runtime.agentCurrentMindscapes[character.id] : -1]));
    runtime.agentMindscapes = Object.fromEntries(characters.map(character => [character.id,
      Number.isInteger(runtime.agentMindscapes[character.id]) && runtime.agentMindscapes[character.id] > runtime.agentCurrentMindscapes[character.id] && runtime.agentMindscapes[character.id] <= maximumMindscape
        ? runtime.agentMindscapes[character.id]
        : runtime.agentCurrentMindscapes[character.id] + 1]));
    runtime.wEngineEnabled = Object.fromEntries(characters.map(character => [character.id,
      typeof runtime.wEngineEnabled[character.id] === 'boolean' ? runtime.wEngineEnabled[character.id] : false]));
    targets = makeTargets(characters);
    targetById = new Map(targets.map(target => [target.id, target]));
    const knownTargetIds = new Set(targets.map(target => target.id));
    const completeTargetOrder = [...preferredTargetOrder.filter(id => knownTargetIds.has(id)), ...runtime.characterOrder.flatMap(characterId => [targetId('agent', characterId), targetId('w-engine', characterId)]).filter(id => !preferredTargetOrder.includes(id))];
    runtime.targetOrder = constrainOrder(completeTargetOrder, targetById);
  };

  const configIsValid = () => {
    if (!builtInCharacters.length || builtInCharacters.length > PLANNER_CONFIG.maxAgents || !Number.isInteger(PLANNER_CONFIG.maxSelectedTargets) || PLANNER_CONFIG.maxSelectedTargets < 1 || PLANNER_CONFIG.maxSelectedTargets > 15) return false;
    if (!Number.isInteger(PLANNER_CONFIG.availableNow) || PLANNER_CONFIG.availableNow < 0 || PLANNER_CONFIG.availableNow > maximumAvailableSearches) return false;
    if (channelById.size !== allChannels.length || new Set(builtInCharacters.map(character => character.id)).size !== builtInCharacters.length || new Set(defaultCharacterOrder).size !== builtInCharacters.length) return false;
    if (!agentChannels.every(channel => channelById.get(channel.wEngineChannelId)?.pity.targetType === 'w-engine')) return false;
    const income = PLANNER_CONFIG.incomeEstimate;
    if (!income || !Number.isFinite(income.limitedSearchesPerDay) || income.limitedSearchesPerDay <= 0 || income.roundDown !== true || !Number.isFinite(income.refreshMinutes) || income.refreshMinutes <= 0) return false;
    const validModes = new Set(['exclusive', 'rescreening', 'w-engine', 'w-engine-reverberation']);
    const channelsValid = allChannels.every(channel => {
      const pity = channel.pity;
      const group = pityDefaults.get(pity.groupId);
      const agentsValid = (channel.agents || []).every(character => {
        const period = periodDefaults.get(character.budget.periodId);
        const characterDatesValid = /^\d{4}-\d{2}-\d{2}$/.test(character.startDate) && /^\d{4}-\d{2}-\d{2}$/.test(character.endDate);
        return characterDatesValid && character.startDate < character.endDate && typeof character.confirmed === 'boolean' && period && period.phase === character.budget.phase &&
          period.endDate === character.endDate && Number.isInteger(character.budget.phase) && character.budget.phase >= 0;
      });
      return agentsValid && group && group.mode === pity.mode && validModes.has(pity.mode) && typeof pity.targetType === 'string' &&
        Number.isFinite(pity.hardPity) && pity.hardPity > 1 && pity.hardPity <= 127 && Number.isFinite(pity.baseRate) && Number.isFinite(pity.softPityStartsAt) && Number.isFinite(pity.softPityStep) && Number.isFinite(pity.featuredRate);
    });
    if (!channelsValid) return false;
    const periods = [...periodDefaults.values()].sort((a, b) => a.phase - b.phase);
    if (new Set(periods.map(period => period.phase)).size !== periods.length) return false;
    return periods.every((period, index) => index === 0 || period.endDate > periods[index - 1].endDate);
  };
  const validAppConfig = configIsValid();
  const runtimeCharactersValid = () => characters.length > 0 && characters.length <= PLANNER_CONFIG.maxAgents && characterById.size === characters.length && targetById.size === characters.length * 2 && characters.every(character => {
    const current = runtime.agentCurrentMindscapes[character.id];
    const target = runtime.agentMindscapes[character.id];
    return Number.isInteger(current) && current >= -1 && current < maximumMindscape && Number.isInteger(target) && target > current && target <= maximumMindscape;
  });

  const storedLanguage = () => { try { const stored = localStorage.getItem(languageStorageKey); return localeLoader.isSupported(stored) ? localeLoader.normalize(stored) : null; } catch { return null; } };
  const storedTheme = () => { try { const stored = localStorage.getItem(themeStorageKey); return stored === 'dark' || stored === 'light' ? stored : null; } catch { return null; } };
  const applyTheme = (theme, persist = false) => {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    els.themeSelect.value = nextTheme;
    els.themeSelect.setAttribute('aria-label', t('themeLabel'));
    if (persist) { try { localStorage.setItem(themeStorageKey, nextTheme); } catch {} }
  };
  const formatDate = value => {
    if (!value) return t('dateTbd');
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat(localeLoader.intlLocale(language), { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(Date.UTC(year, month - 1, day)));
  };
  const characterDates = character => `${formatDate(character.startDate)} – ${formatDate(character.endDate)}`;
  const channelLabel = channel => channel.id === 'exclusive'
    ? t('exclusiveChannel')
    : channel.id === 'exclusive-rescreening' ? t('exclusiveRescreening')
      : channel.id === 'w-engine' ? t('wEngineChannel')
        : channel.id === 'w-engine-reverberation' ? t('wEngineReverberation') : channel.name;
  const compactMindscapeRange = characterId => `${runtime.agentCurrentMindscapes[characterId] < 0 ? '—' : `M${runtime.agentCurrentMindscapes[characterId]}`} → M${runtime.agentMindscapes[characterId]}`;
  const targetLabel = target => target.kind === 'w-engine'
    ? `${target.characterName} — ${t('wEngineSuffix')}`
    : runtime.agentMindscapes[target.characterId] > 0 ? `${target.characterName} (M${runtime.agentMindscapes[target.characterId]})` : target.characterName;
  const percentLabel = value => `${new Intl.NumberFormat(localeLoader.intlLocale(language), { maximumFractionDigits: 1 }).format(value * 100)}%`;
  const numberLabel = (value, maximumFractionDigits = 1) => new Intl.NumberFormat(localeLoader.intlLocale(language), { maximumFractionDigits }).format(value);
  const resourceBalancesValid = () => resourceKeys.every(key => !runtime.resourceEnabled[key] ||
    (Number.isInteger(runtime.resourceBalances[key]) && runtime.resourceBalances[key] >= 0));
  const resourceBudget = () => {
    if (!resourceBalancesValid()) return { searches: NaN, tapes: NaN, converted: NaN, remainder: NaN };
    const tapes = runtime.resourceEnabled.encryptedMasterTapes ? runtime.resourceBalances.encryptedMasterTapes : 0;
    const convertible = (runtime.resourceEnabled.monochromes ? runtime.resourceBalances.monochromes : 0) +
      (runtime.resourceEnabled.polychromes ? runtime.resourceBalances.polychromes : 0);
    const converted = Math.floor(convertible / currencyPerSearch);
    return { searches: tapes + converted, tapes, converted, remainder: convertible % currencyPerSearch };
  };
  const renderResourceBalance = () => {
    const budget = resourceBudget();
    runtime.availableNow = budget.searches;
    els.currentSearches.textContent = Number.isFinite(budget.searches) ? numberLabel(budget.searches, 0) : '—';
    els.resourceBreakdown.textContent = Number.isFinite(budget.searches)
      ? t('resourceBreakdown')
        .replace('{tapes}', numberLabel(budget.tapes, 0))
        .replace('{converted}', numberLabel(budget.converted, 0))
        .replace('{remainder}', numberLabel(budget.remainder, 0))
      : t('invalidResourceBalance');
  };
  const syncResourceControls = () => {
    resourceKeys.forEach(key => {
      els.resourceAmounts[key].value = runtime.resourceBalances[key];
      els.resourceEnabled[key].checked = runtime.resourceEnabled[key];
      els.resourceAmounts[key].disabled = !runtime.resourceEnabled[key];
    });
    renderResourceBalance();
  };
  const localDateTimeInputValue = value => {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };
  const pullUnitsFromInput = (value, allowNegative = false) => {
    const numeric = Number(value);
    const units = Math.round(numeric * currencyPerSearch);
    if (!Number.isFinite(numeric) || (!allowNegative && numeric < 0) || Math.abs(numeric * currencyPerSearch - units) > 1e-7 || Math.abs(units) > 10000 * currencyPerSearch) return null;
    return units;
  };
  const pullHistoryEntryIsValid = entry => Number.isInteger(entry.recordedAt) && entry.recordedAt >= 1577836800000 && entry.recordedAt < 4102444800000 &&
    resourceKeys.every(key => Number.isInteger(entry.balances?.[key]) && entry.balances[key] >= 0 && entry.balances[key] <= (key === 'encryptedMasterTapes' ? 600 : 96000)) &&
    Number.isInteger(entry.spent) && entry.spent >= 0 && entry.spent <= 10000 &&
    Number.isInteger(entry.purchasedUnits) && entry.purchasedUnits >= 0 && entry.purchasedUnits <= 10000 * currencyPerSearch &&
    Number.isInteger(entry.adjustmentUnits) && Math.abs(entry.adjustmentUnits) <= 10000 * currencyPerSearch;
  const normalizedPullHistory = (entries, strict = false) => {
    if (!Array.isArray(entries)) return strict ? null : [];
    if (entries.length > maximumPullHistoryEntries && strict) return null;
    const sourceEntries = entries.slice(0, maximumPullHistoryEntries);
    const normalized = [];
    const ids = new Set();
    for (let index = 0; index < sourceEntries.length; index += 1) {
      const source = sourceEntries[index];
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        if (strict) return null;
        continue;
      }
      let id = typeof source.id === 'string' && source.id.length > 0 && source.id.length <= 100 && !ids.has(source.id) ? source.id : `history-${source.recordedAt}-${index}`;
      while (ids.has(id)) id = `${id}-${index}`;
      const numeric = value => typeof value === 'number' ? value : NaN;
      const candidate = {
        id,
        recordedAt: numeric(source.recordedAt),
        balances: Object.fromEntries(resourceKeys.map(key => [key, numeric(source.balances?.[key])])),
        spent: numeric(source.spent), purchasedUnits: numeric(source.purchasedUnits), adjustmentUnits: numeric(source.adjustmentUnits)
      };
      if (!pullHistoryEntryIsValid(candidate)) {
        if (strict) return null;
        continue;
      }
      ids.add(candidate.id);
      normalized.push(candidate);
    }
    normalized.sort((a, b) => a.recordedAt - b.recordedAt || a.id.localeCompare(b.id));
    if (normalized[0]) {
      normalized[0].spent = 0;
      normalized[0].purchasedUnits = 0;
      normalized[0].adjustmentUnits = 0;
    }
    return normalized;
  };
  const snapshotBalanceUnits = entry => entry.balances.monochromes + entry.balances.polychromes + entry.balances.encryptedMasterTapes * currencyPerSearch;
  const pullGainUnits = (entry, previous) => previous
    ? snapshotBalanceUnits(entry) - snapshotBalanceUnits(previous) + entry.spent * currencyPerSearch - entry.purchasedUnits - entry.adjustmentUnits
    : null;
  const trackedIncomeStats = (now = Date.now()) => {
    const history = runtime.pullHistory.filter(entry => entry.recordedAt <= now);
    const first = history[0];
    const latest = history[history.length - 1];
    const totalUnits = history.reduce((sum, entry, index) => sum + (pullGainUnits(entry, history[index - 1]) ?? 0), 0);
    const elapsedDays = history.length > 1 ? (latest.recordedAt - first.recordedAt) / millisecondsPerDay : 0;
    const rate = elapsedDays > 0 ? totalUnits / currencyPerSearch / elapsedDays : null;
    return { count: history.length, first, latest, totalUnits, rate };
  };
  const projectionIncome = () => {
    const tracked = trackedIncomeStats();
    const usable = tracked.rate !== null && Number.isFinite(tracked.rate) && tracked.rate >= 0;
    const usingTracked = runtime.useTrackedIncome && usable;
    return { tracked, usable, usingTracked, rate: usingTracked ? tracked.rate : PLANNER_CONFIG.incomeEstimate.limitedSearchesPerDay };
  };
  const incomeRateLabel = rate => rate > 0 && rate < 0.00001 ? `<${numberLabel(0.00001, 5)}` : numberLabel(rate, 5);
  const trackedIncomeText = (key, tracked) => {
    const formatter = new Intl.DateTimeFormat(localeLoader.intlLocale(language), { dateStyle: 'short', timeStyle: 'short' });
    return t(key).replace('{rate}', incomeRateLabel(tracked.rate))
      .replace('{start}', formatter.format(tracked.first.recordedAt))
      .replace('{end}', formatter.format(tracked.latest.recordedAt));
  };
  const renderProjectionIncome = (income = projectionIncome()) => {
    els.useTrackedIncome.checked = runtime.useTrackedIncome;
    els.trackedIncomeBasis.textContent = income.usable
      ? trackedIncomeText('trackedIncomeBasis', income.tracked)
      : t(income.tracked.rate !== null && income.tracked.rate < 0 ? 'trackedIncomeNegative' : 'trackedIncomeNeedsHistory');
    els.incomeNote.textContent = income.usingTracked
      ? trackedIncomeText('trackedIncomeNote', income.tracked)
      : `${runtime.useTrackedIncome ? `${t('trackedIncomeFallback')} ` : ''}${t('incomeNote').replace('{rate}', incomeRateLabel(income.rate))}`;
  };
  const pullUnitsLabel = units => numberLabel(units / currencyPerSearch, 5);
  const pullUnitsInputValue = units => String(units / currencyPerSearch);
  const signedPullUnitsLabel = units => `${units > 0 ? '+' : ''}${pullUnitsLabel(units)}`;
  const setPullTrackerMessage = (key = '', isError = false) => {
    els.pullTrackerMessage.textContent = key ? t(key) : '';
    els.pullTrackerMessage.classList.toggle('text-destructive', isError);
  };
  const renderPullTracker = () => {
    const history = runtime.pullHistory;
    const gains = history.map((entry, index) => pullGainUnits(entry, history[index - 1]));
    const now = Date.now();
    const tracked = trackedIncomeStats(now);
    const recentTotal = days => {
      const cutoff = now - days * millisecondsPerDay;
      const relevant = gains.filter((value, index) => index > 0 && history[index].recordedAt >= cutoff && history[index].recordedAt <= now);
      return relevant.length ? relevant.reduce((sum, value) => sum + value, 0) : null;
    };
    els.pullGainTotal.textContent = tracked.count > 1 ? signedPullUnitsLabel(tracked.totalUnits) : '—';
    const sevenDayTotal = recentTotal(7);
    const thirtyDayTotal = recentTotal(30);
    els.pullGainSeven.textContent = sevenDayTotal === null ? '—' : signedPullUnitsLabel(sevenDayTotal);
    els.pullGainThirty.textContent = thirtyDayTotal === null ? '—' : signedPullUnitsLabel(thirtyDayTotal);
    els.pullGainAverage.textContent = tracked.rate !== null ? `${tracked.rate > 0 ? '+' : ''}${incomeRateLabel(tracked.rate)}` : '—';
    renderProjectionIncome();
    els.pullHistoryWrap.hidden = !history.length;
    els.pullHistoryEmpty.hidden = Boolean(history.length);
    els.recordPullSnapshot.textContent = t(history.length ? 'recordSnapshot' : 'startTracking');
    [els.pullSnapshotSpent, els.pullSnapshotPurchased, els.pullSnapshotAdjustment].forEach(input => { input.disabled = !history.length; });
    els.pullHistoryRows.innerHTML = history.map((entry, index) => {
      const gain = gains[index];
      return `<tr data-history-id="${escapeHtml(entry.id)}">
        <td><input class="form-control t-pull-history-input t-history-date" data-field="recordedAt" type="datetime-local" value="${localDateTimeInputValue(entry.recordedAt)}"></td>
        ${resourceKeys.map(key => `<td><input class="form-control t-pull-history-input" data-field="${key}" type="number" min="0" max="${key === 'encryptedMasterTapes' ? 600 : 96000}" step="1" value="${entry.balances[key]}"></td>`).join('')}
        <td><input class="form-control t-pull-history-input" data-field="spent" type="number" min="0" max="10000" step="1" value="${entry.spent}" ${index ? '' : 'disabled'}></td>
        <td><input class="form-control t-pull-history-input" data-field="purchasedUnits" type="number" min="0" max="10000" step="0.00625" value="${pullUnitsInputValue(entry.purchasedUnits)}" ${index ? '' : 'disabled'}></td>
        <td><input class="form-control t-pull-history-input" data-field="adjustmentUnits" type="number" min="-10000" max="10000" step="0.00625" value="${pullUnitsInputValue(entry.adjustmentUnits)}" ${index ? '' : 'disabled'}></td>
        <td class="text-end pull-history-earned ${gain === null ? 'pull-history-baseline' : ''}">${gain === null ? escapeHtml(t('pullHistoryBaseline')) : signedPullUnitsLabel(gain)}</td>
        <td><button class="btn btn-sm t-remove-pull-history" type="button" title="${escapeHtml(t('removeSnapshot'))}" aria-label="${escapeHtml(t('removeSnapshot'))}">×</button></td>
      </tr>`;
    }).join('');
    if (!els.pullSnapshotDate.value) els.pullSnapshotDate.value = localDateTimeInputValue(Date.now());
  };
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const localDeadline = value => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
  };
  const daysRemaining = endDate => Math.max(0, (localDeadline(endDate) - Date.now()) / millisecondsPerDay);
  const estimatedSearches = (endDate, rate = projectionIncome().rate) => Math.floor(daysRemaining(endDate) * rate);
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const validIsoDate = value => {
    if (!datePattern.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };
  const validDateRange = (startDate, endDate) => validIsoDate(startDate) && validIsoDate(endDate) && startDate < endDate;
  const addIsoDays = (value, days) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  };
  const windowValue = (startDate, endDate) => `window:${startDate}|${endDate}`;
  const parseWindowValue = value => {
    const match = /^window:(\d{4}-\d{2}-\d{2})\|(\d{4}-\d{2}-\d{2})$/.exec(value);
    return match ? { startDate: match[1], endDate: match[2] } : null;
  };
  const nextScheduleDates = () => {
    const startDate = characters.reduce((latest, character) => character.endDate > latest ? character.endDate : latest, characters[0]?.endDate || new Date().toISOString().slice(0, 10));
    return { startDate, endDate: addIsoDays(startDate, 21) };
  };
  const scheduleWindows = () => {
    const windows = new Map();
    characters.forEach(character => {
      const key = windowValue(character.startDate, character.endDate);
      if (!windows.has(key)) windows.set(key, { startDate: character.startDate, endDate: character.endDate, names: [] });
      windows.get(key).names.push(character.name);
    });
    return [...windows].sort(([, first], [, second]) => first.startDate.localeCompare(second.startDate) || first.endDate.localeCompare(second.endDate));
  };
  const uniqueCustomId = prefix => {
    const suffix = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `${prefix}-${suffix}`;
  };
  const findOrCreateCustomPeriod = (startDate, endDate) => {
    let period = runtime.customPeriods.find(item => item.startDate === startDate && item.endDate === endDate);
    if (!period) {
      period = { id: uniqueCustomId('custom-period'), startDate, endDate };
      runtime.customPeriods.push(period);
    }
    return period;
  };
  const removeUnusedCustomPeriods = () => {
    const used = new Set(runtime.customCharacters.map(character => character.scheduleId));
    runtime.customPeriods = runtime.customPeriods.filter(period => used.has(period.id));
  };
  const targetIsSelected = target => target.kind === 'agent' ? runtime.enabled[target.characterId] : runtime.wEngineEnabled[target.characterId];
  const selectedTargetIds = () => targets.filter(targetIsSelected).map(target => target.id);
  const compactTargetOrder = () => runtime.characterOrder.flatMap(characterId => [targetId('agent', characterId), targetId('w-engine', characterId)]);
  const effectiveSelectedTargetOrder = () => (runtime.separateWEnginePriorities ? runtime.targetOrder : compactTargetOrder()).filter(id => targetIsSelected(targetById.get(id)));

  function renderProvisionalFormOptions(selectedSchedule = els.provisionalSchedule.value) {
    els.provisionalChannel.innerHTML = agentChannels.map(channel => `<option value="${escapeHtml(channel.id)}">${escapeHtml(channelLabel(channel))}</option>`).join('');
    const next = nextScheduleDates();
    const options = [
      `<option value="__next__">${escapeHtml(`${t('nextThreeWeeks')} · ${characterDates(next)}`)}</option>`,
      ...scheduleWindows().map(([value, window]) => {
        const names = window.names.length > 2 ? `${window.names.slice(0, 2).join(', ')} +${window.names.length - 2}` : window.names.join(', ');
        return `<option value="${escapeHtml(value)}">${escapeHtml(`${characterDates(window)} · ${names}`)}</option>`;
      }),
      `<option value="__custom__">${escapeHtml(t('customDates'))}</option>`
    ];
    els.provisionalSchedule.innerHTML = options.join('');
    els.provisionalSchedule.value = [...els.provisionalSchedule.options].some(option => option.value === selectedSchedule) ? selectedSchedule : '__next__';
    els.provisionalCount.textContent = t('targetLimit').replace('{used}', characters.length).replace('{limit}', PLANNER_CONFIG.maxAgents);
    updateProvisionalDateFields();
  }

  function updateProvisionalDateFields() {
    const custom = els.provisionalSchedule.value === '__custom__';
    els.provisionalCustomDates.hidden = !custom;
    els.provisionalStart.required = custom;
    els.provisionalEnd.required = custom;
    els.provisionalNote.textContent = '';
    if (!custom) return;
    const editing = runtime.customCharacters.find(character => character.id === els.provisionalId.value);
    if (!editing) return;
    const sharedCount = runtime.customCharacters.filter(character => character.scheduleId === editing.scheduleId).length;
    if (sharedCount > 1) els.provisionalNote.textContent = t('sharedSchedule').replace('{count}', sharedCount);
  }

  function closeProvisionalForm() {
    els.provisionalForm.hidden = true;
    els.provisionalError.textContent = '';
    els.provisionalId.value = '';
  }

  function openProvisionalForm(characterId = '') {
    const editing = characterId ? runtime.customCharacters.find(character => character.id === characterId) : null;
    if (!editing && characters.length >= PLANNER_CONFIG.maxAgents) {
      els.error.textContent = maxAgentsReachedText();
      return;
    }
    els.provisionalId.value = editing?.id || '';
    els.provisionalFormTitle.textContent = t(editing ? 'editProvisional' : 'addProvisional').replace(/^\+\s*/, '');
    els.provisionalName.value = editing?.name || `${t('futureTarget')} ${runtime.customCharacters.length + 1}`;
    const period = editing ? runtime.customPeriods.find(item => item.id === editing.scheduleId) : null;
    const selectedSchedule = period ? windowValue(period.startDate, period.endDate) : '__next__';
    renderProvisionalFormOptions(selectedSchedule);
    els.provisionalChannel.value = editing?.channelId || agentChannels[0].id;
    const suggested = period || nextScheduleDates();
    els.provisionalStart.value = suggested.startDate;
    els.provisionalEnd.value = suggested.endDate;
    els.provisionalForm.hidden = false;
    els.provisionalError.textContent = '';
    updateProvisionalDateFields();
    els.provisionalName.focus();
  }

  let mindscapeDialogCharacterId = '';
  const closeMindscapeDialog = () => {
    if (typeof els.mindscapeDialog.close === 'function') els.mindscapeDialog.close();
    else els.mindscapeDialog.removeAttribute('open');
    mindscapeDialogCharacterId = '';
  };
  const renderMindscapeTargetOptions = preferredTarget => {
    const current = +els.currentMindscape.value;
    const targets = Array.from({ length: maximumMindscape - current }, (_, index) => current + index + 1);
    els.targetMindscape.innerHTML = targets.map(level => `<option value="${level}">M${level}</option>`).join('');
    els.targetMindscape.value = targets.includes(+preferredTarget) ? String(preferredTarget) : String(targets[0]);
  };
  const renderMindscapeDialog = () => {
    const character = characterById.get(mindscapeDialogCharacterId);
    if (!character) return;
    els.mindscapeAgentName.textContent = character.name;
    els.currentMindscape.innerHTML = [
      `<option value="-1">${escapeHtml(t('notOwned'))}</option>`,
      ...Array.from({ length: maximumMindscape }, (_, level) => `<option value="${level}">M${level}</option>`)
    ].join('');
    els.currentMindscape.value = String(runtime.agentCurrentMindscapes[character.id]);
    renderMindscapeTargetOptions(runtime.agentMindscapes[character.id]);
  };
  const openMindscapeDialog = characterId => {
    if (!characterById.has(characterId)) return;
    mindscapeDialogCharacterId = characterId;
    renderMindscapeDialog();
    if (typeof els.mindscapeDialog.showModal === 'function') els.mindscapeDialog.showModal();
    else els.mindscapeDialog.setAttribute('open', '');
    els.currentMindscape.focus();
  };

  function renderChannelTable() {
    const renderRows = sourceChannels => sourceChannels.map(channel => {
      const pity = channel.pity;
      const group = runtime.pityGroups[pity.groupId];
      const specialChannel = pity.mode === 'rescreening' || pity.mode === 'w-engine-reverberation';
      const targetType = pity.targetType === 'w-engine' ? 'w-engine' : 'agent';
      return `<tr>
        <td>${escapeHtml(channelLabel(channel))}</td>
        <td><input class="form-control config-number t-pity" data-pity-group="${escapeHtml(pity.groupId)}" type="number" min="0" max="${escapeHtml(pity.hardPity - 1)}" value="${escapeHtml(group.count)}"><span class="text-small text-muted config-subtext">${t('independentPity')}</span></td>
        <td><div class="config-checks">
          <label class="form-check"><input class="form-check-input t-guaranteed" data-pity-group="${escapeHtml(pity.groupId)}" type="checkbox"${group.guaranteed ? ' checked' : ''}><span class="form-check-label">${t(targetType === 'w-engine' ? 'normalWEngineGuarantee' : 'normalAgentGuarantee')}</span></label>
          ${specialChannel ? `<label class="form-check"><input class="form-check-input t-special-guaranteed" data-pity-group="${escapeHtml(pity.groupId)}" type="checkbox"${group.specialGuaranteed ? ' checked' : ''}><span class="form-check-label">${t('specialGuarantee')}</span></label>` : ''}
        </div></td>
        <td class="config-rules">${t('ruleSummary').replace('{baseRate}', percentLabel(pity.baseRate)).replace('{softPityStart}', pity.softPityStartsAt).replace('{hardPity}', pity.hardPity)}<span class="text-small text-muted config-subtext">${t(targetType === 'w-engine' ? 'featuredWEngineRate' : 'featuredAgentRate')} ${percentLabel(pity.featuredRate)}</span></td>
      </tr>`;
    }).join('');
    els.agentChannelRows.innerHTML = renderRows(agentChannels);
    els.wEngineChannelRows.innerHTML = renderRows(wEngineChannels);
  }

  function renderCharacterTable() {
    const income = projectionIncome();
    renderProjectionIncome(income);
    const selectedCount = selectedTargetIds().length;
    const limitReached = selectedCount >= PLANNER_CONFIG.maxSelectedTargets;
    els.agentRows.innerHTML = runtime.characterOrder.map((characterId, index) => {
      const character = characterById.get(characterId);
      const channel = channelById.get(character.channelId);
      const remaining = daysRemaining(character.endDate);
      const estimate = estimatedSearches(character.endDate, income.rate);
      const canMoveUp = index > 0 && runsOverlap(character, characterById.get(runtime.characterOrder[index - 1]));
      const canMoveDown = index < runtime.characterOrder.length - 1 && runsOverlap(character, characterById.get(runtime.characterOrder[index + 1]));
      const provisionalBadge = character.provisional
        ? `<span class="unconfirmed-badge provisional-badge">${t('provisional')}</span>`
        : '';
      const unconfirmedBadge = !character.provisional && !character.confirmed
        ? `<br><span class="unconfirmed-badge availability-unconfirmed-badge">${t('unconfirmed')}</span>`
        : '';
      const provisionalActions = character.provisional ? `
          <button class="btn provisional-row-action t-edit-provisional" data-character-id="${escapeHtml(character.id)}" type="button" aria-label="${escapeHtml(`${t('editTarget')}: ${character.name}`)}" title="${escapeHtml(t('editTarget'))}">✎</button>
          <button class="btn provisional-row-action t-delete-provisional" data-character-id="${escapeHtml(character.id)}" type="button" aria-label="${escapeHtml(`${t('removeTarget')}: ${character.name}`)}" title="${escapeHtml(t('removeTarget'))}">×</button>` : '';
      return `<tr>
        <td class="priority-column">${runtime.separateWEnginePriorities ? '—' : index + 1}</td>
        <td><div class="agent-target-control"><input class="form-check-input t-character-enabled" data-character-id="${escapeHtml(character.id)}" type="checkbox"${runtime.enabled[character.id] ? ' checked' : ''}${limitReached && !runtime.enabled[character.id] ? ' disabled' : ''} aria-label="${escapeHtml(`${character.name} — ${t('agentTarget')}`)}"><button class="btn btn-secondary mindscape-range-button t-edit-mindscape" data-character-id="${escapeHtml(character.id)}" type="button" title="${escapeHtml(t('editMindscapeRange'))}" aria-label="${escapeHtml(`${t('editMindscapeRange')}: ${character.name}`)}">${escapeHtml(compactMindscapeRange(character.id))}</button></div></td>
        <td><input class="form-check-input t-w-engine-enabled" data-character-id="${escapeHtml(character.id)}" type="checkbox"${runtime.wEngineEnabled[character.id] ? ' checked' : ''}${limitReached && !runtime.wEngineEnabled[character.id] ? ' disabled' : ''} aria-label="${escapeHtml(`${character.name} — ${t('wEngineTarget')}`)}"></td>
        <td>${escapeHtml(character.name)}${provisionalBadge}</td>
        <td>${escapeHtml(channelLabel(channel))}</td><td>${escapeHtml(characterDates(character))}${unconfirmedBadge}</td>
        <td class="t-agent-estimate t-deadline-estimate" data-end-date="${escapeHtml(character.endDate)}"><strong>${numberLabel(runtime.availableNow + estimate, 0)} <span class="text-muted">(+${numberLabel(estimate, 0)})</span></strong><span class="text-small text-muted config-subtext">${numberLabel(remaining)} ${t('daysLeft')} × ${escapeHtml(incomeRateLabel(income.rate))} ${t('searchesPerDay')}</span></td>
        <td><div class="move-buttons">
          <span class="compact-order-actions"${runtime.separateWEnginePriorities ? ' hidden' : ''}><button class="btn btn-secondary t-move-character" data-character-id="${escapeHtml(character.id)}" data-direction="-1" type="button"${canMoveUp ? '' : ' disabled'} aria-label="${escapeHtml(`${t('moveUp')}: ${character.name}`)}">↑</button>
          <button class="btn btn-secondary t-move-character" data-character-id="${escapeHtml(character.id)}" data-direction="1" type="button"${canMoveDown ? '' : ' disabled'} aria-label="${escapeHtml(`${t('moveDown')}: ${character.name}`)}">↓</button></span>
          ${provisionalActions}
        </div></td>
      </tr>`;
    }).join('');
    els.addProvisional.disabled = characters.length >= PLANNER_CONFIG.maxAgents;
    els.addProvisional.title = els.addProvisional.disabled ? maxAgentsReachedText() : '';
    els.separateWEnginePriorities.checked = runtime.separateWEnginePriorities;
    els.selectedTargetCount.textContent = t('selectedTargetCount').replace('{used}', selectedCount).replace('{limit}', PLANNER_CONFIG.maxSelectedTargets);
    renderTargetOrderTable();
  }

  function renderTargetOrderTable() {
    els.targetOrderPanel.hidden = !runtime.separateWEnginePriorities;
    if (!runtime.separateWEnginePriorities) { els.targetOrderRows.innerHTML = ''; return; }
    const ordered = runtime.targetOrder.filter(id => targetIsSelected(targetById.get(id)));
    els.targetOrderRows.innerHTML = ordered.map((id, index) => {
      const target = targetById.get(id);
      const channel = channelById.get(target.channelId);
      const previous = ordered[index - 1] ? targetById.get(ordered[index - 1]) : null;
      const next = ordered[index + 1] ? targetById.get(ordered[index + 1]) : null;
      const canMoveUp = previous && runsOverlap(target, previous);
      const canMoveDown = next && runsOverlap(target, next);
      return `<tr>
        <td class="priority-column">${index + 1}</td><td>${escapeHtml(targetLabel(target))}<span class="target-kind-badge">${t(target.kind === 'w-engine' ? 'wEngineTarget' : 'agentTarget')}</span></td>
        <td>${escapeHtml(channelLabel(channel))}</td><td>${escapeHtml(characterDates(target))}</td>
        <td class="t-deadline-estimate" data-end-date="${escapeHtml(target.endDate)}">—</td>
        <td><div class="move-buttons"><button class="btn btn-secondary t-move-target" data-target-id="${escapeHtml(id)}" data-direction="-1" type="button"${canMoveUp ? '' : ' disabled'} aria-label="${escapeHtml(`${t('moveUp')}: ${targetLabel(target)}`)}">↑</button><button class="btn btn-secondary t-move-target" data-target-id="${escapeHtml(id)}" data-direction="1" type="button"${canMoveDown ? '' : ' disabled'} aria-label="${escapeHtml(`${t('moveDown')}: ${targetLabel(target)}`)}">↓</button></div></td>
      </tr>`;
    }).join('');
  }

  function renderCharacterProjections(phaseBalances) {
    const balancesByDeadline = new Map(phaseBalances.map(phase => [phase.endDate, phase]));
    root.querySelectorAll('.t-deadline-estimate').forEach(cell => {
      const phase = balancesByDeadline.get(cell.dataset.endDate);
      if (!phase?.stats) {
        cell.innerHTML = `<strong>${t('expired')}</strong>`;
        return;
      }
      const stats = phase.stats;
      cell.innerHTML = `<strong>≈${numberLabel(stats.expected)} ${t('expectedLeft')}</strong><span class="text-small text-muted config-subtext">${numberLabel(phase.cap, 0)} (+${numberLabel(phase.estimatedGain, 0)} ${t('futureSuffix')}) ${t('beforeSearches')} · ${t('likely')} ${numberLabel(stats.low, 0)}–${numberLabel(stats.high, 0)}</span>`;
    });
  }

  const applyLanguage = (nextLanguage, persist = false, rerender = true) => {
    const openSchedule = els.provisionalSchedule.value;
    const openChannel = els.provisionalChannel.value;
    language = localeLoader.normalize(nextLanguage);
    document.documentElement.lang = language;
    document.title = t('pageTitle');
    root.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    els.languageSelect.value = language;
    applyTheme(document.documentElement.dataset.theme);
    renderResourceBalance();
    renderPullTracker();
    renderChannelTable(); renderCharacterTable();
    if (!els.provisionalForm.hidden) {
      els.provisionalFormTitle.textContent = t(els.provisionalId.value ? 'editProvisional' : 'addProvisional').replace(/^\+\s*/, '');
      renderProvisionalFormOptions(openSchedule);
      if ([...els.provisionalChannel.options].some(option => option.value === openChannel)) els.provisionalChannel.value = openChannel;
    }
    if (mindscapeDialogCharacterId && els.mindscapeDialog.open) renderMindscapeDialog();
    if (persist) { try { localStorage.setItem(languageStorageKey, language); } catch {} }
    if (rerender) render();
  };

  const plannerState = () => ({
    availableNow: runtime.availableNow,
    resourceBalances: { ...runtime.resourceBalances },
    resourceEnabled: { ...runtime.resourceEnabled },
    pullHistory: runtime.pullHistory.map(entry => ({ ...entry, balances: { ...entry.balances } })),
    pullTrackerOpen: runtime.pullTrackerOpen, useTrackedIncome: runtime.useTrackedIncome,
    pityGroups: Object.fromEntries(Object.entries(runtime.pityGroups).map(([id, value]) => [id, { ...value }])),
    customPeriods: runtime.customPeriods.map(period => ({ ...period })),
    customCharacters: runtime.customCharacters.map(character => ({ ...character })),
    enabled: { ...runtime.enabled }, agentCurrentMindscapes: { ...runtime.agentCurrentMindscapes }, agentMindscapes: { ...runtime.agentMindscapes }, wEngineEnabled: { ...runtime.wEngineEnabled },
    order: runtime.characterOrder.slice(), characterOrder: runtime.characterOrder.slice(), targetOrder: runtime.targetOrder.slice(),
    separateWEnginePriorities: runtime.separateWEnginePriorities, separateOrderInitialized: runtime.separateOrderInitialized
  });
  const persistPlannerState = () => { try { localStorage.setItem(plannerStateStorageKey, JSON.stringify(plannerState())); } catch {} };
  const sanitizedCustomState = state => {
    const periods = [];
    const periodIds = new Set();
    (Array.isArray(state.customPeriods) ? state.customPeriods : []).forEach(period => {
      if (!period || typeof period !== 'object' || typeof period.id !== 'string' || period.id.length > 100 || periodIds.has(period.id) || !validDateRange(period.startDate, period.endDate)) return;
      periodIds.add(period.id);
      periods.push({ id: period.id, startDate: period.startDate, endDate: period.endDate });
    });
    const customCharacters = [];
    const characterIds = new Set(builtInCharacters.map(character => character.id));
    (Array.isArray(state.customCharacters) ? state.customCharacters : []).forEach(character => {
      const name = typeof character?.name === 'string' ? character.name.trim() : '';
      const channelId = character?.channelId || character?.bannerId;
      if (!character || typeof character.id !== 'string' || character.id.length > 100 || characterIds.has(character.id) || !name || name.length > 60 || !agentChannelById.has(channelId) || !periodIds.has(character.scheduleId)) return;
      if (builtInCharacters.length + customCharacters.length >= PLANNER_CONFIG.maxAgents) return;
      characterIds.add(character.id);
      customCharacters.push({ id: character.id, name, channelId, scheduleId: character.scheduleId });
    });
    const usedPeriodIds = new Set(customCharacters.map(character => character.scheduleId));
    return { periods: periods.filter(period => usedPeriodIds.has(period.id)), customCharacters };
  };
  const applyPlannerState = state => {
    if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
    const hasItemizedBalance = state.resourceBalances && typeof state.resourceBalances === 'object' && !Array.isArray(state.resourceBalances);
    if (hasItemizedBalance) {
      resourceKeys.forEach(key => {
        if (Number.isFinite(+state.resourceBalances[key])) runtime.resourceBalances[key] = +state.resourceBalances[key];
        if (typeof state.resourceEnabled?.[key] === 'boolean') runtime.resourceEnabled[key] = state.resourceEnabled[key];
      });
    } else if (Number.isFinite(+state.availableNow)) {
      runtime.resourceBalances.monochromes = 0;
      runtime.resourceBalances.polychromes = 0;
      runtime.resourceBalances.encryptedMasterTapes = +state.availableNow;
      runtime.resourceEnabled.monochromes = false;
      runtime.resourceEnabled.polychromes = true;
      runtime.resourceEnabled.encryptedMasterTapes = true;
    }
    runtime.pullHistory = normalizedPullHistory(state.pullHistory);
    runtime.pullTrackerOpen = state.pullTrackerOpen === true;
    runtime.useTrackedIncome = state.useTrackedIncome === true;
    runtime.availableNow = resourceBudget().searches;
    Object.keys(runtime.pityGroups).forEach(id => {
      const stored = state.pityGroups?.[id] || (id === 'exclusive' ? state.pityGroups?.['normal-exclusive'] : null);
      if (!stored || typeof stored !== 'object') return;
      if (Number.isFinite(+stored.count)) runtime.pityGroups[id].count = +stored.count;
      if (typeof stored.guaranteed === 'boolean') runtime.pityGroups[id].guaranteed = stored.guaranteed;
      if (typeof stored.specialGuaranteed === 'boolean') runtime.pityGroups[id].specialGuaranteed = stored.specialGuaranteed;
    });
    const restoredCustom = sanitizedCustomState(state);
    runtime.customPeriods = restoredCustom.periods;
    runtime.customCharacters = restoredCustom.customCharacters;
    const storedCharacterOrder = Array.isArray(state.characterOrder) ? state.characterOrder : Array.isArray(state.order) ? state.order : runtime.characterOrder;
    rebuildCharacterRegistry(storedCharacterOrder, Array.isArray(state.targetOrder) ? state.targetOrder : runtime.targetOrder);
    characters.forEach(character => { if (typeof state.enabled?.[character.id] === 'boolean') runtime.enabled[character.id] = state.enabled[character.id]; });
    characters.forEach(character => {
      const currentMindscape = +state.agentCurrentMindscapes?.[character.id];
      if (Number.isInteger(currentMindscape) && currentMindscape >= -1 && currentMindscape < maximumMindscape) runtime.agentCurrentMindscapes[character.id] = currentMindscape;
    });
    characters.forEach(character => {
      const mindscape = +state.agentMindscapes?.[character.id];
      if (Number.isInteger(mindscape) && mindscape > runtime.agentCurrentMindscapes[character.id] && mindscape <= maximumMindscape) runtime.agentMindscapes[character.id] = mindscape;
      else runtime.agentMindscapes[character.id] = runtime.agentCurrentMindscapes[character.id] + 1;
    });
    characters.forEach(character => { if (typeof state.wEngineEnabled?.[character.id] === 'boolean') runtime.wEngineEnabled[character.id] = state.wEngineEnabled[character.id]; });
    if (storedCharacterOrder.length === characters.length && new Set(storedCharacterOrder).size === characters.length && storedCharacterOrder.every(id => characterById.has(id))) runtime.characterOrder = constrainOrder(storedCharacterOrder, characterById);
    if (Array.isArray(state.targetOrder) && state.targetOrder.length === targets.length && new Set(state.targetOrder).size === targets.length && state.targetOrder.every(id => targetById.has(id))) runtime.targetOrder = constrainOrder(state.targetOrder, targetById);
    runtime.separateWEnginePriorities = state.separateWEnginePriorities === true;
    runtime.separateOrderInitialized = state.separateOrderInitialized === true || (state.separateWEnginePriorities === true && Array.isArray(state.targetOrder));
    if (selectedTargetIds().length > PLANNER_CONFIG.maxSelectedTargets) {
      const allowed = new Set(effectiveSelectedTargetOrder().slice(0, PLANNER_CONFIG.maxSelectedTargets));
      characters.forEach(character => {
        runtime.enabled[character.id] = runtime.enabled[character.id] && allowed.has(targetId('agent', character.id));
        runtime.wEngineEnabled[character.id] = runtime.wEngineEnabled[character.id] && allowed.has(targetId('w-engine', character.id));
      });
    }
    return true;
  };
  const legacyState = () => {
    try {
      const old = JSON.parse(localStorage.getItem(legacyPlannerStateStorageKey) || 'null');
      if (!old || typeof old !== 'object' || Array.isArray(old)) return null;
      const rescreenOrder = [...String(old['t-rescreen-order'] || 'DYH')].map(code => ({ D: 'dialyn', Y: 'yuzuha', H: 'harumasa' })[code]).filter(Boolean);
      const normalOrder = [...String(old['t-normal-order'] || 'MS')].map(code => ({ M: 'remielle', S: 'sigrid' })[code]).filter(Boolean);
      const currentOrder = old['t-current-priority'] === 'normal' ? [...normalOrder, ...rescreenOrder] : [...rescreenOrder, ...normalOrder];
      return {
        availableNow: old['t-now'],
        pityGroups: {
          exclusive: { count: old['t-normal-pity'], guaranteed: old['t-normal-guarantee'], specialGuaranteed: false },
          'exclusive-rescreening': { count: old['t-rescreen-pity'], guaranteed: old['t-rescreen-guarantee'], specialGuaranteed: old['t-special-guarantee'] }
        },
        enabled: { dialyn: old['t-dialyn'], yuzuha: old['t-yuzuha'], harumasa: old['t-harumasa'], remielle: old['t-remielle'], sigrid: old['t-sigrid'], claret: old['t-claret-target'], roxy: old['t-roxy-target'] },
        order: [...currentOrder, 'claret', 'roxy']
      };
    } catch { return null; }
  };
  const storedPlannerState = () => {
    try { const state = JSON.parse(localStorage.getItem(plannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(previousPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(olderPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(earlierPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(oldestPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(ancientPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(prehistoricPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(primitivePlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    try { const state = JSON.parse(localStorage.getItem(primordialPlannerStateStorageKey) || 'null'); if (state && typeof state === 'object' && !Array.isArray(state)) return state; } catch {}
    return legacyState();
  };

  const pct = probability => {
    const format = (value, digits) => new Intl.NumberFormat(localeLoader.intlLocale(language), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    if (probability === 0) return `${format(0, 1)}%`;
    const percent = 100 * probability;
    if (percent < 0.001) return `&lt;${format(0.001, 3)}%`;
    const decimals = percent < 0.1 ? 3 : 1;
    return `${format(percent, decimals)}%`;
  };
  const probabilityComplement = probability => 1 - probability < 1e-12 ? 0 : Math.max(0, 1 - probability);
  const decimal = value => new Intl.NumberFormat(localeLoader.intlLocale(language), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const add = (map, state, probability) => { if (probability > 0) map.set(state, (map.get(state) || 0) + probability); };
  const addBucket = (buckets, index, state, probability) => { if (probability > 0) { if (!buckets[index]) buckets[index] = new Map(); add(buckets[index], state, probability); } };
  const hazard = (pity, rules) => {
    const pull = pity + 1;
    if (pull >= rules.hardPity) return 1;
    if (pull < rules.softPityStartsAt) return rules.baseRate;
    return Math.min(1, rules.baseRate + rules.softPityStep * (pull - rules.softPityStartsAt + 1));
  };
  const pityPacking = allChannels.map(channel => ({ id: channel.pity.groupId, special: channel.pity.mode === 'rescreening' || channel.pity.mode === 'w-engine-reverberation' }));
  let packingUnit = 1;
  const groupPacking = {};
  [...pityPacking].reverse().forEach(field => {
    const specialFactor = field.special ? 2 : 1;
    groupPacking[field.id] = {
      countUnit: packingUnit * 2 * specialFactor,
      guaranteedUnit: packingUnit * specialFactor,
      specialGuaranteedUnit: field.special ? packingUnit : 0,
      special: field.special
    };
    packingUnit *= 256 * specialFactor;
  });
  const maskUnit = packingUnit;
  const packCore = (groups, mask) => {
    let packed = mask * maskUnit;
    pityPacking.forEach(field => {
      const group = groups[field.id];
      const layout = groupPacking[field.id];
      packed += group.count * layout.countUnit;
      if (group.guaranteed) packed += layout.guaranteedUnit;
      if (field.special && group.specialGuaranteed) packed += layout.specialGuaranteedUnit;
    });
    return packed;
  };
  const maskFromCore = core => Math.floor(core / maskUnit);
  const clearGroupState = (core, groupId) => {
    const layout = groupPacking[groupId];
    let cleared = core;
    cleared -= (Math.floor(core / layout.countUnit) % 128) * layout.countUnit;
    if (Math.floor(core / layout.guaranteedUnit) % 2) cleared -= layout.guaranteedUnit;
    if (layout.special && Math.floor(core / layout.specialGuaranteedUnit) % 2) cleared -= layout.specialGuaranteedUnit;
    return cleared;
  };
  const compactArrivals = (arrivals, retainedGroupIds) => {
    const discardedGroupIds = pityPacking.map(field => field.id).filter(id => !retainedGroupIds.has(id));
    if (!discardedGroupIds.length) return arrivals;
    return arrivals.map(bucket => {
      if (!bucket) return bucket;
      const compacted = new Map();
      bucket.forEach((probability, core) => {
        let compactedCore = core;
        discardedGroupIds.forEach(id => { compactedCore = clearGroupState(compactedCore, id); });
        add(compacted, compactedCore, probability);
      });
      return compacted;
    });
  };

  const pullTarget = (core, simulationTarget) => {
    const { bit, layout, rules } = simulationTarget;
    const count = Math.floor(core / layout.countUnit) % 128;
    const guaranteed = Boolean(Math.floor(core / layout.guaranteedUnit) % 2);
    const specialGuaranteed = layout.special && Boolean(Math.floor(core / layout.specialGuaranteedUnit) % 2);
    const hitRate = hazard(count, rules);
    const outcomes = [];
    const maskDelta = (maskFromCore(core) & bit) ? 0 : bit * maskUnit;
    const resetPityCore = core - count * layout.countUnit;
    if (hitRate < 1) outcomes.push(core + layout.countUnit, 1 - hitRate, false);
    if (specialGuaranteed) {
      outcomes.push(resetPityCore - layout.specialGuaranteedUnit + maskDelta, hitRate, true);
    } else if (guaranteed) {
      outcomes.push(resetPityCore - layout.guaranteedUnit + maskDelta, hitRate, true);
    } else {
      const featuredProbability = hitRate * rules.featuredRate;
      const missedProbability = hitRate * (1 - rules.featuredRate);
      if (featuredProbability > 0) outcomes.push(resetPityCore + maskDelta, featuredProbability, true);
      if (missedProbability > 0) outcomes.push(resetPityCore + layout.guaranteedUnit, missedProbability, false);
    }
    return outcomes;
  };

  const runUnitCostPhase = (arrivals, simulationTargets, cap) => {
    const latestArrival = arrivals.reduce((latest, bucket, index) => bucket?.size ? index : latest, 0);
    const maximumTargetSpend = simulationTargets.reduce((sum, target) => sum + target.rules.hardPity * 2, 0);
    const effectiveCap = Math.min(cap, latestArrival + maximumTargetSpend);
    const done = Array(effectiveCap + 1);
    let activeTargets = [];
    for (let spent = 0; spent <= effectiveCap; spent += 1) {
      const arriving = arrivals[spent];
      if (arriving) {
        if (!activeTargets[0]) activeTargets[0] = new Map();
        arriving.forEach((probability, core) => add(activeTargets[0], core, probability));
      }
      if (spent === effectiveCap) {
        activeTargets.forEach(active => active?.forEach((probability, core) => addBucket(done, effectiveCap, core, probability)));
        break;
      }
      const nextTargets = [];
      activeTargets.forEach((active, targetIndex) => active?.forEach((probability, core) => {
        const simulationTarget = simulationTargets[targetIndex];
        const branches = pullTarget(core, simulationTarget);
        for (let index = 0; index < branches.length; index += 3) {
          const nextCore = branches[index];
          const nextIndex = branches[index + 2] ? targetIndex + 1 : targetIndex;
          if (nextIndex >= simulationTargets.length) {
            addBucket(done, spent + 1, nextCore, probability * branches[index + 1]);
          } else {
            if (!nextTargets[nextIndex]) nextTargets[nextIndex] = new Map();
            add(nextTargets[nextIndex], nextCore, probability * branches[index + 1]);
          }
        }
      }));
      activeTargets = nextTargets;
    }
    return done;
  };

  function runPhase(arrivals, targetIds, cap, bits) {
    if (!targetIds.length) return arrivals;
    // Extra Agent copies are internal consecutive steps. Only the final copy
    // carries the Agent's outcome bit, so every Agent still uses one target bit.
    const simulationTargets = targetIds.flatMap(id => {
      const target = targetById.get(id);
      const rules = channelById.get(target.channelId).pity;
      const copies = target.kind === 'agent' ? runtime.agentMindscapes[target.characterId] - runtime.agentCurrentMindscapes[target.characterId] : 1;
      return Array.from({ length: copies }, (_, copyIndex) => ({
        bit: copyIndex === copies - 1 ? bits[target.id] : 0,
        layout: groupPacking[rules.groupId],
        rules
      }));
    });
    return runUnitCostPhase(arrivals, simulationTargets, cap);
  }

  function getConfig() {
    runtime.availableNow = resourceBudget().searches;
    const pityCounts = Object.values(runtime.pityGroups).map(group => group.count);
    if (![runtime.availableNow, ...pityCounts].every(Number.isFinite)) return null;
    if (!Number.isInteger(runtime.availableNow) || runtime.availableNow < 0 || runtime.availableNow > maximumAvailableSearches) return null;
    if (allChannels.some(channel => runtime.pityGroups[channel.pity.groupId].count < 0 || runtime.pityGroups[channel.pity.groupId].count >= channel.pity.hardPity)) return null;
    if (selectedTargetIds().length > PLANNER_CONFIG.maxSelectedTargets) return null;
    return {
      now: runtime.availableNow,
      groups: Object.fromEntries(Object.entries(runtime.pityGroups).map(([id, group]) => [id, { count: group.count, guaranteed: group.guaranteed, specialGuaranteed: group.specialGuaranteed }]))
    };
  }
  const getPlan = () => {
    const ordered = effectiveSelectedTargetOrder();
    const selected = new Set(ordered);
    const bits = Object.fromEntries(ordered.map((id, index) => [id, 1 << index]));
    const deadlines = [...new Set(characters.map(character => character.endDate))].sort();
    const incomeRate = projectionIncome().rate;
    const phases = deadlines.map((endDate, phase) => ({
      phase,
      endDate,
      estimatedGain: estimatedSearches(endDate, incomeRate),
      expired: localDeadline(endDate) <= Date.now(),
      targets: ordered.filter(id => targetById.get(id).endDate === endDate)
    }));
    const currentEndDate = [...periodDefaults.values()].find(period => period.phase === PLANNER_CONFIG.currentPhase)?.endDate;
    const currentPhase = phases.find(item => item.endDate === currentEndDate);
    return { selected, ordered, bits, phases, current: currentPhase && !currentPhase.expired ? currentPhase.targets : [] };
  };

  function summarize(arrivals, selected, bits) {
    const outcomes = new Map();
    arrivals.forEach(bucket => bucket && bucket.forEach((probability, core) => {
      const mask = maskFromCore(core);
      outcomes.set(mask, (outcomes.get(mask) || 0) + probability);
    }));
    const marginal = id => [...outcomes].reduce((sum, [mask, probability]) => sum + ((mask & bits[id]) ? probability : 0), 0);
    const intended = [...selected].reduce((mask, id) => mask | bits[id], 0);
    const complete = [...outcomes].reduce((sum, [mask, probability]) => sum + ((mask & intended) === intended ? probability : 0), 0);
    return { outcomes, marginal, complete, any: 1 - (outcomes.get(0) || 0), expected: [...selected].reduce((sum, id) => sum + marginal(id), 0) };
  }
  function balanceStats(arrivals, cap) {
    const distribution = new Map();
    let totalProbability = 0;
    arrivals.forEach((bucket, spent) => bucket && bucket.forEach(probability => {
      const remaining = Math.max(0, cap - spent);
      distribution.set(remaining, (distribution.get(remaining) || 0) + probability);
      totalProbability += probability;
    }));
    if (!totalProbability) return { expected: 0, low: 0, high: 0 };
    const ordered = [...distribution].sort((a, b) => a[0] - b[0]);
    const quantile = threshold => {
      let cumulative = 0;
      for (const [remaining, probability] of ordered) {
        cumulative += probability / totalProbability;
        if (cumulative + 1e-12 >= threshold) return remaining;
      }
      return ordered[ordered.length - 1][0];
    };
    const expected = ordered.reduce((sum, [remaining, probability]) => sum + remaining * probability / totalProbability, 0);
    return { expected, low: quantile(0.1), high: quantile(0.9) };
  }
  function simulate(cfg, plan) {
    let arrivals = [];
    const phaseBalances = [];
    addBucket(arrivals, 0, packCore(cfg.groups, 0), 1);
    plan.phases.forEach((phase, phaseIndex) => {
      const cap = cfg.now + phase.estimatedGain;
      if (phase.expired) {
        phaseBalances.push({ ...phase, cap, stats: null });
      } else {
        arrivals = runPhase(arrivals, phase.targets, cap, plan.bits);
        phaseBalances.push({ ...phase, cap, stats: balanceStats(arrivals, cap) });
      }
      const retainedGroupIds = new Set(plan.phases.slice(phaseIndex + 1).flatMap(futurePhase => futurePhase.targets.map(id => targetById.get(id).pityGroupId)));
      arrivals = compactArrivals(arrivals, retainedGroupIds);
    });
    return { ...summarize(arrivals, plan.selected, plan.bits), phaseBalances };
  }
  function simulateWithCurrentBalance(cfg, plan) {
    let arrivals = [];
    addBucket(arrivals, 0, packCore(cfg.groups, 0), 1);
    plan.phases.forEach((phase, phaseIndex) => {
      if (!phase.expired) arrivals = runPhase(arrivals, phase.targets, cfg.now, plan.bits);
      const retainedGroupIds = new Set(plan.phases.slice(phaseIndex + 1).flatMap(futurePhase => futurePhase.targets.map(id => targetById.get(id).pityGroupId)));
      arrivals = compactArrivals(arrivals, retainedGroupIds);
    });
    return summarize(arrivals, plan.selected, plan.bits);
  }

  function render() {
    hideTooltip();
    if (!validAppConfig || !runtimeCharactersValid()) { els.error.textContent = t('invalidAppConfig'); return; }
    const cfg = getConfig();
    const plan = getPlan();
    if (!cfg) { els.error.textContent = t('invalidConfig'); return; }
    const result = simulate(cfg, plan);
    renderCharacterProjections(result.phaseBalances);
    if (!plan.selected.size) {
      els.error.textContent = t('selectTarget'); els.order.textContent = ''; els.summary.innerHTML = ''; els.targetChances.innerHTML = ''; els.outcomes.innerHTML = ''; return;
    }
    els.error.textContent = '';
    const currentBalanceResult = simulateWithCurrentBalance(cfg, plan);
    const orderedSelected = plan.ordered;
    const renderedAt = Date.now();
    const availableTargetCount = orderedSelected.reduce((count, id) => {
      const target = targetById.get(id);
      return count + (localDeadline(target.startDate) <= renderedAt && localDeadline(target.endDate) > renderedAt ? 1 : 0);
    }, 0);
    const summaryAvailabilityNote = availableTargetCount === orderedSelected.length
      ? ''
      : availableTargetCount > 0
        ? availabilityBadge('mixedAvailabilityShort', 'mixedSummaryBalanceTooltip')
        : availabilityBadge('notAvailableNowShort', 'unavailableSummaryBalanceTooltip');
    const phaseLabels = plan.phases.filter(phase => phase.targets.length).map(phase => phase.targets.map(id => targetLabel(targetById.get(id))).join(' → '));
    els.order.textContent = `${t('targetPriority')}: ${phaseLabels.join(`  ${t('phaseSeparator')}  `)}`;
    els.summary.innerHTML = `
      <div class="card viz-stat"><div class="text-muted">${t('allTargets')}</div><div class="viz-stat-value">${pct(result.complete)}</div></div>
      <div class="card viz-stat"><div class="text-muted">${t('anyTarget')}</div><div class="viz-stat-value">${pct(result.any)}</div></div>
      <div class="card viz-stat"><div class="text-muted">${t('expectedTargets')}</div><div class="viz-stat-value">${decimal(result.expected)}</div></div>
      <div class="card viz-stat"><div class="text-muted">${t('anyCurrentNow')}</div><div class="viz-stat-value">${summaryAvailabilityNote}${pct(currentBalanceResult.any)}</div></div>`;
    els.targetChances.innerHTML = orderedSelected.map(id => {
      const obtained = result.marginal(id);
      const target = targetById.get(id);
      const futureNote = localDeadline(target.startDate) > Date.now()
        ? availabilityBadge('notAvailableNowShort', 'futureBalanceTooltip')
        : '';
      const currentBalanceChance = localDeadline(target.endDate) <= Date.now()
        ? '—'
        : `${futureNote}${pct(currentBalanceResult.marginal(id))}`;
      return `<tr><td>${escapeHtml(targetLabel(target))}</td><td class="text-end">${currentBalanceChance}</td><td class="text-end">${pct(obtained)}</td><td class="text-end">${pct(probabilityComplement(obtained))}</td></tr>`;
    }).join('');
    const roster = mask => orderedSelected.filter(id => mask & plan.bits[id]).map(id => targetLabel(targetById.get(id))).join(' + ') || t('noTarget');
    const missed = mask => orderedSelected.filter(id => !(mask & plan.bits[id])).map(id => targetLabel(targetById.get(id))).join(' + ') || '—';
    els.outcomes.innerHTML = [...result.outcomes].filter(([, probability]) => probability > 1e-12).sort((a, b) => b[1] - a[1])
      .map(([mask, probability]) => `<tr><td>${escapeHtml(roster(mask))}</td><td>${escapeHtml(missed(mask))}</td><td class="text-end">${pct(probability)}</td></tr>`).join('');
  }

  const updateAndPersist = () => { persistPlannerState(); render(); };
  const refreshPullHistory = () => {
    persistPlannerState();
    renderPullTracker();
    if (runtime.useTrackedIncome) {
      renderCharacterTable();
      render();
    }
  };
  els.pullTracker.addEventListener('toggle', () => {
    if (runtime.pullTrackerOpen !== els.pullTracker.open) {
      runtime.pullTrackerOpen = els.pullTracker.open;
      persistPlannerState();
    }
    if (els.pullTracker.open) renderPullTracker();
  });
  els.useTrackedIncome.addEventListener('change', () => {
    runtime.useTrackedIncome = els.useTrackedIncome.checked;
    renderCharacterTable();
    updateAndPersist();
  });
  const newPullHistoryId = () => globalThis.crypto?.randomUUID?.() || `history-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  els.pullSnapshotForm.addEventListener('submit', event => {
    event.preventDefault();
    if (runtime.pullHistory.length >= maximumPullHistoryEntries) {
      setPullTrackerMessage('historyLimitReached', true);
      return;
    }
    const recordedAt = new Date(els.pullSnapshotDate.value).getTime();
    const spent = Number(els.pullSnapshotSpent.value);
    const purchasedUnits = pullUnitsFromInput(els.pullSnapshotPurchased.value);
    const adjustmentUnits = pullUnitsFromInput(els.pullSnapshotAdjustment.value, true);
    const entry = {
      id: newPullHistoryId(), recordedAt,
      balances: Object.fromEntries(resourceKeys.map(key => [key, runtime.resourceBalances[key]])),
      spent: runtime.pullHistory.length ? spent : 0,
      purchasedUnits: runtime.pullHistory.length ? purchasedUnits : 0,
      adjustmentUnits: runtime.pullHistory.length ? adjustmentUnits : 0
    };
    if (!Number.isInteger(spent) || purchasedUnits === null || adjustmentUnits === null || !pullHistoryEntryIsValid(entry)) {
      setPullTrackerMessage('invalidSnapshot', true);
      return;
    }
    runtime.pullHistory = normalizedPullHistory([...runtime.pullHistory, entry]);
    els.pullSnapshotDate.value = localDateTimeInputValue(Date.now());
    els.pullSnapshotSpent.value = '0';
    els.pullSnapshotPurchased.value = '0';
    els.pullSnapshotAdjustment.value = '0';
    refreshPullHistory();
    setPullTrackerMessage('snapshotSaved');
  });
  els.pullHistoryRows.addEventListener('change', event => {
    const input = event.target.closest('.t-pull-history-input');
    if (!input) return;
    const row = input.closest('[data-history-id]');
    const index = runtime.pullHistory.findIndex(entry => entry.id === row.dataset.historyId);
    if (index < 0) return;
    const entry = { ...runtime.pullHistory[index], balances: { ...runtime.pullHistory[index].balances } };
    if (input.dataset.field === 'recordedAt') entry.recordedAt = new Date(input.value).getTime();
    else if (resourceKeys.includes(input.dataset.field)) entry.balances[input.dataset.field] = Number(input.value);
    else if (input.dataset.field === 'spent') entry.spent = Number(input.value);
    else {
      const units = pullUnitsFromInput(input.value, input.dataset.field === 'adjustmentUnits');
      if (units === null) {
        renderPullTracker();
        setPullTrackerMessage('invalidSnapshot', true);
        return;
      }
      entry[input.dataset.field] = units;
    }
    if (!pullHistoryEntryIsValid(entry)) {
      renderPullTracker();
      setPullTrackerMessage('invalidSnapshot', true);
      return;
    }
    runtime.pullHistory[index] = entry;
    runtime.pullHistory = normalizedPullHistory(runtime.pullHistory);
    refreshPullHistory();
    setPullTrackerMessage('snapshotUpdated');
  });
  els.pullHistoryRows.addEventListener('click', event => {
    const button = event.target.closest('.t-remove-pull-history');
    if (!button || !window.confirm(t('removeSnapshotConfirm'))) return;
    const id = button.closest('[data-history-id]').dataset.historyId;
    runtime.pullHistory = normalizedPullHistory(runtime.pullHistory.filter(entry => entry.id !== id));
    refreshPullHistory();
    setPullTrackerMessage('snapshotRemoved');
  });
  els.exportPullHistory.addEventListener('click', () => {
    const payload = JSON.stringify({ format: 'zzz-pull-history', version: 1, exportedAt: new Date().toISOString(), entries: runtime.pullHistory }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `zzz-pull-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  els.importPullHistory.addEventListener('click', () => {
    els.importPullHistoryFile.value = '';
    els.importPullHistoryFile.click();
  });
  els.importPullHistoryFile.addEventListener('change', async () => {
    const file = els.importPullHistoryFile.files?.[0];
    if (!file || file.size > 1024 * 1024) {
      if (file) setPullTrackerMessage('invalidHistoryFile', true);
      return;
    }
    try {
      const payload = JSON.parse(await file.text());
      const imported = payload?.format === 'zzz-pull-history' && payload.version === 1 ? normalizedPullHistory(payload.entries, true) : null;
      if (!imported) throw new Error('Invalid pull history');
      if (runtime.pullHistory.length && !window.confirm(t('replaceHistoryConfirm'))) return;
      runtime.pullHistory = imported;
      refreshPullHistory();
      setPullTrackerMessage('historyImported');
    } catch {
      setPullTrackerMessage('invalidHistoryFile', true);
    }
  });
  els.addProvisional.addEventListener('click', () => openProvisionalForm());
  els.cancelProvisional.addEventListener('click', closeProvisionalForm);
  els.currentMindscape.addEventListener('change', () => renderMindscapeTargetOptions(els.targetMindscape.value));
  els.cancelMindscape.addEventListener('click', closeMindscapeDialog);
  els.mindscapeDialog.addEventListener('close', () => { mindscapeDialogCharacterId = ''; });
  els.mindscapeForm.addEventListener('submit', event => {
    event.preventDefault();
    const character = characterById.get(mindscapeDialogCharacterId);
    const currentMindscape = +els.currentMindscape.value;
    const targetMindscape = +els.targetMindscape.value;
    if (!character || !Number.isInteger(currentMindscape) || currentMindscape < -1 || currentMindscape >= maximumMindscape || !Number.isInteger(targetMindscape) || targetMindscape <= currentMindscape || targetMindscape > maximumMindscape) return;
    runtime.agentCurrentMindscapes[character.id] = currentMindscape;
    runtime.agentMindscapes[character.id] = targetMindscape;
    closeMindscapeDialog();
    renderCharacterTable();
    updateAndPersist();
  });
  els.provisionalSchedule.addEventListener('change', () => {
    if (els.provisionalSchedule.value === '__custom__' && (!els.provisionalStart.value || !els.provisionalEnd.value)) {
      const suggested = nextScheduleDates();
      els.provisionalStart.value = suggested.startDate;
      els.provisionalEnd.value = suggested.endDate;
    }
    updateProvisionalDateFields();
  });
  els.provisionalForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = els.provisionalName.value.trim();
    const channelId = els.provisionalChannel.value;
    const editing = runtime.customCharacters.find(character => character.id === els.provisionalId.value);
    let dates = els.provisionalSchedule.value === '__next__' ? nextScheduleDates() : parseWindowValue(els.provisionalSchedule.value);
    if (els.provisionalSchedule.value === '__custom__') dates = { startDate: els.provisionalStart.value, endDate: els.provisionalEnd.value };
    if (!name || name.length > 60 || !agentChannelById.has(channelId) || !dates || !validDateRange(dates.startDate, dates.endDate)) {
      els.provisionalError.textContent = t('invalidProvisional');
      return;
    }
    if (!editing && characters.length >= PLANNER_CONFIG.maxAgents) {
      els.provisionalError.textContent = maxAgentsReachedText();
      return;
    }

    let scheduleId;
    if (editing && els.provisionalSchedule.value === '__custom__') {
      const currentPeriod = runtime.customPeriods.find(period => period.id === editing.scheduleId);
      const matchingPeriod = runtime.customPeriods.find(period => period.id !== editing.scheduleId && period.startDate === dates.startDate && period.endDate === dates.endDate);
      if (matchingPeriod) {
        runtime.customCharacters.forEach(character => { if (character.scheduleId === editing.scheduleId) character.scheduleId = matchingPeriod.id; });
        scheduleId = matchingPeriod.id;
      } else {
        currentPeriod.startDate = dates.startDate;
        currentPeriod.endDate = dates.endDate;
        scheduleId = currentPeriod.id;
      }
    } else {
      scheduleId = findOrCreateCustomPeriod(dates.startDate, dates.endDate).id;
    }

    if (editing) {
      editing.name = name;
      editing.channelId = channelId;
      editing.scheduleId = scheduleId;
    } else {
      runtime.customCharacters.push({ id: uniqueCustomId('custom-character'), name, channelId, scheduleId });
    }
    removeUnusedCustomPeriods();
    rebuildCharacterRegistry();
    closeProvisionalForm();
    renderCharacterTable();
    updateAndPersist();
  });
  root.addEventListener('input', event => {
    const target = event.target;
    if (target.matches('.t-resource-amount')) {
      runtime.resourceBalances[target.dataset.resource] = +target.value;
      renderResourceBalance();
    }
    if (target.matches('.t-pity')) {
      runtime.pityGroups[target.dataset.pityGroup].count = +target.value;
      root.querySelectorAll(`.t-pity[data-pity-group="${target.dataset.pityGroup}"]`).forEach(input => { if (input !== target) input.value = target.value; });
    }
    if (target.matches('.t-resource-amount, .t-pity')) updateAndPersist();
  });
  root.addEventListener('change', event => {
    const target = event.target;
    if (target.matches('.t-resource-enabled')) {
      const key = target.dataset.resource;
      runtime.resourceEnabled[key] = target.checked;
      els.resourceAmounts[key].disabled = !target.checked;
      renderResourceBalance();
      updateAndPersist();
      if (target.checked) els.resourceAmounts[key].focus();
      return;
    }
    if (target.matches('.t-character-enabled, .t-w-engine-enabled')) {
      const store = target.matches('.t-w-engine-enabled') ? runtime.wEngineEnabled : runtime.enabled;
      store[target.dataset.characterId] = target.checked;
      if (selectedTargetIds().length > PLANNER_CONFIG.maxSelectedTargets) {
        store[target.dataset.characterId] = false;
        target.checked = false;
        renderCharacterTable();
        els.error.textContent = t('maxTargetsReached');
        return;
      }
      renderCharacterTable();
      updateAndPersist();
      return;
    }
    if (target === els.separateWEnginePriorities) {
      if (target.checked && !runtime.separateOrderInitialized) {
        runtime.targetOrder = constrainOrder(compactTargetOrder(), targetById);
        runtime.separateOrderInitialized = true;
      }
      runtime.separateWEnginePriorities = target.checked;
      renderCharacterTable();
      updateAndPersist();
      return;
    }
    if (target.matches('.t-guaranteed')) {
      runtime.pityGroups[target.dataset.pityGroup].guaranteed = target.checked;
      root.querySelectorAll(`.t-guaranteed[data-pity-group="${target.dataset.pityGroup}"]`).forEach(input => { input.checked = target.checked; });
    }
    if (target.matches('.t-special-guaranteed')) {
      runtime.pityGroups[target.dataset.pityGroup].specialGuaranteed = target.checked;
      root.querySelectorAll(`.t-special-guaranteed[data-pity-group="${target.dataset.pityGroup}"]`).forEach(input => { input.checked = target.checked; });
    }
    if (target.matches('.t-guaranteed, .t-special-guaranteed')) updateAndPersist();
  });
  root.addEventListener('click', event => {
    const mindscapeButton = event.target.closest('.t-edit-mindscape');
    if (mindscapeButton) {
      openMindscapeDialog(mindscapeButton.dataset.characterId);
      return;
    }
    const editButton = event.target.closest('.t-edit-provisional');
    if (editButton) {
      openProvisionalForm(editButton.dataset.characterId);
      return;
    }
    const deleteButton = event.target.closest('.t-delete-provisional');
    if (deleteButton) {
      const character = characterById.get(deleteButton.dataset.characterId);
      if (!character?.provisional || !window.confirm(t('removeProvisionalConfirm').replace('{name}', character.name))) return;
      runtime.customCharacters = runtime.customCharacters.filter(item => item.id !== character.id);
      delete runtime.enabled[character.id];
      delete runtime.wEngineEnabled[character.id];
      runtime.characterOrder = runtime.characterOrder.filter(id => id !== character.id);
      runtime.targetOrder = runtime.targetOrder.filter(id => targetById.get(id)?.characterId !== character.id);
      removeUnusedCustomPeriods();
      rebuildCharacterRegistry();
      if (els.provisionalId.value === character.id) closeProvisionalForm();
      renderCharacterTable();
      updateAndPersist();
      return;
    }
    const targetButton = event.target.closest('.t-move-target');
    if (targetButton) {
      const orderedSelected = runtime.targetOrder.filter(id => targetIsSelected(targetById.get(id)));
      const selectedIndex = orderedSelected.indexOf(targetButton.dataset.targetId);
      const nextSelectedIndex = selectedIndex + Number(targetButton.dataset.direction);
      if (selectedIndex < 0 || nextSelectedIndex < 0 || nextSelectedIndex >= orderedSelected.length) return;
      const firstId = orderedSelected[selectedIndex];
      const secondId = orderedSelected[nextSelectedIndex];
      if (!runsOverlap(targetById.get(firstId), targetById.get(secondId))) return;
      const firstIndex = runtime.targetOrder.indexOf(firstId);
      const secondIndex = runtime.targetOrder.indexOf(secondId);
      [runtime.targetOrder[firstIndex], runtime.targetOrder[secondIndex]] = [runtime.targetOrder[secondIndex], runtime.targetOrder[firstIndex]];
      renderCharacterTable(); updateAndPersist();
      return;
    }
    const button = event.target.closest('.t-move-character');
    if (!button) return;
    const index = runtime.characterOrder.indexOf(button.dataset.characterId);
    const nextIndex = index + Number(button.dataset.direction);
    if (index < 0 || nextIndex < 0 || nextIndex >= runtime.characterOrder.length) return;
    if (!runsOverlap(characterById.get(runtime.characterOrder[index]), characterById.get(runtime.characterOrder[nextIndex]))) return;
    [runtime.characterOrder[index], runtime.characterOrder[nextIndex]] = [runtime.characterOrder[nextIndex], runtime.characterOrder[index]];
    renderCharacterTable(); updateAndPersist();
  });

  const initialLanguage = storedLanguage() || preferredLanguage();
  renderLanguageOptions();
  await loadLocale(initialLanguage);
  language = localeLoader.normalize(initialLanguage);
  applyTheme(storedTheme() || 'dark');
  els.languageSelect.addEventListener('change', async event => {
    const requestedLanguage = event.currentTarget.value;
    els.languageSelect.disabled = true;
    try {
      await loadLocale(requestedLanguage);
      applyLanguage(requestedLanguage, true);
    } catch (error) {
      console.error('Unable to load the requested locale.', error);
      els.languageSelect.value = language;
    } finally {
      els.languageSelect.disabled = false;
    }
  });
  els.themeSelect.addEventListener('change', event => applyTheme(event.currentTarget.value, true));
  applyPlannerState(storedPlannerState());
  els.pullTracker.open = runtime.pullTrackerOpen;
  syncResourceControls();
  applyLanguage(initialLanguage, false, false);
  persistPlannerState();
  render();
  root.removeAttribute('data-localizing');
  window.setInterval(() => {
    renderCharacterTable();
    render();
  }, PLANNER_CONFIG.incomeEstimate.refreshMinutes * 60 * 1000);
})().catch(error => {
  console.error('Unable to initialize the planner.', error);
  const planner = document.getElementById('zzz-universal-planner');
  planner?.removeAttribute('data-localizing');
  const errorElement = document.getElementById('t-error');
  if (errorElement) errorElement.textContent = 'The calculator could not be initialized. Reload the page and make sure all application files are present.';
});
