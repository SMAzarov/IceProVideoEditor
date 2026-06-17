export interface DecodedFrame {
  timestamp: number; // microseconds
  frame: VideoFrame;
}

export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
  fps: number;
  codec: string;
}
