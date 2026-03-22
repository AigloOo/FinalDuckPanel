import path from 'path';
import fs from 'fs';

export function getUploadDir(): string {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const absoluteDir = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir);
  
  if (!fs.existsSync(absoluteDir)) {
    fs.mkdirSync(absoluteDir, { recursive: true });
  }
  
  return absoluteDir;
}
