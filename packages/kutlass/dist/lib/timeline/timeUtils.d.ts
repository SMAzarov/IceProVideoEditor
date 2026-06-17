/** Format seconds as MM:SS or HH:MM:SS */
export declare function formatTime(seconds: number): string;
/** Convert time (seconds) to pixels */
export declare function timeToPixels(time: number, zoom: number): number;
/** Convert pixels to time (seconds) */
export declare function pixelsToTime(pixels: number, zoom: number): number;
/** Snap time to nearest frame boundary */
export declare function snapToFrame(time: number, fps: number): number;
/** Get frame number from time */
export declare function timeToFrame(time: number, fps: number): number;
/** Get time from frame number */
export declare function frameToTime(frame: number, fps: number): number;
/** Calculate ruler tick interval based on zoom */
export declare function getRulerTickInterval(zoom: number): {
    major: number;
    minor: number;
};
//# sourceMappingURL=timeUtils.d.ts.map