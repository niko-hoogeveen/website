from flask import Response
from flask import Flask
from flask import render_template
import threading

# import the necessary packages
from keras.models import load_model
from collections import deque
import numpy as np
import argparse
import pickle
import cv2

outputFrame = None
lock = threading.Lock()
# initialize a flask object
app = Flask(__name__, template_folder="", static_folder="")

global t, loop

@app.route("/")
def index():
    # return the rendered template
    return render_template("index.html")


@app.route("/generic.html")
def generic():
    # return the rendered template
    return render_template("generic.html")


@app.route("/stream.html")
def stream():
    # return the rendered template
    global t, loop
    loop = True
    t = threading.Thread(target=predict)
    #t.daemon = True
    t.start()
    return render_template("stream.html")


@app.route("/endstream.html")
def endstream():
    global t, loop
    loop = False
    t.join()
    # return the rendered template
    return render_template("generic.html")


@app.route("/profile.html")
def profile():
    # return the rendered template
    return render_template("profile.html")


@app.route("/elements.html")
def elements():
    # return the rendered template
    return render_template("elements.html")


def generate():
    # grab global references to the output frame and lock variables
    global outputFrame, lock
    # loop over frames from the output stream
    while True:
        # wait until the lock is acquired
        with lock:
            # check if the output frame is available, otherwise skip
            # the iteration of the loop
            if outputFrame is None:
                continue
            # encode the frame in JPEG format
            (flag, encodedImage) = cv2.imencode(".jpg", outputFrame)
            # ensure the frame was successfully encoded
            if not flag:
                continue
        # yield the output frame in the byte format
        yield b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n'


@app.route("/video_feed")
def video_feed():
    # return the response generated along with the specific media
    # type (mime type)
    return Response(generate(), mimetype = "multipart/x-mixed-replace; boundary=frame")


# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-m", "--model", default="model.model", help="path to trained serialized model")
ap.add_argument("-l", "--label-bin", default="binarizer.pickle", help="path to  label binarizer")
ap.add_argument("-i", "--input", default="WorkoutFootageTest.mp4", help="path to our input video")
# [for above line] change default to the filename of the input video/image
ap.add_argument("-o", "--output", default="output.avi", help="path to our output video")
ap.add_argument("-s", "--size", type=int, default=1, help="size of queue for averaging")
# [for above line] change default to 1 if using a still image as input, use 128 if video (may need to decrease if very short video or if multiple workouts per video)
# args = vars(ap.parse_args())


# construct the argument parser and parse command line arguments
# ap = argparse.ArgumentParser()
ap.add_argument("-t", "--ip", default="localhost", type=str, help="ip address of the device")
ap.add_argument("-q", "--port", default="8000", type=int, help="ephemeral port number of the server (1024 to 65535)")
# ap.add_argument("-f", "--frame-count", type=int, default=32, help="# of frames used to construct the background model")
args = vars(ap.parse_args())
# start a thread that will perform motion detection


# load the trained model and label binarizer from disk
print("[INFO] loading model and label binarizer...")
model = load_model(args["model"])
lb = pickle.loads(open(args["label_bin"], "rb").read())
# initialize the image mean for mean subtraction along with the
# predictions queue
mean = np.array([123.68, 116.779, 103.939][::1], dtype="float32")
Q = deque(maxlen=args["size"])


# vs = cv2.VideoCapture(args["input"])
vs = cv2.VideoCapture(0)


def predict():
    # initialize the video stream, pointer to output video file, and
    # frame dimensions

    global vs, outputFrame, lock, loop

    writer = None
    (W, H) = (None, None)
    # loop over frames from the video file stream
    while True:

        if not loop:
            break
        # read the next frame from the file
        (grabbed, frame) = vs.read()
        # if the frame was not grabbed, then we have reached the end
        # of the stream
        if not grabbed:
            break
        # if the frame dimensions are empty, grab them
        if W is None or H is None:
            (H, W) = frame.shape[:2]

        # clone the output frame, then convert it from BGR to RGB
        # ordering, resize the frame to a fixed 224x224, and then
        # perform mean subtraction
        output = frame.copy()
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = cv2.resize(frame, (224, 224)).astype("float32")
        frame -= mean

        # make predictions on the frame and then update the predictions
        # queue
        preds = model.predict(np.expand_dims(frame, axis=0))[0]
        Q.append(preds)
        # perform prediction averaging over the current history of
        # previous predictions
        results = np.array(Q).mean(axis=0)
        i = np.argmax(results)
        label = lb.classes_[i]


        # draw the activity on the output frame
        text = "{}".format(label)
        cv2.putText(output, text, (50, 75), cv2.FONT_HERSHEY_SIMPLEX, 1.25, (255, 0, 0), 3)

        key = cv2.waitKey(1) & 0xFF
        # if the `q` key was pressed, break from the loop
        if key == ord("q"):
            # release the file pointers
            print("[INFO] cleaning up...")
            vs.release()
            break

        with lock:
            outputFrame = output.copy()



# start the flask app
app.run(host=args["ip"], port=args["port"], debug=True, threaded=True, use_reloader=False)


