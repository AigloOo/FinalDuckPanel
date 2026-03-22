const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgresql') || databaseUrl.startsWith('postgres');

const dirsToCreate = isPostgres ? [uploadsDir] : [path.join(process.cwd(), 'data'), uploadsDir];

dirsToCreate.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

app.prepare().then(() => {
  const port = process.env.PORT || 3000;
  
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`🦆 Duc Panel running on port ${port}`);
  });
});
