"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaArrowLeft } from "react-icons/fa";
import PageParticles from "@/components/Particles";
import Breadcrumbs from "@/components/Breadcrumbs";
import CalorieDemo from "@/components/CalorieDemo";

const techStack = [
  "Python",
  "TensorFlow / Keras",
  "ResNet-50",
  "OpenCV",
  "scikit-learn",
  "Flask",
  "SQLite",
  "NumPy",
];

const pipeline = [
  {
    step: "1. Upload or stream",
    body: "The user uploads an MP4 of their workout or streams a live webcam feed, and selects a perceived intensity level (light, moderate, or vigorous).",
  },
  {
    step: "2. Frame extraction",
    body: "OpenCV reads the video frame by frame, converts each frame to RGB, resizes it to 224×224, and applies ImageNet mean subtraction to match the preprocessing used during training.",
  },
  {
    step: "3. Classification",
    body: "Each frame is passed through the CNN, which outputs a softmax distribution over three exercise classes: deadlift, squat, and bench press.",
  },
  {
    step: "4. Rolling average",
    body: "Predictions are pushed into a fixed-length deque and averaged. This smooths out single-frame misclassifications caused by motion blur or awkward mid-rep angles, which was the single biggest accuracy win on real video.",
  },
  {
    step: "5. Calorie estimation",
    body: "The dominant class plus the elapsed duration is combined with the user's stored profile to produce a calorie estimate, which is written to their workout history.",
  },
];

const retrospective = [
  {
    title: "The dataset was far too small",
    body: "150 labelled images across three classes is enough to demonstrate transfer learning, but nowhere near enough to generalise. The model was fragile on unusual camera angles, gym backgrounds it had not seen, and any exercise outside the three it knew.",
  },
  {
    title: "Frame-level classification ignores motion",
    body: "A still frame of someone at the bottom of a squat and someone racking a bar look similar to a 2D CNN. A model with a temporal component — a 3D CNN, an LSTM over frame embeddings, or a pose-estimation front end — would capture the actual movement rather than the pose.",
  },
  {
    title: "The MET table was hardcoded",
    body: "Intensity was self-reported and mapped to a small lookup table of MET values. Inferring intensity from rep tempo or estimated load would have made the calorie output far less dependent on the user guessing correctly.",
  },
];

