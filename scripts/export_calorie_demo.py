"""
Offline inference for the calorie-prediction demo.

Runs the 2022 capstone CNN over the sample workout videos and writes per-frame
class probabilities to JSON so the website can replay them without a backend.

Preprocessing mirrors predict.py from the original project exactly: BGR->RGB,
resize to 224x224, ImageNet mean subtraction.

Usage (needs tensorflow + tf-keras + opencv):
    python scripts/export_calorie_demo.py --repo /path/to/498-Capstone-Project
"""

import argparse
import json
import os
import pickle

import cv2
import numpy as np
import tf_keras

# ImageNet channel means in RGB order, matching training and original inference.
MEAN = np.array([123.68, 116.779, 103.939], dtype="float32")

# Probabilities are stored at roughly this rate rather than per frame, which
# keeps the JSON small without visibly changing the playback.
TARGET_SAMPLE_HZ = 10

CLIPS = [
    ("squat", "Squat", "squat", "inputCarrSquat.mp4"),
    ("benchpress", "Bench press", "benchpress", "inputCarrBench.mp4"),
    ("benchpress-2", "Bench press (close range)", "benchpress", "inputCarrBench2.mp4"),
    ("squat-short", "Squat (2 second clip)", "squat", "inputRyanSquat.mp4"),
]


def load_classes(repo):
    with open(os.path.join(repo, "binarizer.pickle"), "rb") as handle:
        return [str(c) for c in pickle.loads(handle.read()).classes_]


def run_clip(model, classes, video_path):
    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        raise SystemExit(f"could not open {video_path}")

    fps = capture.get(cv2.CAP_PROP_FPS) or 30.0
    stride = max(1, round(fps / TARGET_SAMPLE_HZ))

    samples = []
    index = 0
    while True:
        grabbed, frame = capture.read()
        if not grabbed:
            break
        if index % stride == 0:
            prepared = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            prepared = cv2.resize(prepared, (224, 224)).astype("float32")
            prepared -= MEAN
            preds = model.predict(np.expand_dims(prepared, axis=0), verbose=0)[0]
            samples.append(
                {"t": round(index / fps, 3), "p": [round(float(x), 4) for x in preds]}
            )
        index += 1

    capture.release()
    return {
        "fps": round(fps, 3),
        "duration": round(index / fps, 3),
        "frameCount": index,
        "sampleStride": stride,
        "classes": classes,
        "samples": samples,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True, help="path to 498-Capstone-Project")
    parser.add_argument(
        "--out",
        default="public/projects/calorie-prediction/demo",
        help="output directory for the JSON files",
    )
    args = parser.parse_args()

    classes = load_classes(args.repo)
    model = tf_keras.models.load_model(os.path.join(args.repo, "model.model"))
    os.makedirs(args.out, exist_ok=True)

    index = []
    for clip_id, label, truth, filename in CLIPS:
        print(f"[INFO] {clip_id}: {filename}")
        result = run_clip(model, classes, os.path.join(args.repo, filename))
        result["id"] = clip_id
        result["label"] = label
        result["truth"] = truth
        result["video"] = f"/projects/calorie-prediction/demo/{clip_id}.mp4"

        mean_probs = np.mean([s["p"] for s in result["samples"]], axis=0)
        predicted = classes[int(np.argmax(mean_probs))]
        result["predicted"] = predicted
        result["correct"] = predicted == truth

        with open(os.path.join(args.out, f"{clip_id}.json"), "w") as handle:
            json.dump(result, handle)

        status = "OK " if predicted == truth else "MISS"
        print(
            f"       {status} {len(result['samples'])} samples,"
            f" truth={truth} predicted={predicted}"
        )
        index.append(
            {
                "id": clip_id,
                "label": label,
                "truth": truth,
                "predicted": predicted,
                "correct": predicted == truth,
                "duration": result["duration"],
            }
        )

    with open(os.path.join(args.out, "index.json"), "w") as handle:
        json.dump({"classes": classes, "clips": index}, handle)


if __name__ == "__main__":
    main()
