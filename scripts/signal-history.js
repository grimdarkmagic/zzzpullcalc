(() => {
  'use strict';

  const channelTypes = ['1', '2', '3', '5', '102', '103'];
  const databaseName = 'zzz-signal-search-history';
  const storeName = 'archives';
  const archiveKey = 'current';
  const maximumRecords = 100000;
  // These launch-pool S-Ranks cannot be the selected limited result.
  const standardAgentIds = new Set(['1021', '1041', '1101', '1141', '1181', '1211']);
  const standardWEngineIds = new Set(['14102', '14104', '14110', '14114', '14118', '14121']);

  const compareIdsDescending = (left, right) => right.id.length - left.id.length || right.id.localeCompare(left.id);
  const validTimestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value);

  const normalize = input => {
    if (!input || input.format !== 'zzz-signal-search-records' || input.version !== 1 || !Array.isArray(input.channels) ||
        typeof input.exportedAt !== 'string' || !Number.isFinite(Date.parse(input.exportedAt))) throw new Error('Invalid Signal Search export');
    const channels = new Map();
    let uid = null;
    let total = 0;
    for (const channel of input.channels) {
      const type = String(channel?.type ?? '');
      if (!channelTypes.includes(type) || channels.has(type) || !Array.isArray(channel.records)) throw new Error('Invalid Signal Search channel');
      const records = [];
      const ids = new Set();
      for (const raw of channel.records) {
        if (!raw || typeof raw !== 'object' || !/^\d{1,30}$/.test(String(raw.id ?? '')) ||
            !/^\d{5,15}$/.test(String(raw.uid ?? '')) || !['2', '3', '4'].includes(String(raw.rank_type ?? '')) ||
            !validTimestamp(raw.time) || ids.has(String(raw.id))) throw new Error('Invalid Signal Search record');
        ids.add(String(raw.id));
        const recordUid = String(raw.uid);
        if (uid && uid !== recordUid) throw new Error('Mixed Signal Search accounts');
        uid = recordUid;
        records.push({
          id: String(raw.id), uid: recordUid, gacha_id: String(raw.gacha_id ?? ''), gacha_type: String(raw.gacha_type ?? ''),
          item_id: String(raw.item_id ?? ''), count: String(raw.count ?? '1'), time: raw.time, name: String(raw.name ?? ''),
          lang: String(raw.lang ?? ''), item_type: String(raw.item_type ?? ''), rank_type: String(raw.rank_type)
        });
        if (++total > maximumRecords) throw new Error('Signal Search export is too large');
      }
      records.sort(compareIdsDescending);
      channels.set(type, { type, records });
    }
    if (channels.size !== channelTypes.length || channelTypes.some(type => !channels.has(type)) ||
        (input.uid && uid && String(input.uid) !== uid)) throw new Error('Incomplete Signal Search export');
    const sKeys = new Set(channelTypes.flatMap(type => channels.get(type).records
      .filter(record => record.rank_type === '4').map(record => `${type}:${record.id}`)));
    const outcomes = {};
    if (input.outcomes && typeof input.outcomes === 'object' && !Array.isArray(input.outcomes)) {
      for (const [key, value] of Object.entries(input.outcomes)) {
        if (sKeys.has(key) && ['featured', 'off-banner'].includes(value)) outcomes[key] = value;
      }
    }
    return {
      format: 'zzz-signal-search-records', version: 1, exportedAt: input.exportedAt, uid: uid || String(input.uid || ''),
      channels: channelTypes.map(type => channels.get(type)), outcomes
    };
  };

  const merge = (current, incoming) => {
    if (!current) return incoming;
    if (current.uid && incoming.uid && current.uid !== incoming.uid) return incoming;
    const channels = channelTypes.map(type => {
      const oldRecords = current.channels.find(channel => channel.type === type)?.records || [];
      const newRecords = incoming.channels.find(channel => channel.type === type)?.records || [];
      const byId = new Map(oldRecords.map(record => [record.id, record]));
      newRecords.forEach(record => byId.set(record.id, record));
      return { type, records: [...byId.values()].sort(compareIdsDescending) };
    });
    const sKeys = new Set(channels.flatMap(channel => channel.records
      .filter(record => record.rank_type === '4').map(record => `${channel.type}:${record.id}`)));
    const outcomes = Object.fromEntries(Object.entries({ ...current.outcomes, ...incoming.outcomes })
      .filter(([key]) => sKeys.has(key)));
    return {
      ...incoming,
      uid: incoming.uid || current.uid,
      exportedAt: Date.parse(current.exportedAt) > Date.parse(incoming.exportedAt) ? current.exportedAt : incoming.exportedAt,
      channels, outcomes
    };
  };

  const overlaps = (current, incoming) => channelTypes.every(type => {
    const oldRecords = current.channels.find(channel => channel.type === type)?.records || [];
    const newRecords = incoming.channels.find(channel => channel.type === type)?.records || [];
    if (!oldRecords.length || !newRecords.length) return true;
    const oldIds = new Set(oldRecords.map(record => record.id));
    return newRecords.some(record => oldIds.has(record.id));
  });

  const count = archive => archive?.channels.reduce((sum, channel) => sum + channel.records.length, 0) || 0;
  const pity = (archive, type, hardPity, completeFromFirstSearch = false) => {
    const records = archive?.channels.find(channel => channel.type === type)?.records;
    if (!records) return null;
    const lastS = records.findIndex(record => record.rank_type === '4');
    if (lastS < 0 && !completeFromFirstSearch) return null;
    const result = lastS < 0 ? records.length : lastS;
    return result < hardPity ? result : null;
  };
  const latestS = (archive, type) => archive?.channels.find(channel => channel.type === type)?.records
    .find(record => record.rank_type === '4') || null;
  const guarantee = (archive, type, completeFromFirstSearch = false, outcomes = archive?.outcomes || {}) => {
    if (!['2', '3', '102', '103'].includes(type)) return null;
    const records = archive?.channels.find(channel => channel.type === type)?.records;
    if (!records) return null;
    const sRanks = records.filter(record => record.rank_type === '4');
    if (!sRanks.length) return completeFromFirstSearch ? false : null;
    const isStandard = record => (type === '2' || type === '102' ? standardAgentIds : standardWEngineIds).has(record.item_id);
    // Other S-Ranks may be featured or part of the customizable off-banner pool.
    // The export has no selected-banner field, so leave those outcomes unresolved.
    const outcome = record => outcomes[`${type}:${record.id}`] || (isStandard(record) ? 'off-banner' : null);
    const latest = outcome(sRanks[0]);
    if (latest === 'off-banner') return true;
    // A Special Guarantee can leave the ordinary guarantee intact.
    if (type === '102' || type === '103') return null;
    if (latest === 'featured' || (sRanks[1] && outcome(sRanks[1]) === 'off-banner')) return false;
    return null;
  };
  const timeline = (archive, completeFromFirstSearch = false) => {
    if (!archive) return [];
    const entries = archive.channels.flatMap(channel => {
      let sinceS = completeFromFirstSearch ? 0 : null;
      return channel.records.slice().reverse().map(record => {
        const cycleSearches = sinceS === null ? null : sinceS + 1;
        sinceS = record.rank_type === '4' ? 0 : cycleSearches;
        return { record, channelType: channel.type, cycleSearches };
      });
    });
    entries.sort((left, right) => left.record.time.localeCompare(right.record.time) ||
      left.record.id.length - right.record.id.length || left.record.id.localeCompare(right.record.id));
    const channelTotals = new Map();
    return entries.map((entry, index) => {
      const channelCumulativeSearches = (channelTotals.get(entry.channelType) || 0) + 1;
      channelTotals.set(entry.channelType, channelCumulativeSearches);
      return { ...entry, cumulativeSearches: index + 1, channelCumulativeSearches };
    });
  };

  // Keep this S-Rank hazard in sync with the planner's exact-DP channel rules.
  const sRankHazard = (pity, rules) => {
    const pull = pity + 1;
    if (pull >= rules.hardPity) return 1;
    if (pull < rules.softPityStartsAt) return rules.baseRate;
    return Math.min(1, rules.baseRate + rules.softPityStep * (pull - rules.softPityStartsAt + 1));
  };
  const timingModel = rules => {
    const byPull = [0];
    let surviving = 1;
    let expected = 0;
    for (let pull = 1; pull <= rules.hardPity; pull++) {
      expected += surviving;
      surviving *= 1 - sRankHazard(pull - 1, rules);
      byPull[pull] = 1 - surviving;
    }
    return { expected, byPull };
  };
  const sRankCountDistribution = (searches, rules) => {
    // Exact DP state: number of S-Ranks received and current S-Rank pity.
    let states = [new Float64Array(rules.hardPity)];
    states[0][0] = 1;
    for (let search = 0; search < searches; search++) {
      const next = Array.from({ length: states.length + 1 }, () => new Float64Array(rules.hardPity));
      for (let count = 0; count < states.length; count++) {
        for (let pity = 0; pity < rules.hardPity; pity++) {
          const probability = states[count][pity];
          if (!probability) continue;
          const hit = sRankHazard(pity, rules);
          next[count + 1][0] += probability * hit;
          if (hit < 1) next[count][pity + 1] += probability * (1 - hit);
        }
      }
      states = next;
    }
    return states.map(byPity => byPity.reduce((sum, probability) => sum + probability, 0));
  };
  const expectedSCount = (searches, rules) => {
    let byPity = new Float64Array(rules.hardPity);
    byPity[0] = 1;
    let expected = 0;
    for (let search = 0; search < searches; search++) {
      const next = new Float64Array(rules.hardPity);
      for (let pity = 0; pity < rules.hardPity; pity++) {
        const probability = byPity[pity];
        if (!probability) continue;
        const hit = sRankHazard(pity, rules);
        const hits = probability * hit;
        expected += hits;
        next[0] += hits;
        if (hit < 1) next[pity + 1] += probability * (1 - hit);
      }
      byPity = next;
    }
    return expected;
  };
  const countComparison = (archive, types, rulesByType) => {
    if (!archive) return null;
    const channels = types.map(type => ({ type, records: archive.channels.find(channel => channel.type === type)?.records || [] }))
      .filter(channel => rulesByType[channel.type] && channel.records.length);
    const searches = channels.reduce((sum, channel) => sum + channel.records.length, 0);
    const actual = channels.reduce((sum, channel) => sum + channel.records.filter(record => record.rank_type === '4').length, 0);
    if (searches > 1200) return {
      searches, actual,
      expected: channels.reduce((sum, channel) => sum + expectedSCount(channel.records.length, rulesByType[channel.type]), 0),
      atMost: null, atLeast: null
    };
    let distribution = [1];
    for (const { type, records } of channels) {
      const rules = rulesByType[type];
      const channelDistribution = sRankCountDistribution(records.length, rules);
      const next = new Array(distribution.length + channelDistribution.length - 1).fill(0);
      distribution.forEach((left, leftCount) => channelDistribution.forEach((right, rightCount) => {
        next[leftCount + rightCount] += left * right;
      }));
      distribution = next;
    }
    const expected = distribution.reduce((sum, probability, count) => sum + count * probability, 0);
    const probabilitySum = values => Math.min(1, Math.max(0, values.reduce((sum, probability) => sum + probability, 0)));
    return {
      searches, actual, expected,
      atMost: probabilitySum(distribution.slice(0, actual + 1)),
      atLeast: probabilitySum(distribution.slice(actual))
    };
  };

  const openDatabase = () => new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB failed'));
    request.onblocked = () => reject(new Error('IndexedDB blocked'));
  });

  const transaction = async (mode, operation) => {
    const db = await openDatabase();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const request = operation(tx.objectStore(storeName));
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
        tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
      });
    } finally { db.close(); }
  };
  const load = () => transaction('readonly', store => store.get(archiveKey));
  const save = archive => transaction('readwrite', store => store.put(archive, archiveKey));
  const remove = () => transaction('readwrite', store => store.delete(archiveKey));

  window.ZZZSignalHistory = Object.freeze({ normalize, merge, overlaps, count, pity, latestS, guarantee, timeline, timingModel, countComparison, load, save, remove });
})();
