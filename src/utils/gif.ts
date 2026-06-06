import GIF from 'gif.js';
import type { Snap } from './db';

export const generateGif = (snaps: Snap[], options: { width: number, height: number, delay: number, quality: number }): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: options.quality,
      width: options.width,
      height: options.height,
      workerScript: '/gif.worker.js'
    });

    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d')!;

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = url;
      });
    };

    const process = async () => {
      try {
        for (const snap of snaps) {
          const img = await loadImage(snap.dataUrl);
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, options.width, options.height);
          
          // Draw caption if exists
          if (snap.caption) {
            ctx.font = `${Math.floor(options.height * 0.08)}px sans-serif`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            const x = options.width / 2;
            const y = options.height - (options.height * 0.1);
            ctx.strokeText(snap.caption, x, y);
            ctx.fillText(snap.caption, x, y);
          }
          
          gif.addFrame(ctx, { delay: options.delay, copy: true });
        }

        gif.on('finished', (blob: Blob) => {
          console.log('GIF rendering finished');
          resolve(blob);
        });

        console.log('Starting GIF render...');
        gif.render();
      } catch (err) {
        reject(err);
      }
    };

    process();
  });
};
