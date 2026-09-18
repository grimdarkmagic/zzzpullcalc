(() => {
  'use strict';

  const svgEscape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const finite = value => Number.isFinite(value) ? value : 0;
  const sum = values => values.reduce((total, value) => total + finite(value), 0);

  const chartWidth = svg => Math.max(320, Math.round(svg.getBoundingClientRect().width || svg.parentElement?.clientWidth || 860));
  const numberFormatter = locale => new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const dateFormatter = (locale, withTime = false) => new Intl.DateTimeFormat(locale, withTime
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { year: '2-digit', month: 'short', day: 'numeric' });

  const niceExtent = values => {
    let low = Math.min(0, ...values.filter(Number.isFinite));
    let high = Math.max(0, ...values.filter(Number.isFinite));
    if (low === high) high = low + 1;
    const padding = (high - low) * 0.08;
    if (low < 0) low -= padding;
    high += padding;
    return [low, high];
  };

  const tickIndexes = (length, maximum = 5) => {
    if (length <= maximum) return Array.from({ length }, (_, index) => index);
    return [...new Set(Array.from({ length: maximum }, (_, index) => Math.round(index * (length - 1) / (maximum - 1))))];
  };

  const axesMarkup = ({ width, height, margin, yExtent, xLabels, xPositions, labels, formatNumber }) => {
    const innerHeight = height - margin.top - margin.bottom;
    const [low, high] = yExtent;
    const y = value => margin.top + (high - value) / (high - low) * innerHeight;
    const yTicks = Array.from({ length: 5 }, (_, index) => low + (high - low) * index / 4);
    const grid = yTicks.map(value => `<g><line x1="${margin.left}" x2="${width - margin.right}" y1="${y(value)}" y2="${y(value)}" class="pull-chart-grid-line"></line><text x="${margin.left - 8}" y="${y(value) + 4}" text-anchor="end">${svgEscape(formatNumber(value))}</text></g>`).join('');
    const xTicks = xLabels.map((label, index) => `<text x="${xPositions[index]}" y="${height - margin.bottom + 20}" text-anchor="middle">${svgEscape(label)}</text>`).join('');
    return `${grid}<line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" class="pull-chart-axis-line"></line>${xTicks}<text class="pull-chart-axis-title" x="${(margin.left + width - margin.right) / 2}" y="${height - 5}" text-anchor="middle">${svgEscape(labels.date)}</text><text class="pull-chart-axis-title" transform="translate(14 ${(margin.top + height - margin.bottom) / 2}) rotate(-90)" text-anchor="middle">${svgEscape(labels.pulls)}</text>`;
  };

  const renderCumulativeChart = (svg, points, labels, locale) => {
    const width = chartWidth(svg);
    const height = 290;
    const margin = { top: 18, right: 18, bottom: 48, left: 64 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const formatNumber = numberFormatter(locale).format;
    const formatDate = dateFormatter(locale).format;
    const values = points.flatMap(point => [point.cumulativeEarned, point.cumulativeSpent, point.balance]);
    const yExtent = niceExtent(values);
    const [low, high] = yExtent;
    const timestampLow = points[0]?.recordedAt ?? 0;
    const timestampHigh = points.at(-1)?.recordedAt ?? timestampLow;
    const x = (point, index) => timestampHigh === timestampLow
      ? margin.left + (points.length === 1 ? innerWidth / 2 : index * innerWidth / (points.length - 1))
      : margin.left + (point.recordedAt - timestampLow) / (timestampHigh - timestampLow) * innerWidth;
    const y = value => margin.top + (high - value) / (high - low) * innerHeight;
    const indexes = tickIndexes(points.length, width < 520 ? 3 : 5);
    const axes = axesMarkup({
      width, height, margin, yExtent,
      xLabels: indexes.map(index => formatDate(points[index].recordedAt)),
      xPositions: indexes.map(index => x(points[index], index)),
      labels, formatNumber
    });
    const series = [
      { key: 'cumulativeEarned', label: labels.earned, color: 'var(--viz-series-3)' },
      { key: 'cumulativeSpent', label: labels.spent, color: 'var(--viz-series-2)' },
      { key: 'balance', label: labels.wallet, color: 'var(--viz-series-1)' }
    ];
    const marks = series.map(item => {
      const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(point, index).toFixed(2)},${y(point[item.key]).toFixed(2)}`).join(' ');
      const dots = points.map((point, index) => `<circle cx="${x(point, index)}" cy="${y(point[item.key])}" r="3.5" fill="${item.color}" class="pull-chart-point"><title>${svgEscape(`${formatDate(point.recordedAt)} — ${item.label}: ${formatNumber(point[item.key])}`)}</title></circle>`).join('');
      return `<path d="${path}" fill="none" stroke="${item.color}" class="pull-chart-line"></path>${dots}`;
    }).join('');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', String(height));
    svg.setAttribute('aria-label', labels.cumulativeTitle);
    svg.innerHTML = `<title>${svgEscape(labels.cumulativeTitle)}</title>${axes}${marks}`;
  };

  const localDayStart = timestamp => {
    const date = new Date(timestamp);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  const nextLocalDay = timestamp => {
    const date = new Date(timestamp);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
  };

  const dailyBuckets = allPoints => {
    const buckets = new Map();
    const bucketFor = timestamp => {
      const start = localDayStart(timestamp);
      if (!buckets.has(start)) buckets.set(start, { start, end: nextLocalDay(start), earned: 0, spent: 0 });
      return buckets.get(start);
    };
    allPoints.slice(1).forEach((point, index) => {
      const previous = allPoints[index];
      const duration = point.recordedAt - previous.recordedAt;
      if (duration <= 0) {
        const bucket = bucketFor(point.recordedAt);
        bucket.earned += finite(point.earned);
        bucket.spent += finite(point.spent);
        return;
      }
      let cursor = previous.recordedAt;
      while (cursor < point.recordedAt) {
        const bucket = bucketFor(cursor);
        const sliceEnd = Math.min(point.recordedAt, bucket.end);
        const fraction = (sliceEnd - cursor) / duration;
        bucket.earned += finite(point.earned) * fraction;
        bucket.spent += finite(point.spent) * fraction;
        cursor = sliceEnd;
      }
    });
    return [...buckets.values()].sort((first, second) => first.start - second.start);
  };

  const renderDailyChart = (svg, allPoints, labels, locale, note) => {
    const points = dailyBuckets(allPoints);
    const width = chartWidth(svg);
    const height = 290;
    const margin = { top: 18, right: 18, bottom: 48, left: 64 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const formatNumber = numberFormatter(locale).format;
    const formatDate = dateFormatter(locale).format;
    note.textContent = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', String(height));
    svg.setAttribute('aria-label', labels.intervalsTitle);
    if (!points.length) {
      svg.innerHTML = `<title>${svgEscape(labels.intervalsTitle)}</title><text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="pull-chart-empty-label">${svgEscape(labels.noRateData)}</text>`;
      return;
    }
    const timestampLow = points[0].start;
    const timestampHigh = points.at(-1).end;
    const x = timestamp => margin.left + (timestamp - timestampLow) / (timestampHigh - timestampLow) * innerWidth;
    const yExtent = niceExtent(points.flatMap(point => [point.earned, point.spent]));
    const [low, high] = yExtent;
    const y = value => margin.top + (high - value) / (high - low) * innerHeight;
    const yZero = y(0);
    const indexes = tickIndexes(points.length, width < 520 ? 3 : 6);
    const axes = axesMarkup({
      width, height, margin, yExtent,
      xLabels: indexes.map(index => formatDate(points[index].start)),
      xPositions: indexes.map(index => x((points[index].start + points[index].end) / 2)),
      labels, formatNumber
    });
    const bars = points.map(point => {
      const left = x(point.start);
      const right = x(point.end);
      const availableWidth = Math.max(1, right - left);
      const gap = Math.min(2, availableWidth * 0.08);
      const barWidth = Math.max(0.5, (availableWidth - gap * 3) / 2);
      const bar = (value, offset, color, label) => {
        const top = Math.min(y(value), yZero);
        const barHeight = Math.max(1, Math.abs(y(value) - yZero));
        return `<rect x="${left + gap + offset}" y="${top}" width="${barWidth}" height="${barHeight}" fill="${color}" class="pull-chart-bar"><title>${svgEscape(`${formatDate(point.start)} — ${label}: ${formatNumber(value)}`)}</title></rect>`;
      };
      return `${bar(point.earned, 0, 'var(--viz-series-3)', labels.earned)}${bar(point.spent, barWidth + gap, 'var(--viz-series-2)', labels.spent)}`;
    }).join('');
    svg.innerHTML = `<title>${svgEscape(labels.intervalsTitle)}</title>${axes}<line x1="${margin.left}" x2="${width - margin.right}" y1="${yZero}" y2="${yZero}" class="pull-chart-zero-line"></line>${bars}`;
  };

  const renderWalletChart = (svg, points, labels, locale) => {
    const width = chartWidth(svg);
    const height = 290;
    const margin = { top: 18, right: 18, bottom: 48, left: 64 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const formatNumber = numberFormatter(locale).format;
    const formatDate = dateFormatter(locale).format;
    const maximum = Math.max(1, ...points.map(point => point.balance)) * 1.08;
    const yExtent = [0, maximum];
    const timestampLow = points[0]?.recordedAt ?? 0;
    const timestampHigh = points.at(-1)?.recordedAt ?? timestampLow;
    const x = (point, index) => timestampHigh === timestampLow
      ? margin.left + (points.length === 1 ? innerWidth / 2 : index * innerWidth / (points.length - 1))
      : margin.left + (point.recordedAt - timestampLow) / (timestampHigh - timestampLow) * innerWidth;
    const y = value => margin.top + (maximum - value) / maximum * innerHeight;
    const indexes = tickIndexes(points.length, width < 520 ? 3 : 5);
    const axes = axesMarkup({
      width, height, margin, yExtent,
      xLabels: indexes.map(index => formatDate(points[index].recordedAt)),
      xPositions: indexes.map(index => x(points[index], index)), labels, formatNumber
    });
    const series = [
      { key: 'monochromes', label: labels.monochromes, color: 'var(--viz-series-5)' },
      { key: 'polychromes', label: labels.polychromes, color: 'var(--viz-series-4)' },
      { key: 'tapes', label: labels.tapes, color: 'var(--viz-series-6)' }
    ];
    const bases = points.map(() => 0);
    const areas = series.map(item => {
      if (points.length === 1) {
        const value = points[0][item.key];
        const base = bases[0];
        bases[0] += value;
        return `<rect x="${margin.left + innerWidth * 0.32}" y="${y(base + value)}" width="${innerWidth * 0.36}" height="${Math.max(1, y(base) - y(base + value))}" fill="${item.color}" class="pull-chart-area"><title>${svgEscape(`${item.label}: ${formatNumber(value)}`)}</title></rect>`;
      }
      const lower = bases.slice();
      const upper = points.map((point, index) => lower[index] + point[item.key]);
      upper.forEach((value, index) => { bases[index] = value; });
      const polygon = [
        ...points.map((point, index) => `${x(point, index)},${y(upper[index])}`),
        ...points.map((point, reverseIndex) => {
          const index = points.length - 1 - reverseIndex;
          return `${x(points[index], index)},${y(lower[index])}`;
        })
      ].join(' ');
      const hits = points.map((point, index) => `<circle cx="${x(point, index)}" cy="${y((lower[index] + upper[index]) / 2)}" r="8" fill="transparent" class="pull-chart-hit"><title>${svgEscape(`${formatDate(point.recordedAt)} — ${item.label}: ${formatNumber(point[item.key])}`)}</title></circle>`).join('');
      return `<polygon points="${polygon}" fill="${item.color}" class="pull-chart-area"></polygon>${hits}`;
    }).join('');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', String(height));
    svg.setAttribute('aria-label', labels.walletTitle);
    svg.innerHTML = `<title>${svgEscape(labels.walletTitle)}</title>${axes}${areas}`;
  };

  const renderSummary = (element, reconciliation, stats, labels, locale) => {
    const formatNumber = numberFormatter(locale).format;
    const signed = value => `${value > 0 ? '+' : ''}${formatNumber(value)}`;
    const signedTerm = value => `${value >= 0 ? '+' : '−'}${formatNumber(Math.abs(value))}`;
    const cards = [
      [labels.earnedTotal, signed(stats.earned)],
      [labels.spentTotal, formatNumber(stats.spent)],
      [labels.walletChange, signed(stats.walletChange)],
      [labels.purchasedTotal, formatNumber(stats.purchased)],
      [labels.adjustmentTotal, signed(stats.adjustment)],
      [labels.dailyAverage, stats.dailyAverage === null ? '—' : signed(stats.dailyAverage)]
    ];
    element.innerHTML = cards.map(([label, value]) => `<div class="pull-charts-stat"><span class="text-small text-muted">${svgEscape(label)}</span><strong>${svgEscape(value)}</strong></div>`).join('');
    reconciliation.textContent = (stats.openingBalance ? labels.reconciliationWithOpening : labels.reconciliation)
      .replace('{closing}', formatNumber(stats.closingBalance))
      .replace('{opening}', formatNumber(stats.openingBalance))
      .replace('{earned}', formatNumber(stats.earned))
      .replace('{spent}', formatNumber(stats.spent))
      .replace('{purchased}', formatNumber(stats.purchased))
      .replace('{adjustment}', signedTerm(stats.adjustment));
  };

  const renderDetails = (element, points, labels, locale) => {
    const formatNumber = numberFormatter(locale).format;
    const formatDateTime = dateFormatter(locale, true).format;
    const signed = value => `${value > 0 ? '+' : ''}${formatNumber(value)}`;
    element.innerHTML = points.slice(1).reverse().map(point => `<tr>
      <td>${svgEscape(formatDateTime(point.recordedAt))}</td>
      <td class="text-end">${svgEscape(formatNumber(point.days))}</td>
      <td class="text-end chart-earned-value">${svgEscape(signed(point.earned))}</td>
      <td class="text-end">${svgEscape(formatNumber(point.spent))}</td>
      <td class="text-end">${svgEscape(formatNumber(point.purchased))}</td>
      <td class="text-end">${svgEscape(signed(point.adjustment))}</td>
      <td class="text-end">${svgEscape(formatNumber(point.balance))}</td>
    </tr>`).join('') || `<tr><td colspan="7" class="text-muted">${svgEscape(labels.noIntervals)}</td></tr>`;
  };

  const render = ({ points: sourcePoints, labels, locale, elements }) => {
    let cumulativeEarned = 0;
    let cumulativeSpent = 0;
    const points = sourcePoints.map(point => {
      cumulativeEarned += finite(point.earned);
      cumulativeSpent += finite(point.spent);
      return { ...point, cumulativeEarned, cumulativeSpent };
    });
    const first = points[0];
    const latest = points.at(-1);
    const elapsedDays = points.length > 1 ? (latest.recordedAt - first.recordedAt) / 86400000 : 0;
    const stats = {
      earned: sum(points.map(point => point.earned)),
      spent: sum(points.map(point => point.spent)),
      purchased: sum(points.map(point => point.purchased)),
      adjustment: sum(points.map(point => point.adjustment)),
      walletChange: points.length > 1 ? latest.balance - first.balance : 0,
      dailyAverage: elapsedDays > 0 ? sum(points.slice(1).map(point => point.earned)) / elapsedDays : null,
      openingBalance: first?.periodOpeningBalance ?? 0,
      closingBalance: latest?.balance ?? 0
    };
    elements.empty.hidden = points.length >= 2;
    elements.content.hidden = points.length === 0;
    elements.coverage.textContent = points.length
      ? labels.coverage.replace('{count}', String(points.length)).replace('{days}', numberFormatter(locale).format(elapsedDays)).replace('{start}', dateFormatter(locale, true).format(first.recordedAt)).replace('{end}', dateFormatter(locale, true).format(latest.recordedAt))
      : labels.noCoverage;
    if (!points.length) return;
    renderSummary(elements.summary, elements.reconciliation, stats, labels, locale);
    renderCumulativeChart(elements.cumulative, points, labels, locale);
    renderDailyChart(elements.intervals, points, labels, locale, elements.intervalNote);
    renderWalletChart(elements.wallet, points, labels, locale);
    renderDetails(elements.details, points, labels, locale);
  };

  window.ZZZPullCharts = Object.freeze({ render });
})();
