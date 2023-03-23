import sqlite3

from flask import Response
from flask import Flask, flash
from flask import render_template, redirect, url_for, request, session
import threading

from werkzeug.utils import secure_filename

# import the necessary packages
from keras.models import load_model
from collections import deque
import numpy as np
import argparse
import pickle
import cv2
import os

from collections import Counter

ALLOWED_EXTENSIONS = {'mp4'}

outputFrame = None
lock = threading.Lock()
# initialize a flask object
app = Flask(__name__, template_folder="", static_folder="")
app.config['SECRET_KEY'] = '12345'

global t, loop

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


def loggedin():
    if 'username' in session:
        return True
    else:
        return False


def logout():
    session.pop('username', None)


@app.route("/Register.html", methods=('GET', 'POST'))
def register():
    if request.method == 'POST':

        username = request.form['username']
        if username == "":
            return render_template("Register.html")
        print(username)
        password = request.form['password']
        print(password)

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("INSERT INTO login (username, password, isprofilecreated) VALUES (?, ?, ?)",
                    (username, password, 0)
                    )

        conn.commit()
        cur.close()
        conn.close()

        return render_template("login.html")
    return render_template("Register.html")


@app.route("/login", methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        conn = get_db_connection()
        cur = conn.cursor()
        username = request.form['username']
        password = request.form['password']
        usernamecheck = cur.execute('SELECT * FROM login WHERE username = ?',
            (username,)
            )
        rows = cur.fetchall()

        if not rows:
            print("username not found")
            return render_template("login.html")

        passwordcheck = cur.execute('SELECT * FROM login WHERE username = ? AND password = ?',
            (username, password,)
            )

        rows = cur.fetchall()

        if not rows:
            print("incorrect password")
            return render_template("login.html")

        session['username'] = request.form['username']
        #return render_template("index.html")

        profilecreatedcheck = cur.execute('SELECT * FROM login WHERE username = ? AND password = ?',
            (username, password,)
            )

        rows = cur.fetchall()

        cur.close()
        conn.close()

        for row in rows:
            print(row[2])
            if row[2] == 0:
                return render_template("profile.html")
            elif row[2] == 1:
                return render_template("index.html")


    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop('username', None)
    return render_template("login.html")


@app.route("/")
def index():
    if not loggedin():
        return render_template("login.html")
    # return the rendered template
    return render_template("index.html")


@app.route("/generic.html", methods=['GET', 'POST'])
def generic():
    if not loggedin():
        return render_template("login.html")

    upload_path = "Uploads/" + session['username'] + "/"
    print(upload_path)
    app.config['UPLOAD_FOLDER'] = upload_path

    if request.method == 'POST':
        intensity = request.form['intensity']
        print(intensity)
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            print(filename)
            #return redirect(url_for('download_file', name=filename))

            conn = get_db_connection()
            cur = conn.cursor()

            cur.execute('SELECT * FROM profiles WHERE username = ?',
                        (session['username'],)
                        )
            rows = cur.fetchall()

            cur.close()
            conn.close()

            for row in rows:
                p_height = row[1]
                p_weight = row[2]
                p_sex = row[3]
                p_age = row[4]

            global t, loop
            loop = True
            full_path = upload_path + filename
            t = threading.Thread(target=predict, kwargs={'input_path': full_path, 'height': p_height, 'weight': p_weight, 'sex': p_sex, 'intensity': intensity, 'age': p_age, 'username': session['username']})
            t.start()

    # return the rendered template
    return render_template("generic.html")


@app.route("/stream.html")
def stream():
    if not loggedin():
        return render_template("login.html")
    # return the rendered template
    global t, loop
    loop = True
    t = threading.Thread(target=predict, kwargs={'input_path': 'none', 'height': 'none', 'weight': 'none', 'sex': 'none', 'intensity': 'none', 'age': 'none', 'username': 'none'})
    #t.daemon = True
    t.start()
    return render_template("stream.html")


@app.route("/endstream.html", methods=['GET', 'POST'])
def endstream():
    if not loggedin():
        return render_template("login.html")
    global t, loop
    loop = False
    t.join()
    # return the rendered template
    return redirect(url_for('generic'))
    #return render_template("generic.html")


@app.route("/profile.html", methods=['GET', 'POST'])
def profile():
    if not loggedin():
        return render_template("login.html")

    if request.method == 'POST':
        conn = get_db_connection()
        cur = conn.cursor()

        username = session['username']
        print(username)
        weight = request.form['weight']
        print(weight)
        sex = request.form['sex']
        print(sex)
        feet = int(request.form['feet'])
        print(feet)
        inches = int(request.form['inches'])
        print(inches)
        height = (feet*12)+inches
        print(height)
        age = request.form['age']
        print(age)

        cur.execute("INSERT INTO profiles (username, height, weight, sex, age) VALUES (?, ?, ?, ?, ?)",
                    (username, height, weight, sex, age)
                    )

        cur.execute("UPDATE login SET isprofilecreated = 1 WHERE username = ?", (username,))

        newpath = "Uploads/" + username + "/"
        if not os.path.exists(newpath):
            os.makedirs(newpath)

        conn.commit()
        cur.close()
        conn.close()

        return render_template("index.html")

    return render_template("profile.html")

@app.route("/MyProfile.html", methods=['GET', 'POST'])
def myprofile():
    if not loggedin():
        return render_template("login.html")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM workouts WHERE username = ?", (session['username'], ))

    rows = cur.fetchall()

    if len(list(rows)) > 0:

        print("greater")

        totalcals = 0
        stringarr = []
        timearr = []
        #i = 0

        for row in rows:
            totalcals = totalcals + row[6]
            if row[4] > 60:
                timearr.append(row[4]/60)
                stringarr.append("minutes")
            else:
                timearr.append(row[4])
                stringarr.append("seconds")
            #i = i + 1

        totalcals = round(totalcals, 2)

        cur.close()
        conn.close()

        ultralist = zip(rows, stringarr, timearr)

        return render_template("MyProfile.html", username=session['username'], rows=rows, totalcals=totalcals, notempty=True, stringarr=stringarr, timearr=timearr, ultralist=ultralist)

    else:
        print("less")
        cur.close()
        conn.close()

        return render_template("MyProfile.html", username=session['username'], totalcals=0, notempty=False)


@app.route("/elements.html")
def elements():
    if not loggedin():
        return render_template("login.html")
    # return the rendered template
    return render_template("elements.html")


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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


#vs = cv2.VideoCapture(args["input"])
#vs = cv2.VideoCapture(0)


def predict(**filenames):
    # initialize the video stream, pointer to output video file, and
    # frame dimensions

    #global vs, outputFrame, lock, loop
    global outputFrame, lock, loop

    for key, value in filenames.items():
        if value == "none":
            vs = cv2.VideoCapture(0)
            fps = 30
            ret = False
        else:
            if key == "input_path":
                cur_filename = value
                vs = cv2.VideoCapture(cur_filename)
            elif key == "height":
                cur_height = value
            elif key == "weight":
                cur_weight = value
            elif key == "sex":
                cur_sex = value
            elif key == "intensity":
                cur_intensity = value
            elif key == "age":
                cur_age = value
            elif key == "username":
                cur_username = value
            fps = vs.get(cv2.CAP_PROP_FPS)
            ret = True



    writer = None
    (W, H) = (None, None)
    # loop over frames from the video file stream

    print(fps)
    result_labels = []

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

        result_labels.append(label)

        if not ret:
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

    if ret:

        processed_labels = Counter(result_labels)
        print(processed_labels.most_common())

        exercise = processed_labels.most_common(1)[0][0]

        if exercise == "none":
            exercise = processed_labels.most_common(2)[1][0]
            frames = processed_labels.most_common(2)[1][1] * 1.35
        else:
            frames = processed_labels.most_common(1)[0][1]

        print(exercise)
        print(frames)

        seconds = frames / fps
        print(seconds)

        print(exercise + " for " + str(seconds) + " seconds")

        cur_intensity = int(cur_intensity)

        if exercise == "deadlift":
            if cur_intensity == 1:
                met = 4
            elif cur_intensity == 2:
                met = 7
            elif cur_intensity == 3:
                met = 9
        elif exercise == "squat":
            if cur_intensity == 1:
                met = 3.5
            elif cur_intensity == 2:
                met = 6
            elif cur_intensity == 3:
                met = 8
        elif exercise == "benchpress":
            if cur_intensity == 1:
                met = 3
            elif cur_intensity == 2:
                met = 5
            elif cur_intensity == 3:
                met = 7

        print("\nmet: " + str(met))
        print("cur_weight: " + str(cur_weight))
        print("cur_height: " + str(cur_height))
        print("cur_age: " + str(cur_age))
        print("cur_sex: " + str(cur_sex))

        if cur_sex == "male" or cur_sex == "other":
            bmr = 66 + (6.23 * cur_weight) + (12.7 * cur_height) - (6.8 * cur_age)
        elif cur_sex == "female":
            bmr = 655 + (4.35 * cur_weight) + (4.7 * cur_height) - (4.7 * cur_age)

        print("bmr: " + str(bmr))

        calories = bmr * met / 24 * ((seconds/60)/60)

        print("\nDB Values:")
        print("cur_filename: " + str(cur_filename))
        print("exercise: " + str(exercise))
        print("seconds: " + str(seconds))
        print("cur_intensity: " + str(cur_intensity))
        print("calories: " + str(calories))

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("INSERT INTO workouts (filename, username, workout, elapsedtime, intensity, calories) VALUES (?, ?, ?, ?, ?, ?)",
                    (cur_filename, cur_username, exercise, seconds, cur_intensity, calories,)
                    )

        conn.commit()
        cur.close()
        conn.close()

# start the flask app
app.run(host=args["ip"], port=args["port"], debug=True, threaded=True, use_reloader=False)


