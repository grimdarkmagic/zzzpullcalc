(() => {
  'use strict';

  // JSON-compatible source of truth for channels, schedules, pity rules, and defaults.
  // Built-in Agent names use the official English UI form as a fallback plus a locale dictionary key.
  window.ZZZ_PLANNER_CONFIG = {
    version: 9,
    currentPhase: 3,
    maxAgents: 30,
    maxSelectedTargets: 15,
    availableNow: 90,
    incomeEstimate: {
      limitedSearchesPerDay: 3,
      roundDown: true,
      deadlineTime: 'per-character-or-start-of-day-local',
      refreshMinutes: 60,
      basis: 'Realistic active-player F2P average including recurring modes, events, and ordinary update rewards.'
    },
    channels: [
      {
        id: 'exclusive', name: 'Exclusive Channel', wEngineChannelId: 'w-engine',
        pity: { groupId: 'exclusive', mode: 'exclusive', targetType: 'agent', count: 0, guaranteed: false, specialGuaranteed: false, hardPity: 90, baseRate: 0.006, softPityStartsAt: 74, softPityStep: 0.06, featuredRate: 0.5 },
        agents: [
          { id: 'phoenix', name: 'Phoenix', nameKey: 'agentNamePhoenix', enabled: true, priority: 10, confirmed: false, showUnconfirmedBadge: false, startDate: '2026-10-21', endDate: '2026-11-11', budget: { periodId: 'phoenix-end', phase: 3 } },
          { id: 'velina', name: 'Velina', nameKey: 'agentNameVelina', enabled: false, priority: 11, confirmed: false, showUnconfirmedBadge: false, startDate: '2026-10-21', endDate: '2026-11-11', budget: { periodId: 'phoenix-end', phase: 3 } },
          { id: 'severian', name: 'Severian', nameKey: 'agentNameSeverian', enabled: true, priority: 12, confirmed: false, showUnconfirmedBadge: false, startDate: '2026-11-11', endDate: '2026-12-02', budget: { periodId: 'severian-end', phase: 4 } },
          { id: 'norma', name: 'Norma', nameKey: 'agentNameNorma', enabled: false, priority: 13, confirmed: false, showUnconfirmedBadge: false, startDate: '2026-11-11', endDate: '2026-12-02', budget: { periodId: 'severian-end', phase: 4 } }
        ]
      },
      {
        id: 'exclusive-rescreening', name: 'Exclusive Rescreening', wEngineChannelId: 'w-engine-reverberation', visible: false,
        pity: { groupId: 'exclusive-rescreening', mode: 'rescreening', targetType: 'agent', count: 0, guaranteed: false, specialGuaranteed: true, hardPity: 90, baseRate: 0.006, softPityStartsAt: 74, softPityStep: 0.06, featuredRate: 0.5 },
        agents: []
      }
    ],
    wEngineChannels: [
      {
        id: 'w-engine', name: 'W-Engine Channel',
        pity: { groupId: 'w-engine', mode: 'w-engine', targetType: 'w-engine', count: 0, guaranteed: false, specialGuaranteed: false, hardPity: 80, baseRate: 0.01, softPityStartsAt: 65, softPityStep: 0.07, featuredRate: 0.75 }
      },
      {
        id: 'w-engine-reverberation', name: 'W-Engine Reverberation', visible: false,
        pity: { groupId: 'w-engine-reverberation', mode: 'w-engine-reverberation', targetType: 'w-engine', count: 0, guaranteed: false, specialGuaranteed: true, hardPity: 80, baseRate: 0.01, softPityStartsAt: 65, softPityStep: 0.07, featuredRate: 0.75 }
      }
    ]
  };
})();