export default function CaloriePredictionClient() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <PageParticles id="calorie-prediction-particles" />

      {/* Back Navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Projects", href: "/#projects" },
          {
            name: "Calorie Prediction Network",
            href: "/projects/calorie-prediction",
          },
        ]}
      />

      {/* Header */}
      <div className="animate-slide-in-top mb-10">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Calorie Prediction Network
        </h1>
        <p className="text-xl text-gray-400">
          A CNN that watches a workout video and estimates the calories burned
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Fourth-year capstone project • Queen&apos;s University • Computer
          Engineering
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-300 text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="animate-slide-in-bottom space-y-8">
        {/* Overview */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Overview</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Fitness trackers estimate calorie burn from heart rate and
              accelerometer data, which means they need a wearable and they have
              no idea what exercise you are actually doing. We wanted to see how
              far we could get with nothing but a camera.
            </p>
            <p>
              The result was a web application where a user creates a profile
              with their height, weight, age, and sex, then uploads a video of
              their workout or streams it live from a webcam. A convolutional
              neural network classifies the exercise being performed, the app
              times how long it was performed for, and a physiological formula
              converts that into an estimated calorie expenditure that is logged
              to the user&apos;s workout history.
            </p>
            <p>
              I worked on this as part of a four-person team. My contributions
              centred on the model — assembling and labelling the dataset,
              setting up the transfer learning pipeline, iterating on training
              runs, and integrating the trained model into the Flask
              application&apos;s inference path.
            </p>
          </div>
        </section>

        {/* Interactive demo */}
        <CalorieDemo />

        {/* How it works */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white">How It Works</h2>
          <ol className="space-y-5">
            {pipeline.map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="mt-2 w-2 h-2 shrink-0 bg-blue-500 rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.step}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mt-1">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Model architecture */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Model Architecture
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            With only 150 labelled images we had no realistic chance of training
            a network from scratch, so the model is built on transfer learning.
            We took ResNet-50 pre-trained on ImageNet, discarded its
            classification head, froze every convolutional layer, and trained a
            small new head on top. The frozen backbone already knows how to
            detect edges, textures, limbs, and equipment; all the head has to
            learn is how those features map onto three exercises.
          </p>

          <div className="bg-gray-950/60 border border-gray-700/50 rounded-lg p-5 font-mono text-sm text-gray-300 space-y-1 overflow-x-auto">
            <div className="text-gray-500">
              # input: 224 × 224 × 3, ImageNet mean subtracted
            </div>
            <div>ResNet-50 (ImageNet weights, all layers frozen)</div>
            <div className="text-gray-500">↓</div>
            <div>AveragePooling2D(pool_size=(7, 7))</div>
            <div>Flatten()</div>
            <div>Dense(512, activation=&quot;relu&quot;)</div>
            <div>Dropout(0.5)</div>
            <div>Dense(3, activation=&quot;softmax&quot;)</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Training setup
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>SGD, learning rate 1e-4, momentum 0.9</li>
                <li>Categorical cross-entropy loss</li>
                <li>Batch size 32, 1000 epochs</li>
                <li>75 / 25 stratified train-test split</li>
              </ul>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Augmentation
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>Rotation ±30°, zoom ±15%</li>
                <li>Width / height shift ±20%</li>
                <li>Shear ±15%, horizontal flip</li>
                <li>Applied to training set only</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Results</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            The model settled at roughly 88% validation accuracy on the held-out
            split. The training curves show the classic transfer learning
            signature: loss drops steeply within the first hundred epochs as the
            new head initialises, then both train and validation loss decline
            together for the remainder of the run. Training accuracy climbs
            slightly above validation accuracy, which is the mild overfitting
            you would expect from a dataset this small, but the two never
            diverge sharply — the frozen backbone and the dropout layer kept it
            in check.
          </p>

          <figure>
            <Image
              src="/projects/calorie-prediction/training-plot.png"
              alt="Training and validation loss and accuracy plotted over 1000 epochs. Loss falls from 2.0 to below 0.25 while validation accuracy plateaus near 0.9."
              width={640}
              height={480}
              className="w-full h-auto rounded-lg border border-gray-700/50 bg-white"
            />
            <figcaption className="text-sm text-gray-500 mt-3 text-center">
              Training and validation loss / accuracy over 1000 epochs.
            </figcaption>
          </figure>
        </section>

        {/* Calorie estimation */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">
            From Classification to Calories
          </h2>
          <p className="text-gray-300 leading-relaxed mb-5">
            The CNN only answers &quot;what exercise is this?&quot;. Turning
            that into a calorie figure takes two more pieces. The first is basal
            metabolic rate, calculated from the user&apos;s profile using the
            Harris-Benedict equation. The second is a MET value — a metabolic
            equivalent that expresses how demanding an activity is relative to
            sitting still — chosen from a lookup table keyed on the predicted
            exercise and the intensity the user selected.
          </p>

          <div className="bg-gray-950/60 border border-gray-700/50 rounded-lg p-5 font-mono text-sm text-gray-300 overflow-x-auto">
            calories = BMR × MET ÷ 24 × hours_elapsed
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mt-4">
            Dividing BMR by 24 converts it to an hourly resting burn rate,
            multiplying by the MET scales it to the effort of the exercise, and
            multiplying by the elapsed duration gives the total. A deadlift at
            vigorous intensity carried a MET of 9, a squat 8, and a bench press
            7, with lower values for moderate and light effort.
          </p>
        </section>

        {/* Retrospective */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-white">
            What I&apos;d Do Differently
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            This was a fourth-year project built under a deadline, and there are
            several decisions in it I would not make again.
          </p>
          <ul className="space-y-5">
            {retrospective.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-2 w-2 h-2 shrink-0 bg-blue-500 rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mt-1">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Source */}
        <section className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Source Code</h2>
          <p className="text-gray-300 mb-6">
            The project is split across two repositories: one for the training
            pipeline and one for the Flask application that serves the model.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/niko-hoogeveen/498-Capstone-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <FaGithub size={20} />
              Model & Training Pipeline
            </a>
            <a
              href="https://github.com/niko-hoogeveen/capstoneWebsite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <FaGithub size={20} />
              Web Application
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-5">
            The demo above replays predictions generated offline by the original
            2022 model. The export script that produces that data lives in the
            website repository as scripts/export_calorie_demo.py.
          </p>
        </section>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            Back to Portfolio
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            View Stock Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
