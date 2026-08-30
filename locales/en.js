(() => {
  'use strict';

  window.ZZZ_PLANNER_LOCALES ??= {};
  window.ZZZ_PLANNER_LOCALES.en = Object.freeze({
      pageTitle: 'ZZZ Signal Search Planner', title: 'ZZZ Signal Search planner', availableNow: 'Signal Searches available now',
      currentResources: 'Current pull resources', monochromes: 'Monochromes', polychromes: 'Polychromes', encryptedMasterTapes: 'Encrypted Master Tapes',
      resourceHelp: 'Checked balances count toward the calculation. 160 Monochromes or Polychromes equal one Signal Search; one Encrypted Master Tape equals one Signal Search.',
      resourceBreakdown: '{tapes} from tapes + {converted} from convertible currency · {remainder}/160 toward the next search', invalidResourceBalance: 'Enter whole, nonnegative resource amounts.',
      channels: 'Channels', agentChannels: 'Agent channels', wEngineChannels: 'W-Engine channels', channel: 'Channel', availability: 'Availability', estimatedSearches: 'Projected searches by deadline', currentPity: 'Current S-Rank pity',
      guaranteeStatus: 'Guarantee status', searchRules: 'Signal Search rules', agentTargets: 'Agent targets', target: 'Target', agentTarget: 'Agent target', wEngineTarget: 'W-Engine target', agentTargetShort: 'Agent', wEngineTargetShort: 'W-Engine', priority: 'Priority', agent: 'Agent', actions: 'Actions',
      exclusiveChannel: 'Exclusive Channel', exclusiveRescreening: 'Exclusive Rescreening', wEngineChannel: 'W-Engine Channel', wEngineReverberation: 'W-Engine Reverberation', normalAgentGuarantee: 'Next S-Rank is the selected Agent', normalWEngineGuarantee: 'Next S-Rank is the selected W-Engine', specialGuarantee: 'Special Guarantee available',
      baseRate: 'base rate', guaranteedBy: 'S-Rank guaranteed by', softPity: 'soft pity from', ruleSummary: 'base rate {baseRate} · soft pity from {softPityStart} · S-Rank guaranteed by {hardPity}', featuredAgentRate: 'selected Agent', featuredWEngineRate: 'selected W-Engine', independentPity: 'Tracked separately from other channels', dateTbd: 'TBD', unconfirmed: 'Unconfirmed', provisional: 'Custom', moveUp: 'Move up', moveDown: 'Move down', daysLeft: 'days left', searchesPerDay: 'searches/day',
      addProvisional: '+ Add custom target', editProvisional: 'Edit custom target', provisionalName: 'Agent name', provisionalChannel: 'Channel', provisionalSchedule: 'Availability',
      starts: 'Starts', ends: 'Ends', saveTarget: 'Save target', cancel: 'Cancel', editTarget: 'Edit target', removeTarget: 'Remove target',
      nextThreeWeeks: 'Next 3-week period', customDates: 'Custom dates…', futureTarget: 'Future Agent', targetLimit: '{used} of {limit} Agent slots used',
      sharedSchedule: 'Changing these dates will update {count} custom targets sharing this availability window.', invalidProvisional: 'Enter an Agent name and valid dates, with the end after the start.',
      maxAgentsReached: 'The {limit}-Agent list limit has been reached.', maxTargetsReached: 'The 15-target calculation limit has been reached.', removeProvisionalConfirm: 'Remove {name} from this planner?',
      incomeNote: 'Automatic active-player income estimate: {rate} limited Signal Searches per day × time remaining until 00:00 local time on the listed end date, rounded down. Rewards arrive unevenly, so this is a blended average rather than a daily promise.',
      budgetHelp: 'Each Agent row shows the expected tape balance after earlier Agent and W-Engine targets. Future income accumulates to that deadline, while availability dates determine which targets can be prioritized against each other.',
      expectedLeft: 'expected remaining', futureSuffix: 'by then', beforeSearches: 'before searches', likely: '80% range', expired: 'Ended',
      selectedTarget: 'Selected target', chanceNow: 'With current balance', notAvailableNowShort: '(N/A)', mixedAvailabilityShort: '(MIX)', futureBalanceTooltip: 'This target’s Channel has not started yet. The probability uses only your current balance.', mixedSummaryBalanceTooltip: 'Some selected targets are available now and others are not. The probability includes all of them using only your current balance.', unavailableSummaryBalanceTooltip: 'None of the selected targets is available now. The probability uses only your current balance across their scheduled Channels.', byDeadline: 'Obtain by deadline', missByDeadline: 'Miss by deadline',
      outcomeHelp: '“Miss by deadline” is the complement of that target’s acquisition chance. Each row below is one mutually exclusive complete result of the selected strategy.',
      exactRoster: 'Obtained selected targets', missedTargets: 'Missed selected targets', chance: 'Exact chance',
      separateWEnginePriorities: 'Use separate W-Engine priorities', separatePriorityHelp: 'When off, each selected W-Engine is searched immediately after its Agent. Turn this on to order every selected goal independently.', selectedTargetCount: '{used} of {limit} calculation targets selected', wEngineSuffix: 'W-Engine',
      lightTheme: 'Light theme', darkTheme: 'Dark theme', themeLabel: 'Theme',
      invalidConfig: 'Use whole, nonnegative resource amounts totaling no more than 600 Signal Searches, and pity values within the shown ranges.', invalidAppConfig: 'The embedded channel configuration is invalid.',
      selectTarget: 'Select at least one Agent or W-Engine target.', targetPriority: 'Target priority', allTargets: 'Obtain all selected targets', anyTarget: 'Obtain at least one selected target',
      expectedTargets: 'Expected number of selected targets obtained', anyCurrentNow: 'Obtain at least one selected target with the current balance', noTarget: 'No selected target obtained', phaseSeparator: 'then'
    });
})();
