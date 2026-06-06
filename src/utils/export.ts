import type { Snap } from './db';

export const generateHtmlExport = (title: string, snaps: Snap[]): string => {
  const snapsHtml = snaps.map(snap => `
    <div class="snap">
      <img src="${snap.dataUrl}" alt="Snap at ${snap.timestamp.toFixed(2)}s">
      <div class="caption">${snap.caption || ''}</div>
      <div class="timestamp">Timestamp: ${snap.timestamp.toFixed(2)}s</div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; background: #f4f4f4; color: #333; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #007aff; }
        .snap { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .snap img { width: 100%; border-radius: 8px; }
        .caption { font-size: 1.2em; font-weight: bold; margin-top: 10px; }
        .timestamp { font-size: 0.9em; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        ${snapsHtml}
    </div>
</body>
</html>
  `;
};

export const generateMarkdownExport = (title: string, snaps: Snap[]): string => {
  const snapsMd = snaps.map(snap => `
### ${snap.caption || `Snap at ${snap.timestamp.toFixed(2)}s`}
![Snap at ${snap.timestamp.toFixed(2)}s](${snap.dataUrl})
*Timestamp: ${snap.timestamp.toFixed(2)}s*
---
  `).join('\n');

  return `# ${title}\n\n${snapsMd}`;
};
