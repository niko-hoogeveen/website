"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface Sample {
  t: number;
  p: number[];
}

interface ClipData {
  id: string;
  label: string;
  truth: string;
  predicted: string;
  correct: boolean;
  video: string;
  fps: number;
  duration: number;
  frameCount: number;
  sampleStride: number;
  classes: string[];
  samples: Sample[];
}

const CLIPS = [
  { id: "squat", label: "Squat" },
  { id: "benchpress", label: "Bench press" },
  { id: "benchpress-2", label: "Bench press (close)" },
  { id: "squat-short", label: "Squat (2s clip)" },
];

const CLASS_LABELS: Record<string, string> = {
  benchpress: "Bench press",
  deadlift: "Deadlift",
  squat: "Squat",
};

const CLASS_COLORS: Record<string, string> = {
  benchpress: "bg-amber-500",
  deadlift: "bg-violet-500",
  squat: "bg-blue-500",
};

// MET values lifted from the original project's lookup table.
const MET_TABLE: Record<string, [number, number, number]> = {
  deadlift: [4, 7, 9],
  squat: [3.5, 6, 8],
  benchpress: [3, 5, 7],
};

const INTENSITIES = ["Light", "Moderate", "Vigorous"];

// Example profile used to drive the calorie figure, in the imperial units the
// original Harris-Benedict implementation expected.
const PROFILE = { weightLb: 180, heightIn: 70, age: 25 };
const BMR =
  66 + 6.23 * PROFILE.weightLb + 12.7 * PROFILE.heightIn - 6.8 * PROFILE.age;

// The original inference loop averaged over a 128-frame deque.
const SMOOTHING_FRAMES = 128;

function lastIndexAtOrBefore(samples: Sample[], time: number) {
  let lo = 0;
  let hi = samples.length - 1;
  let found = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= time) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

