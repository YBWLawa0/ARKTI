const html = String.raw

export function onRequestGet() {
  return new Response(html`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ARKTI Admin Stats</title>
  <style>
    body { margin: 0; font-family: Arial, "Microsoft YaHei", sans-serif; color: #2f3a45; background: #f7f9fb; }
    main { max-width: 1120px; margin: 0 auto; padding: 56px 20px; }
    h1 { margin: 0 0 10px; font-size: 42px; }
    p { color: #61707e; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; margin: 28px 0 18px; }
    label { display: grid; gap: 6px; color: #61707e; font-size: 13px; font-weight: 700; }
    select, button { min-height: 42px; border: 1px solid #dce4eb; border-radius: 8px; background: #fff; color: #2f3a45; font-weight: 700; }
    select { min-width: 220px; padding: 0 12px; }
    button { padding: 0 18px; cursor: pointer; }
    .total, .empty, .panel { border: 1px solid #e4ebf1; border-radius: 8px; background: #fff; }
    .total { margin-bottom: 18px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; }
    .total strong { font-size: 34px; }
    .grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr); gap: 18px; }
    .panel { padding: 20px; }
    .panel:first-child { grid-row: span 2; }
    .panel h2 { margin: 0 0 16px; font-size: 22px; }
    .list { display: grid; gap: 14px; }
    .row { display: grid; gap: 7px; }
    .head { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; font-weight: 800; }
    .bar { height: 8px; border-radius: 999px; overflow: hidden; background: #eef3f6; }
    .bar span { display: block; height: 100%; border-radius: inherit; background: #2f996a; }
    .row p { margin: 0; font-size: 12px; color: #7a8793; }
    .empty { padding: 24px; color: #61707e; line-height: 1.7; }
    @media (max-width: 860px) { main { padding: 36px 14px; } .grid { grid-template-columns: 1fr; } .panel:first-child { grid-row: auto; } }
  </style>
</head>
<body>
  <main>
    <h1>ARKTI 全网统计</h1>
    <p>此页面应由 Cloudflare Access 保护，仅管理员可访问。</p>
    <section class="toolbar">
      <label>地区
        <select id="region"><option value="">全部地区</option></select>
      </label>
      <button id="refresh" type="button">刷新</button>
    </section>
    <section class="total"><span>样本数</span><strong id="total">-</strong></section>
    <section id="content" class="empty">正在加载统计数据...</section>
  </main>
  <script>
    const regionSelect = document.getElementById('region');
    const refreshButton = document.getElementById('refresh');
    const totalEl = document.getElementById('total');
    const contentEl = document.getElementById('content');

    function formatRegion(region) {
      return region === 'XX' ? '未知地区' : region;
    }

    function rowWidth(row) {
      return Math.max(2, Math.min(100, row.percentage)) + '%';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);
    }

    function renderPanel(title, rows) {
      return '<article class="panel"><h2>' + title + '</h2><div class="list">' + rows.map((row) => (
        '<div class="row"><div class="head"><span>' + escapeHtml(row.label) + '</span><strong>' + row.percentage.toFixed(1) + '%</strong></div>' +
        '<div class="bar"><span style="width:' + rowWidth(row) + '"></span></div><p>' + row.count + ' 次</p></div>'
      )).join('') + '</div></article>';
    }

    async function loadStats() {
      refreshButton.disabled = true;
      const region = regionSelect.value;
      const url = region ? '/api/admin/stats?region=' + encodeURIComponent(region) : '/api/admin/stats';
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const summary = await response.json();
        totalEl.textContent = summary.total;
        const currentRegion = regionSelect.value;
        regionSelect.innerHTML = '<option value="">全部地区</option>' + summary.regions.map((item) => (
          '<option value="' + escapeHtml(item.region) + '">' + escapeHtml(formatRegion(item.region)) + ' · ' + item.count + '</option>'
        )).join('');
        regionSelect.value = currentRegion;
        if (!summary.total) {
          contentEl.className = 'empty';
          contentEl.textContent = '还没有统计样本。完成一次测试后，这里会开始出现聚合数据。';
          return;
        }
        contentEl.className = 'grid';
        contentEl.innerHTML = renderPanel('角色占比', summary.characters) + renderPanel('MBTI 占比', summary.mbti) + renderPanel('原型占比', summary.archetypes);
      } catch (error) {
        totalEl.textContent = '-';
        contentEl.className = 'empty';
        contentEl.textContent = '统计数据暂时无法加载。请确认 D1 绑定已配置，并且 Cloudflare Access 允许当前账号访问。';
      } finally {
        refreshButton.disabled = false;
      }
    }

    refreshButton.addEventListener('click', loadStats);
    regionSelect.addEventListener('change', loadStats);
    loadStats();
  </script>
</body>
</html>`, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
