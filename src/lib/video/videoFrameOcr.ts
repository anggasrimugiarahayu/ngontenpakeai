/**
 * Video Frame OCR Utility (Client-Side)
 * Samples keyframes from an HTML5 video and extracts on-screen text/subtitles/captions
 * using Tesseract.js locally in the browser with 0 AI tokens.
 */
import Tesseract from 'tesseract.js';

export async function extractTextFromVideoFrames(videoFile: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return resolve('');
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    const cleanup = () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.warn('Video cleanup error:', err);
      }
    };

    // Timeout safety: if video fails to load in 10s, resolve empty
    const safetyTimeout = setTimeout(() => {
      cleanup();
      resolve('');
    }, 12000);

    video.onerror = () => {
      clearTimeout(safetyTimeout);
      cleanup();
      resolve('');
    };

    video.onloadedmetadata = async () => {
      clearTimeout(safetyTimeout);
      try {
        const duration = video.duration || 10;
        // Sample up to 4 keyframes across the video duration (e.g. at 20%, 45%, 70%, 90%)
        const percentages = [0.20, 0.45, 0.70, 0.90];
        const sampleTimes = percentages.map((p) => Math.max(0.5, Math.min(duration - 0.5, p * duration)));

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.min(720, video.videoWidth || 640);
        canvas.height = Math.min(1280, video.videoHeight || 360);

        const detectedParagraphs: string[] = [];

        for (const targetTime of sampleTimes) {
          video.currentTime = targetTime;
          await new Promise<void>((r) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              r();
            };
            video.addEventListener('seeked', onSeeked);
            // Fallback in case seeked doesn't fire
            setTimeout(r, 600);
          });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const res = await Tesseract.recognize(canvas, 'ind+eng');
              const text = res?.data?.text?.trim() || '';
              // Keep text if substantive and not a duplicate
              if (text.length > 5 && !detectedParagraphs.some((p) => p.includes(text) || text.includes(p))) {
                detectedParagraphs.push(text);
              }
            } catch (ocrErr) {
              console.warn('Tesseract video frame error at time', targetTime, ocrErr);
            }
          }
        }

        cleanup();
        resolve(detectedParagraphs.join('\n\n'));
      } catch (err) {
        console.warn('extractTextFromVideoFrames error:', err);
        cleanup();
        resolve('');
      }
    };
  });
}
