/**
 * Convert an audio blob (any format supported by the browser) to a WAV file
 * (16-bit PCM, 44100 Hz, mono). WAV is the simplest format that FFmpeg WASM
 * can reliably read without needing additional codecs.
 */
export declare function blobToWav(blob: Blob): Promise<Blob>;
/**
 * Pad a WAV buffer with silence at the beginning.
 * @param wavBuf - The raw WAV file bytes (must be 16-bit PCM mono)
 * @param padSeconds - How many seconds of silence to prepend
 * @returns A new WAV buffer with silence prepended
 */
export declare function padWavWithSilence(wavBuf: ArrayBuffer, padSeconds: number): Promise<ArrayBuffer>;
/**
 * Trim a WAV buffer to a specific duration (in seconds).
 * If the WAV is shorter than the requested duration, it is returned as-is.
 * @param wavBuf - The raw WAV file bytes (must be 16-bit PCM mono)
 * @param maxDurationSeconds - Maximum duration in seconds
 * @returns A new WAV buffer trimmed to maxDurationSeconds
 */
export declare function trimWavEnd(wavBuf: ArrayBuffer, maxDurationSeconds: number): ArrayBuffer;
/**
 * Merge multiple WAV buffers into a single WAV file.
 * Keeps the header from the first buffer and appends only the PCM data
 * from subsequent buffers. All buffers must be 16-bit PCM mono with the
 * same sample rate.
 */
export declare function mergeWavBuffers(buffers: ArrayBuffer[]): ArrayBuffer;
//# sourceMappingURL=audioUtils.d.ts.map