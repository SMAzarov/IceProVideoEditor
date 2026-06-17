// Augment TypeScript DOM types for WebCodecs API
// Modern TS (5.x) includes these, but kept here as a safety net

interface VideoDecoderInit {
  output: (frame: VideoFrame) => void;
  error: (error: DOMException) => void;
}

interface VideoDecoderConfig {
  codec: string;
  codedWidth?: number;
  codedHeight?: number;
  description?: BufferSource;
  optimizeForLatency?: boolean;
}

interface EncodedVideoChunkInit {
  type: "key" | "delta";
  timestamp: number;
  duration?: number;
  data: BufferSource;
}
