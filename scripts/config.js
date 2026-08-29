(() => {
  'use strict';

  // JSON-compatible source of truth for channels, schedules, pity rules, and defaults.
  window.ZZZ_PLANNER_CONFIG = {
    version: 6,
    currentPhase: 0,
    maxAgents: 30,
    maxSelectedTargets: 15,
    availableNow: 90,
    incomeEstimate: {
      limitedSearchesPerDay: 3,
      roundDown: true,
      deadlineTime: 'start-of-day-local',
      refreshMinutes: 60,
      basis: 'Realistic active-player F2P average including recurring modes, events, and ordinary update rewards.'
    },
    channels: [
      {
        id: 'exclusive', name: 'Exclusive Channel', wEngineChannelId: 'w-engine',
        pity: { groupId: 'exclusive', mode: 'exclusive', targetType: 'agent', count: 0, guaranteed: false, specialGuaranteed: false, hardPity: 90, baseRate: 0.006, softPityStartsAt: 74, softPityStep: 0.06, featuredRate: 0.5 },
        agents: [
          { id: 'remielle', name: 'Remielle', enabled: false, priority: 4, confirmed: true, startDate: '2026-07-29', endDate: '2026-09-09', budget: { periodId: 'version-3-1-end', phase: 0 } },
          { id: 'sigrid', name: 'Sigrid', enabled: false, priority: 5, confirmed: true, startDate: '2026-08-19', endDate: '2026-09-09', budget: { periodId: 'version-3-1-end', phase: 0 } },
          { id: 'claret', name: 'Claret', enabled: true, priority: 6, confirmed: false, startDate: '2026-09-09', endDate: '2026-09-30', budget: { periodId: 'claret-end', phase: 1 } },
          { id: 'nangong-yu', name: 'Nangong Yu', enabled: false, priority: 7, confirmed: false, startDate: '2026-09-09', endDate: '2026-09-30', budget: { periodId: 'claret-end', phase: 1 } },
          { id: 'roxy', name: 'Roxy', enabled: true, priority: 8, confirmed: false, startDate: '2026-09-30', endDate: '2026-10-21', budget: { periodId: 'roxy-end', phase: 2 } },
          { id: 'promeia', name: 'Promeia', enabled: false, priority: 9, confirmed: false, startDate: '2026-09-30', endDate: '2026-10-21', budget: { periodId: 'roxy-end', phase: 2 } }
        ]
      },
      {
        id: 'exclusive-rescreening', name: 'Exclusive Rescreening', wEngineChannelId: 'w-engine-reverberation',
        pity: { groupId: 'exclusive-rescreening', mode: 'rescreening', targetType: 'agent', count: 0, guaranteed: false, specialGuaranteed: true, hardPity: 90, baseRate: 0.006, softPityStartsAt: 74, softPityStep: 0.06, featuredRate: 0.5 },
        agents: [
          { id: 'dialyn', name: 'Dialyn', enabled: true, priority: 1, confirmed: true, startDate: '2026-08-19', endDate: '2026-09-09', budget: { periodId: 'version-3-1-end', phase: 0 } },
          { id: 'yuzuha', name: 'Yuzuha', enabled: false, priority: 2, confirmed: true, startDate: '2026-08-19', endDate: '2026-09-09', budget: { periodId: 'version-3-1-end', phase: 0 } },
          { id: 'harumasa', name: 'Harumasa', enabled: false, priority: 3, confirmed: true, startDate: '2026-08-19', endDate: '2026-09-09', budget: { periodId: 'version-3-1-end', phase: 0 } }
        ]
      }
    ],
    wEngineChannels: [
      {
        id: 'w-engine', name: 'W-Engine Channel',
        pity: { groupId: 'w-engine', mode: 'w-engine', targetType: 'w-engine', count: 0, guaranteed: false, specialGuaranteed: false, hardPity: 80, baseRate: 0.01, softPityStartsAt: 65, softPityStep: 0.07, featuredRate: 0.75 }
      },
      {
        id: 'w-engine-reverberation', name: 'W-Engine Reverberation',
        pity: { groupId: 'w-engine-reverberation', mode: 'w-engine-reverberation', targetType: 'w-engine', count: 0, guaranteed: false, specialGuaranteed: true, hardPity: 80, baseRate: 0.01, softPityStartsAt: 65, softPityStep: 0.07, featuredRate: 0.75 }
      }
    ]
  };
})();
