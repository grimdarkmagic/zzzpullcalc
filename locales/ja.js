(() => {
  'use strict';

  window.ZZZ_PLANNER_LOCALES ??= {};
  window.ZZZ_PLANNER_LOCALES.ja = Object.freeze({
      pageTitle: 'ZZZ 変調プランナー', title: 'ZZZ 変調プランナー', availableNow: '現在の変調可能回数',
      currentResources: '現在の変調用リソース', monochromes: 'モノクローム', polychromes: 'ポリクローム', encryptedMasterTapes: '暗号化マスターテープ',
      resourceHelp: 'チェックを入れた残高を計算に含めます。モノクロームまたはポリクローム160個で変調1回、暗号化マスターテープ1個で変調1回分です。',
      resourceBreakdown: 'テープ分 {tapes}回 + 交換可能通貨分 {converted}回 · 次の1回まで {remainder}/160', invalidResourceBalance: 'リソース数は0以上の整数で入力してください。',
      pullTracker: '変調用リソースの獲得記録', pullTrackerHelp: '上の所持数を定期的に記録します。使用回数と集計から除外する残高変動は、前回の記録以降の分を入力してください。',
      exportHistory: '履歴を書き出す', importHistory: '履歴を読み込む', backupReminderTitle: 'バックアップを保存', historyBackupReminder: 'この履歴は現在のブラウザにのみ保存されます。ブラウザデータを消去したときや別の端末へ移るときに復元できるよう、定期的に書き出してください。', trackedTotal: '記録期間の合計', trackedSevenDays: '直近7日間の記録分', trackedThirtyDays: '直近30日間の記録分', trackedDailyAverage: '1日あたりの平均',
      snapshotDate: '記録日時', pullsSpent: '使用した変調回数', purchasedPulls: '購入分（変調回数換算）', otherBalanceChange: 'その他の残高変動', earnedPulls: '獲得した変調回数分',
      startTracking: '記録を始める', recordSnapshot: '現在の所持数を記録', snapshotAdjustmentHelp: '通常の獲得以外で増えた分は正の値、変調以外で減った分は負の値で入力します。購入分とその他の残高変動は獲得量の集計から除外されます。',
      noPullHistory: '記録はまだありません。現在の所持数を基準として保存すると集計が始まります。', pullHistoryBaseline: '基準', removeSnapshot: '記録を削除', invalidSnapshot: '有効な日時、0以上の整数の所持数と使用回数、および有効な除外対象の残高変動を入力してください。',
      snapshotSaved: '現在の所持数を記録しました。', snapshotUpdated: '記録を更新しました。', snapshotRemoved: '記録を削除しました。', historyImported: '変調履歴を読み込みました。', invalidHistoryFile: '有効な変調履歴が含まれていません。', historyLimitReached: '記録できる所持数は500件までです。', replaceHistoryConfirm: '現在の変調履歴を読み込んだ履歴に置き換えますか？', removeSnapshotConfirm: 'この記録を削除しますか？',
      useTrackedIncome: '記録した平均獲得量を予測に使う', trackedIncomeBasis: '{start}から{end}までの記録に基づく1日あたり{rate}回分です。経過時間あたりの獲得量を使い、購入分とその他の残高変動は除外しています。',
      trackedIncomeNeedsHistory: '実績値を計算するには、異なる時刻の過去の記録が2件以上必要です。', trackedIncomeNegative: '記録上の獲得量がマイナスです。予測に使う前に、所持数、使用回数、集計から除外した残高変動を確認してください。', trackedIncomeFallback: '実績値をまだ利用できないため、既定値で計算しています。',
      trackedIncomeNote: '記録に基づく収入予測：{start}から{end}までの実績値である限定変調分{rate}回/日 × 表示された終了日の現地時間00:00までの残り時間を切り捨てて計算します。',
      channels: 'チャンネル', agentChannels: 'エージェント用チャンネル', wEngineChannels: '音動機チャンネル', channel: 'チャンネル', availability: '開催期間', estimatedSearches: '期限までの予想変調回数', currentPity: '現在のS級天井カウント',
      guaranteeStatus: '確定排出状況', searchRules: '変調ルール', agentTargets: '狙うエージェント', target: '目標', agentTarget: 'エージェント目標', wEngineTarget: '音動機目標', agentTargetShort: 'エージェント', agentMindscapeTargetShort: 'エージェント / M', mindscape: '心象映画', mindscapeRange: '心象映画の範囲', currentMindscape: '現在', targetMindscape: '目標', notOwned: '未所持', editMindscapeRange: '心象映画の範囲を編集', saveMindscapeRange: '範囲を保存', mindscapeRangeHelp: '現在の所持状況と到達したい心象映画を設定します。必要な分は連続して変調します。', wEngineTargetShort: '音動機', priority: '優先順位', agent: 'エージェント', actions: '操作',
      agentNameRemielle: 'レミエール', agentNameSigrid: 'シグリッド', agentNameClaret: 'クラレッタ', agentNameNangongYu: '南宮羽', agentNameRoxy: 'ロクシー', agentNamePromeia: 'プロメイア', agentNameDialyn: 'ダイアリン', agentNameYuzuha: '柚葉', agentNameHarumasa: '悠真',
      exclusiveChannel: '独占チャンネル', exclusiveRescreening: '独占再上映', wEngineChannel: '音動機チャンネル', wEngineReverberation: '音動機再奏', normalAgentGuarantee: '次のS級は選択中のエージェント確定', normalWEngineGuarantee: '次のS級は選択中の音動機確定', specialGuarantee: '特別確定排出あり',
      baseRate: '基礎受信確率', guaranteedBy: 'S級確定', softPity: '確率上昇開始', ruleSummary: '基礎受信確率 {baseRate}・{softPityStart}回目から確率上昇・{hardPity}回以内にS級確定', featuredAgentRate: 'S級受信時の選択中エージェント率', featuredWEngineRate: 'S級受信時の選択中音動機率', independentPity: 'ほかのチャンネルとは別にカウント', dateTbd: '未定', unconfirmed: '未確認', provisional: 'カスタム', moveUp: '優先順位を上げる', moveDown: '優先順位を下げる', daysLeft: '日', searchesPerDay: '回/日',
      addProvisional: '+ カスタム目標を追加', editProvisional: 'カスタム目標を編集', provisionalName: 'エージェント名', provisionalChannel: 'チャンネル', provisionalSchedule: '開催期間',
      starts: '開始日', ends: '終了日', saveTarget: '目標を保存', cancel: 'キャンセル', editTarget: '目標を編集', removeTarget: '目標を削除',
      nextThreeWeeks: '次の3週間枠', customDates: '期間を指定…', futureTarget: '今後のエージェント', targetLimit: 'エージェント枠：{used}/{limit} 使用中',
      sharedSchedule: 'この開催期間を共有するカスタム目標{count}件の日付も更新されます。', invalidProvisional: 'エージェント名と有効な開催期間を入力してください。終了日は開始日より後に設定してください。',
      maxAgentsReached: 'エージェントは最大{limit}人まで登録できます。', maxTargetsReached: '計算対象は最大15件まで選択できます。', mindscapeHelp: '各エージェントの現在→目標の心象映画を設定します。必要な分は連続して変調し、範囲全体で計算目標15件のうち1件として数えます。', removeProvisionalConfirm: '「{name}」をプランナーから削除しますか？',
      incomeNote: 'アクティブプレイヤー向けの自動収入予測：限定変調分 {rate}回/日 × 表示された終了日の現地時間00:00までの残り時間を切り捨てて計算します。報酬の配布には偏りがあるため、毎日この回数を得られるという保証ではなく、期間全体の平均値です。',
      budgetHelp: '各エージェント行には、それより優先順位が高いエージェントと音動機に使用した後の予想テープ残数を表示します。将来の獲得分はその期限まで累積し、開催期間が重なる目標どうしで優先順位を変更できます。',
      expectedLeft: '回残る見込み', futureSuffix: '回追加見込み', beforeSearches: '回（変調前）', likely: '80%予測区間', expired: '終了済み',
      selectedTarget: '選択した目標', chanceNow: '現在の残高で獲得', notAvailableNowShort: '（未開催）', mixedAvailabilityShort: '（混在）', futureBalanceTooltip: 'この目標のチャンネルはまだ始まっていません。確率は現在の残高だけを使って計算しています。', mixedSummaryBalanceTooltip: '選択した目標には開催中と未開催のものが混在しています。確率は現在の残高だけを使い、すべての目標を含めて計算しています。', unavailableSummaryBalanceTooltip: '選択した目標のチャンネルはどれもまだ始まっていません。確率は現在の残高だけを使い、予定されている全チャンネルを含めて計算しています。', byDeadline: '期限までに獲得', missByDeadline: '期限までに未獲得',
      outcomeHelp: '「期限までに未獲得」は、その目標を獲得する確率の補数です。以下の各行は、選択した戦略で起こり得る相互排他的な最終結果を1つずつ示します。',
      exactRoster: '獲得した選択目標', missedTargets: '獲得できなかった選択目標', chance: '厳密確率',
      separateWEnginePriorities: '音動機の優先順位を個別に設定', separatePriorityHelp: 'オフの場合、選択した音動機は対応するエージェントの直後に変調します。オンにすると、選択したすべての目標を個別に並べ替えられます。', selectedTargetCount: '計算対象：{used}/{limit}件を選択中', wEngineSuffix: '音動機',
      lightTheme: 'ライトテーマ', darkTheme: 'ダークテーマ', themeLabel: 'テーマ',
      invalidConfig: 'リソース数は合計600回分以下の0以上の整数で入力し、天井カウントは表示範囲内に設定してください。', invalidAppConfig: '内蔵されているチャンネル設定が無効です。',
      selectTarget: 'エージェントまたは音動機を1件以上選択してください。', targetPriority: '目標の優先順位', allTargets: '選択した目標をすべて獲得', anyTarget: '選択した目標を1件以上獲得',
      expectedTargets: '獲得できる選択目標数の期待値', anyCurrentNow: '現在の残高で選択目標を1件以上獲得', noTarget: '獲得なし', phaseSeparator: '→'
    });
})();
