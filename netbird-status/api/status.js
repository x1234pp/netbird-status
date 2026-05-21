export default async function handler(req, res) {
  const { peer } = req.query;

  if (!peer) {
    return res.status(400).json({ error: '請提供名稱，例如 /eddie' });
  }

  const token = process.env.NETBIRD_TOKEN;
  const mgmt = process.env.NETBIRD_URL || 'https://netbird.asgame.net';

  try {
    const response = await fetch(`${mgmt}/api/peers`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!response.ok) {
      return res.status(500).send(renderPage(peer, null, 'API 連線失敗'));
    }

    const peers = await response.json();
    const found = peers.find(
      (p) => p.name.toLowerCase() === peer.toLowerCase()
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(renderPage(peer, found, null));
  } catch (e) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(renderPage(peer, null, '伺服器錯誤'));
  }
}

function renderPage(name, peer, error) {
  const online = peer?.connected;
  const statusText = error ? '查詢失敗' : peer ? (online ? '在線' : '離線') : '找不到此用戶';
  const statusColor = error || !peer ? '#888' : online ? '#22c55e' : '#ef4444';
  const dot = error || !peer ? '⚪' : online ? '🟢' : '🔴';

  const ip = peer?.ip ?? '—';
  const os = peer?.os ?? '—';
  const lastSeen = peer?.last_seen
    ? new Date(peer.last_seen).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    : '—';
  const publicIP = peer?.dns_label ?? '—';

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} 連線狀態</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #1e293b;
      border-radius: 16px;
      padding: 40px 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      text-align: center;
    }
    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 20px;
    }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .status {
      font-size: 18px;
      font-weight: 600;
      color: ${statusColor};
      margin-bottom: 28px;
    }
    .info-grid {
      display: grid;
      gap: 12px;
      text-align: left;
    }
    .info-row {
      background: #0f172a;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .info-label { color: #94a3b8; font-size: 13px; }
    .info-value { font-size: 14px; font-weight: 500; }
    .updated {
      margin-top: 20px;
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="avatar">👤</div>
    <h1>${name}</h1>
    <div class="status">${dot} ${statusText}</div>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">NetBird IP</span>
        <span class="info-value">${ip}</span>
      </div>
      <div class="info-row">
        <span class="info-label">作業系統</span>
        <span class="info-value">${os}</span>
      </div>
      <div class="info-row">
        <span class="info-label">最後上線</span>
        <span class="info-value">${lastSeen}</span>
      </div>
    </div>
    <div class="updated">查詢時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</div>
  </div>
</body>
</html>`;
}
