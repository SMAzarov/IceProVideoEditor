import { describe, it, expect } from "vitest";
import {
  formatTime,
  timeToPixels,
  pixelsToTime,
  snapToFrame,
  timeToFrame,
  frameToTime,
  getRulerTickInterval,
} from "@/lib/timeline/timeUtils";

describe("formatTime", () => {
  it("formats zero", () => {
    expect(formatTime(0)).toBe("00:00.00");
  });

  it("formats seconds with centiseconds", () => {
    expect(formatTime(5.5)).toBe("00:05.50");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(65)).toBe("01:05.00");
  });

  it("formats hours", () => {
    expect(formatTime(3661)).toBe("1:01:01");
  });
});

describe("timeToPixels / pixelsToTime", () => {
  it("converts time to pixels", () => {
    expect(timeToPixels(5, 80)).toBe(400);
  });

  it("converts pixels to time", () => {
    expect(pixelsToTime(400, 80)).toBe(5);
  });

  it("round-trips correctly", () => {
    const time = 3.7;
    const zoom = 120;
    expect(pixelsToTime(timeToPixels(time, zoom), zoom)).toBeCloseTo(time);
  });
});

describe("snapToFrame", () => {
  it("snaps to nearest frame at 30fps", () => {
    expect(snapToFrame(1.017, 30)).toBeCloseTo(1 / 30 * 31);
  });

  it("snaps exact frame times", () => {
    expect(snapToFrame(1.0, 24)).toBe(1.0);
  });
});

describe("timeToFrame / frameToTime", () => {
  it("converts time to frame number", () => {
    expect(timeToFrame(1, 30)).toBe(30);
  });

  it("converts frame to time", () => {
    expect(frameToTime(60, 30)).toBe(2);
  });

  it("round-trips correctly", () => {
    expect(frameToTime(timeToFrame(2.5, 24), 24)).toBeCloseTo(2.5, 1);
  });
});

describe("getRulerTickInterval", () => {
  it("returns fine intervals at high zoom", () => {
    expect(getRulerTickInterval(200)).toEqual({ major: 1, minor: 0.5 });
  });

  it("returns coarse intervals at low zoom", () => {
    expect(getRulerTickInterval(10)).toEqual({ major: 60, minor: 30 });
  });

  it("returns medium intervals at mid zoom", () => {
    expect(getRulerTickInterval(80)).toEqual({ major: 5, minor: 1 });
  });

  it("returns intervals for zoom >= 100", () => {
    expect(getRulerTickInterval(100)).toEqual({ major: 2, minor: 1 });
  });

  it("returns intervals for zoom >= 30", () => {
    expect(getRulerTickInterval(30)).toEqual({ major: 10, minor: 5 });
  });

  it("returns intervals for zoom >= 15", () => {
    expect(getRulerTickInterval(15)).toEqual({ major: 30, minor: 10 });
  });
});
