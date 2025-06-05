const http = require('http');
const fs = require('fs'); // filesystem
const path = require('path');

const PORT = process.env.PORT || 3000; // + ':' ?
const AUDIOS_DIR = path.join(__dirname, 'audios');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PHRASES_FILE = path.join(__dirname, 'phrases.txt');

if (!fs.existsSync(AUDIOS_DIR)) {
  fs.mkdirSync(AUDIOS_DIR, { recursive: true }); // crée /audios
}

function getMimeType(filePath) { // converti extension fs > mime
  const ext = path.extname(filePath).toLowerCase(); // .extname -> nom sur le fs
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.wav': return 'audio/wav';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    default: return 'application/octet-stream';
  }
}

function serveStaticFile(req, res) { // /public/.. js et css
  const filePath = path.join(PUBLIC_DIR, req.url.replace(/^\/public/, '')); // 

  if (!filePath.startsWith(PUBLIC_DIR)) { // securite
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const mime = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  });
}

// dispatcher
const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url.split('?')[0];

  if (method === 'POST' && url.startsWith('/upload')) {
    const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const userId = queryParams.get('userId') || 'userId introuvable';
    const nPhrase = queryParams.get('phrase') || '0';

    const timestamp = Date.now();
    const UID = userId.replace(/[^a-zA-Z0-9_-]/g, '_'); // TODO facto
    const filename = `${UID}_p${nPhrase}.wav`;
    const filepath = path.join(AUDIOS_DIR, filename);

    const writeStream = fs.createWriteStream(filepath);
    req.pipe(writeStream);

    writeStream.on('finish', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Upload successful', filename }));
    });

    writeStream.on('error', (err) => {
      console.error('File write error:', err);
      res.writeHead(500);
      res.end('Server Error');
    });

    return;
  }

  if (method === 'GET' && url === '/phrases') {
    fs.readFile(PHRASES_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Erreur chargement des phrase');
        return;
      }
      const phrases = data.split('\n').filter(Boolean); // enlève la dernière ligne
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(phrases));
    });
    return;
  }

  if (method === 'GET' && url.startsWith('/public/')) {
    serveStaticFile(req, res);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port : ${PORT}`);
});