export default function CalorieDemo() {
  const [clipId, setClipId] = useState(CLIPS[0].id);
  const [data, setData] = useState<ClipData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [smoothed, setSmoothed] = useState(true);
  const [intensity, setIntensity] = useState(1);
  const [probs, setProbs] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    setProbs([]);
    setElapsed(0);

    fetch(`/projects/calorie-prediction/demo/${clipId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ClipData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the prediction data.");
      });

    return () => {
      cancelled = true;
    };
  }, [clipId]);

  const sampleAt = useCallback(
    (clip: ClipData, time: number) => {
      const index = lastIndexAtOrBefore(clip.samples, time);
      if (!smoothed) return clip.samples[index].p;

      const window = Math.max(
        1,
        Math.round(SMOOTHING_FRAMES / clip.sampleStride)
      );
      const start = Math.max(0, index - window + 1);
      const slice = clip.samples.slice(start, index + 1);
      return clip.classes.map(
        (_, i) => slice.reduce((sum, s) => sum + s.p[i], 0) / slice.length
      );
    },
    [smoothed]
  );

  // Drive the readout from the video clock so scrubbing stays in sync.
  useEffect(() => {
    if (!data) return;

    const tick = () => {
      const video = videoRef.current;
      if (video) {
        const time = video.currentTime;
        setElapsed(time);
        setProbs(sampleAt(data, time));
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [data, sampleAt]);

  const classes = data?.classes ?? [];
  const topIndex = probs.length
    ? probs.indexOf(Math.max(...probs))
    : -1;
  const topClass = topIndex >= 0 ? classes[topIndex] : null;

  // Dominant class so far, matching how the original app picked one exercise
  // for the whole clip before computing calories.
  let dominant: string | null = null;
  if (data && elapsed > 0) {
    const upTo = lastIndexAtOrBefore(data.samples, elapsed);
    const totals = classes.map((_, i) =>
      data.samples.slice(0, upTo + 1).reduce((sum, s) => sum + s.p[i], 0)
    );
    dominant = classes[totals.indexOf(Math.max(...totals))];
  }

  const met = dominant ? MET_TABLE[dominant][intensity] : 0;
  const calories = (BMR * met) / 24 / 3600 * elapsed;

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h2 className="text-2xl font-bold text-white">Try It</h2>
        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-medium">
          Pre-computed inference
        </span>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        The model is a 99 MB TensorFlow network and this site is a static
        export, so there is no server running inference here. Instead the
        original 2022 model was re-run offline over these clips and every
        frame&apos;s output was saved. Pressing play replays those real
        predictions in sync with the video &mdash; the numbers below are the
        model&apos;s actual output, not a simulation.
      </p>

      {/* Clip selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CLIPS.map((clip) => (
          <button
            key={clip.id}
            onClick={() => setClipId(clip.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              clip.id === clipId
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-800/80 border-gray-700/50 text-gray-300 hover:border-gray-600"
            }`}
          >
            {clip.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      {!data && !error && (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          Loading predictions&hellip;
        </div>
      )}

      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Video */}
          <div>
            <video
              ref={videoRef}
              key={data.id}
              src={data.video}
              controls
              muted
              playsInline
              preload="metadata"
              className="w-full max-h-[420px] rounded-lg border border-gray-700/50 bg-black"
            />
            <p className="text-xs text-gray-500 mt-2">
              {data.frameCount} frames at {Math.round(data.fps)} fps &middot;{" "}
              {data.samples.length} sampled predictions
            </p>
          </div>

          {/* Readout */}
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Model confidence
                </h3>
                <span className="text-xs text-gray-500 tabular-nums">
                  t = {elapsed.toFixed(2)}s
                </span>
              </div>

              <div className="space-y-3">
                {classes.map((cls, i) => {
                  const value = probs[i] ?? 0;
                  return (
                    <div key={cls}>
                      <div className="flex justify-between text-sm mb-1">
                        <span
                          className={
                            cls === topClass
                              ? "text-white font-semibold"
                              : "text-gray-400"
                          }
                        >
                          {CLASS_LABELS[cls] ?? cls}
                        </span>
                        <span className="text-gray-400 tabular-nums">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-100 ${
                            CLASS_COLORS[cls] ?? "bg-gray-500"
                          }`}
                          style={{ width: `${Math.max(0, value * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smoothing toggle */}
            <div className="flex items-center justify-between gap-3 bg-gray-800/40 border border-gray-700/50 rounded-lg p-3">
              <div>
                <p className="text-sm text-gray-200 font-medium">
                  Rolling average
                </p>
                <p className="text-xs text-gray-500">
                  Averages the last {SMOOTHING_FRAMES} frames, as the original
                  deque did. Turn it off to see raw per-frame output.
                </p>
              </div>
              <button
                onClick={() => setSmoothed((s) => !s)}
                role="switch"
                aria-checked={smoothed}
                aria-label="Toggle rolling average smoothing"
                className={`shrink-0 w-12 h-6 rounded-full transition-colors relative ${
                  smoothed ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full transition-transform ${
                    smoothed ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Calorie estimate */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Calorie estimate
                </h3>
                <span className="text-2xl font-bold text-white tabular-nums">
                  {calories.toFixed(2)}
                  <span className="text-sm text-gray-400 font-normal ml-1">
                    kcal
                  </span>
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                {INTENSITIES.map((name, i) => (
                  <button
                    key={name}
                    onClick={() => setIntensity(i)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                      i === intensity
                        ? "bg-gray-700 border-gray-500 text-white"
                        : "bg-gray-900/50 border-gray-700/50 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                BMR {BMR.toFixed(0)} &times; MET {met || "\u2013"} &divide; 24
                &times; {(elapsed / 3600).toFixed(5)} h, for an example profile
                of a {PROFILE.age}-year-old male, {PROFILE.weightLb} lb,{" "}
                {Math.floor(PROFILE.heightIn / 12)}&prime;
                {PROFILE.heightIn % 12}&Prime;.
              </p>
            </div>

            {/* Verdict */}
            <div
              className={`rounded-lg p-4 border ${
                data.correct
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <p className="text-sm text-gray-200">
                <span className="font-semibold">
                  {data.correct ? "Correct" : "Misclassified"}
                </span>{" "}
                &mdash; ground truth{" "}
                <span className="font-medium text-white">
                  {CLASS_LABELS[data.truth] ?? data.truth}
                </span>
                , model predicted{" "}
                <span className="font-medium text-white">
                  {CLASS_LABELS[data.predicted] ?? data.predicted}
                </span>{" "}
                over the full clip.
              </p>
              {!data.correct && (
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  This is a bodyweight squat filmed in a hallway, with no
                  barbell and no gym anywhere in frame, and it opens on about a
                  second of standing still. Every squat in the 150-image
                  training set had a loaded barbell in shot, so the model has
                  likely learned the equipment and setting as much as the
                  movement itself. At under two seconds the rolling average
                  also never gets enough frames to recover from the opening
                  mistake.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
