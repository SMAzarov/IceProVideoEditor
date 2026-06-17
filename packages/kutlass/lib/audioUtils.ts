"use client";

/**
 * Convert an audio blob (any format supported by the browser) to a WAV file
 * (16-bit PCM, 44100 Hz, mono). WAV is the simplest format that FFmpeg WASM
 * can reliably read without needing additional codecs.
 */
export async function blobToWav(blob: Blob): Promise<Blob> {
  // Decode the audio blob to raw PCM samples via Web Audio API
  const audioCtx = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Get the raw PCM data (float32, [-1, 1])
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Mix down to mono by averaging all channels
  const pcmData = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    let sample = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      sample += audioBuffer.getChannelData(ch)[i];
    }
    pcmData[i] = sample / numChannels;
  }

  audioCtx.close();

  // Encode as 16-bit PCM WAV
  const numSamples = pcmData.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);  // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, numSamples * 2, true);

  // Write PCM samples (float32 → int16)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Pad a WAV buffer with silence at the beginning.
 * @param wavBuf - The raw WAV file bytes (must be 16-bit PCM mono)
 * @param padSeconds - How many seconds of silence to prepend
 * @returns A new WAV buffer with silence prepended
 */
export async function padWavWithSilence(wavBuf: ArrayBuffer, padSeconds: number): Promise<ArrayBuffer> {
  if (padSeconds <= 0) return wavBuf;

  // Parse the WAV header to get sample rate and data size
  const view = new DataView(wavBuf);
  const sampleRate = view.getUint32(24, true);
  const dataSize = view.getUint32(40, true);
  const numSamples = dataSize / 2; // 16-bit = 2 bytes per sample

  // Calculate silence padding
  const padSamples = Math.round(sampleRate * padSeconds);
  const padBytes = padSamples * 2;

  // Create new buffer: header (44) + padding + original data
  const newDataSize = dataSize + padBytes;
  const newBuf = new ArrayBuffer(44 + newDataSize);
  const newView = new DataView(newBuf);

  // Copy header
  for (let i = 0; i < 44; i++) {
    newView.setUint8(i, view.getUint8(i));
  }

  // Update sizes in header
  newView.setUint32(4, 36 + newDataSize, true); // RIFF size
  newView.setUint32(40, newDataSize, true);      // data chunk size

  // Copy original PCM data after the padding (padding is already zero-initialized)
  const src = new Uint8Array(wavBuf, 44, dataSize);
  const dst = new Uint8Array(newBuf, 44 + padBytes, dataSize);
  dst.set(src);

  return newBuf;
}

/**
 * Trim a WAV buffer to a specific duration (in seconds).
 * If the WAV is shorter than the requested duration, it is returned as-is.
 * @param wavBuf - The raw WAV file bytes (must be 16-bit PCM mono)
 * @param maxDurationSeconds - Maximum duration in seconds
 * @returns A new WAV buffer trimmed to maxDurationSeconds
 */
export function trimWavEnd(wavBuf: ArrayBuffer, maxDurationSeconds: number): ArrayBuffer {
  const view = new DataView(wavBuf);
  const sampleRate = view.getUint32(24, true);
  const dataSize = view.getUint32(40, true);
  const numSamples = dataSize / 2; // 16-bit = 2 bytes per sample
  const duration = numSamples / sampleRate;

  // If the WAV is already shorter than maxDuration, return as-is
  if (duration <= maxDurationSeconds) return wavBuf;

  const trimmedSamples = Math.round(sampleRate * maxDurationSeconds);
  const trimmedDataSize = trimmedSamples * 2;

  // Create new buffer with trimmed data
  const newBuf = new ArrayBuffer(44 + trimmedDataSize);
  const newView = new DataView(newBuf);

  // Copy header
  for (let i = 0; i < 44; i++) {
    newView.setUint8(i, view.getUint8(i));
  }

  // Update sizes
  newView.setUint32(4, 36 + trimmedDataSize, true);
  newView.setUint32(40, trimmedDataSize, true);

  // Copy only the first trimmedSamples of PCM data
  const src = new Uint8Array(wavBuf, 44, trimmedDataSize);
  const dst = new Uint8Array(newBuf, 44, trimmedDataSize);
  dst.set(src);

  return newBuf;
}

/**
 * Merge multiple WAV buffers into a single WAV file.
 * Keeps the header from the first buffer and appends only the PCM data
 * from subsequent buffers. All buffers must be 16-bit PCM mono with the
 * same sample rate.
 */
export function mergeWavBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  if (buffers.length === 0) throw new Error("No WAV buffers to merge");
  if (buffers.length === 1) return buffers[0];

  // Parse first buffer to get header info
  const firstView = new DataView(buffers[0]);
  const sampleRate = firstView.getUint32(24, true);
  const firstDataSize = firstView.getUint32(40, true);

  // Calculate total PCM data size
  let totalDataSize = firstDataSize;
  for (let i = 1; i < buffers.length; i++) {
    const view = new DataView(buffers[i]);
    totalDataSize += view.getUint32(40, true);
  }

  // Create merged buffer
  const mergedBuf = new ArrayBuffer(44 + totalDataSize);
  const mergedView = new DataView(mergedBuf);

  // Copy header from first buffer
  for (let i = 0; i < 44; i++) {
    mergedView.setUint8(i, firstView.getUint8(i));
  }

  // Update sizes
  mergedView.setUint32(4, 36 + totalDataSize, true);
  mergedView.setUint32(40, totalDataSize, true);

  // Copy PCM data from all buffers
  let offset = 44;
  for (const buf of buffers) {
    const view = new DataView(buf);
    const dataSize = view.getUint32(40, true);
    const src = new Uint8Array(buf, 44, dataSize);
    const dst = new Uint8Array(mergedBuf, offset, dataSize);
    dst.set(src);
    offset += dataSize;
  }

  return mergedBuf;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
