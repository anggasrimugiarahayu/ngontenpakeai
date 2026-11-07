/**
 * In-browser Web Audio API helper.
 * Extracts the audio track from a video or audio file (MP4, WebM, MOV, etc.)
 * directly in the browser's memory without sending the video to any server.
 * Downsamples and mixes down to 16kHz mono WAV format (ideal for Whisper AI).
 */

export async function extractAudioFromMedia(mediaFile: File | Blob): Promise<Blob> {
  // Check if browser supports Web Audio API
  if (typeof window === "undefined") {
    throw new Error("Web Audio API hanya dapat dijalankan di browser.");
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Browser Anda tidak mendukung Web Audio API.");
  }

  // 1. Read array buffer from File or Blob
  const arrayBuffer = await mediaFile.arrayBuffer();

  const audioCtx = new AudioContextClass();
  let decodedAudio: AudioBuffer;

  try {
    // Slice buffer to avoid detaching issues in Safari / WebKit
    decodedAudio = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } catch (decodeErr: any) {
    throw new Error("Gagal mendecode audio dari video: " + (decodeErr?.message || "Format audio tidak didukung."));
  } finally {
    if (audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {});
    }
  }

  if (!decodedAudio || decodedAudio.numberOfChannels === 0 || decodedAudio.duration === 0) {
    throw new Error("Media tidak memiliki track audio atau durasi audio 0 detik.");
  }

  // 2. Resample and mixdown to 16kHz mono using OfflineAudioContext (Hardware Accelerated)
  const targetSampleRate = 16000;
  const numChannels = 1; // mono
  const totalSamples = Math.max(1, Math.ceil(decodedAudio.duration * targetSampleRate));

  const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;

  let renderedBuffer: AudioBuffer;

  if (OfflineCtxClass) {
    const offlineCtx = new OfflineCtxClass(numChannels, totalSamples, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = decodedAudio;
    source.connect(offlineCtx.destination);
    source.start(0);
    renderedBuffer = await offlineCtx.startRendering();
  } else {
    renderedBuffer = decodedAudio;
  }

  // 3. Encode renderedBuffer (16kHz mono PCM) to a standard WAV Blob
  return audioBufferToWavBlob(renderedBuffer);
}

/**
 * Converts an AudioBuffer into a 16-bit PCM WAV Blob.
 */
function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // 1 = PCM
  const bitDepth = 16;

  const length = audioBuffer.length;
  const monoData = new Float32Array(length);

  // Mix down all channels into a single mono buffer
  if (numChannels === 1) {
    monoData.set(audioBuffer.getChannelData(0));
  } else {
    for (let c = 0; c < numChannels; c++) {
      const channelData = audioBuffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        monoData[i] += channelData[i] / numChannels;
      }
    }
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = 1 * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt subchunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, 1, true); // NumChannels (1 = mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data subchunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples (16-bit signed integer)
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, monoData[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
