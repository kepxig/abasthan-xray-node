const { execSync, spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const PORT = process.env.PORT || 8080;
const UUID = process.env.UUID;
if (!UUID) { console.error('UUID env var is required'); process.exit(1); }
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'abasthan-xray-node' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(get(res.headers.location));
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}
(async () => {
  if (!fs.existsSync('xray')) {
    const latest = JSON.parse(await get('https://api.github.com/repos/XTLS/Xray-core/releases/latest'));
    const tag = latest.tag_name;
    const url = 'https://github.com/XTLS/Xray-core/releases/download/' + tag + '/Xray-linux-64.zip';
    console.log('Downloading', url);
    execSync('curl -L -o xray.zip "' + url + '"', { stdio: 'inherit' });
    try { execSync('unzip -o xray.zip xray', { stdio: 'inherit' }); }
    catch (e) { execSync('python3 -c "import zipfile; zipfile.ZipFile(\'xray.zip\').extract(\'xray\')"', { stdio: 'inherit' }); }
    execSync('chmod +x xray');
  }
  const config = {
    log: { loglevel: 'warning' },
    inbounds: [{ port: Number(PORT), protocol: 'vless', settings: { clients: [{ id: UUID }], decryption: 'none' }, streamSettings: { network: 'ws', wsSettings: { path: '/ray' } } }],
    outbounds: [{ protocol: 'freedom', tag: 'direct' }]
  };
  fs.writeFileSync('config.json', JSON.stringify(config));
  console.log('Starting xray on port', PORT);
  const xray = spawn('./xray', ['run', '-c', 'config.json'], { stdio: 'inherit' });
  xray.on('exit', (code) => { console.log('xray exited', code); process.exit(code || 1); });
})();
