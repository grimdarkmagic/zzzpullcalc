(() => {
  'use strict';

  window.ZZZ_PLANNER_LOCALES ??= {};
  window.ZZZ_PLANNER_LOCALES.ru = Object.freeze({
      pageTitle: 'Универсальный планировщик круток ZZZ', title: 'Универсальный планировщик круток ZZZ', availableNow: 'Круток доступно сейчас',
      currentResources: 'Текущие ресурсы для круток', monochromes: 'Монохромы', polychromes: 'Полихромы', encryptedMasterTapes: 'Шифрокопии',
      resourceHelp: 'Отмеченные ресурсы учитываются в расчёте. 160 монохромов или полихромов равны одной крутке; одна шифрокопия равна одной крутке.',
      resourceBreakdown: '{tapes} из шифрокопий + {converted} из валюты · {remainder}/160 до следующей крутки', invalidResourceBalance: 'Введите целые неотрицательные значения ресурсов.',
      channels: 'Каналы', agentChannels: 'Каналы агентов', wEngineChannels: 'Каналы амплификаторов', channel: 'Канал', availability: 'Период доступности', estimatedSearches: 'Прогноз круток к сроку', currentPity: 'Текущее пити S-ранга',
      guaranteeStatus: 'Состояние гарантов', searchRules: 'Правила круток', agentTargets: 'Целевые агенты', target: 'Цель', agentTarget: 'Агент-цель', wEngineTarget: 'Амплификатор-цель', agentTargetShort: 'Агент', wEngineTargetShort: 'Ампл.', priority: 'Приоритет', agent: 'Агент', actions: 'Действия',
      exclusiveChannel: 'Эксклюзивный канал', exclusiveRescreening: 'Эксклюзивный реран', wEngineChannel: 'Канал амплификаторов', wEngineReverberation: 'Реверберация амплификаторов', normalAgentGuarantee: 'Следующий S-ранг — выбранный агент', normalWEngineGuarantee: 'Следующий S-ранг — выбранный амплификатор', specialGuarantee: 'Особый гарант доступен',
      baseRate: 'базовый шанс', guaranteedBy: 'S-ранг гарантирован на', softPity: 'софт-пити с', ruleSummary: 'базовый шанс {baseRate} · софт-пити с {softPityStart} · S-ранг гарантирован на {hardPity}', featuredAgentRate: 'выбранный агент', featuredWEngineRate: 'выбранный амплификатор', independentPity: 'Счётчик отдельный от других каналов', dateTbd: 'Пока неизвестно', unconfirmed: 'Не подтверждено', provisional: 'Своя цель', moveUp: 'Переместить выше', moveDown: 'Переместить ниже', daysLeft: 'дней осталось', searchesPerDay: 'крутки/день',
      addProvisional: '+ Добавить свою цель', editProvisional: 'Изменить свою цель', provisionalName: 'Имя агента', provisionalChannel: 'Канал', provisionalSchedule: 'Период доступности',
      starts: 'Начало', ends: 'Конец', saveTarget: 'Сохранить', cancel: 'Отмена', editTarget: 'Изменить цель', removeTarget: 'Удалить цель',
      nextThreeWeeks: 'Следующий трёхнедельный период', customDates: 'Другие даты…', futureTarget: 'Будущий агент', targetLimit: 'Занято мест для агентов: {used} из {limit}',
      sharedSchedule: 'Изменение дат затронет {count} своих целей с тем же периодом доступности.', invalidProvisional: 'Укажите имя агента и корректные даты, где конец позже начала.',
      maxAgentsReached: 'Достигнут предел списка в {limit} агентов.', maxTargetsReached: 'Достигнут предел расчёта в 15 целей.', removeProvisionalConfirm: 'Удалить {name} из планировщика?',
      incomeNote: 'Автоматическая оценка дохода активного игрока: {rate} лимитированные крутки в день × время до 00:00 по местному времени в указанную дату окончания, с округлением вниз. Награды выдаются неравномерно, поэтому это средняя оценка, а не ежедневная гарантия.',
      budgetHelp: 'В каждой строке агента показан ожидаемый остаток кассет после более ранних целей-агентов и амплификаторов. Будущий доход накапливается к этому сроку, а периоды доступности определяют, какие цели можно переставлять.',
      expectedLeft: 'ожидаемый остаток', futureSuffix: 'к сроку', beforeSearches: 'до круток', likely: 'диапазон 80%', expired: 'Период завершён',
      selectedTarget: 'Цель', chanceNow: 'С текущим балансом', notAvailableNowShort: '(N/A)', mixedAvailabilityShort: '(MIX)', futureBalanceTooltip: 'Канал этой цели ещё не начался. Шанс рассчитан только по текущему балансу.', mixedSummaryBalanceTooltip: 'Часть выбранных целей доступна сейчас, а остальные — нет. Шанс учитывает их всех, используя только текущий баланс.', unavailableSummaryBalanceTooltip: 'Ни одна выбранная цель сейчас недоступна. Шанс рассчитан только по текущему балансу для их периодов доступности.', byDeadline: 'Получить к сроку', missByDeadline: 'Не получить к сроку',
      outcomeHelp: '«Не получить к сроку» — это дополнение до 100% к шансу получить цель. Каждая строка ниже — один взаимоисключающий полный исход выбранной стратегии.',
      exactRoster: 'Полученные выбранные цели', missedTargets: 'Пропущенные выбранные цели', chance: 'Точный шанс',
      separateWEnginePriorities: 'Настроить отдельный приоритет амплификаторов', separatePriorityHelp: 'Если выключено, выбранный амплификатор крутится сразу после своего агента. Включите, чтобы независимо расставить все выбранные цели.', selectedTargetCount: 'Выбрано целей для расчёта: {used} из {limit}', wEngineSuffix: 'амплификатор',
      lightTheme: 'Светлая тема', darkTheme: 'Тёмная тема', themeLabel: 'Тема',
      invalidConfig: 'Введите целые неотрицательные значения ресурсов общим объёмом не более 600 круток и значения пити в указанных пределах.', invalidAppConfig: 'Встроенная конфигурация каналов некорректна.',
      selectTarget: 'Выберите хотя бы одного агента или амплификатор.', targetPriority: 'Приоритет целей', allTargets: 'Получить все выбранные цели', anyTarget: 'Получить хотя бы одну выбранную цель',
      expectedTargets: 'Ожидаемое число полученных выбранных целей', anyCurrentNow: 'Получить хотя бы одну выбранную цель с текущим балансом', noTarget: 'Ни одна выбранная цель не получена', phaseSeparator: 'затем'
    });
})();
