import { Metadata } from "next";
import CaloriePredictionClient from "./CaloriePredictionClient";

const BASE_URL = "https://nikohoogeveen.com";

export const metadata: Metadata = {
  title: "Calorie Prediction Network - CNN Workout Classifier",
  description:
    "Case study of a fourth-year capstone project: a ResNet-50 transfer learning model that classifies workout videos as deadlift, squat, or bench press and estimates calories burned from BMR and MET values.",
  keywords: [
    "Calorie Prediction",
    "CNN",
    "ResNet-50",
    "Transfer Learning",
    "TensorFlow",
    "Keras",
    "Computer Vision",
    "Queen's University Capstone",
    "Niko Hoogeveen",
  ],
  alternates: {
    canonical: `${BASE_URL}/projects/calorie-prediction`,
  },
  openGraph: {
    title: "Calorie Prediction Network | Niko Hoogeveen",
    description:
      "A CNN that classifies workout videos and estimates calories burned. Capstone project at Queen's University.",
    url: `${BASE_URL}/projects/calorie-prediction`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calorie Prediction Network",
    description:
      "A ResNet-50 based workout classifier that estimates calories burned from video.",
  },
};

export default function CaloriePredictionPage() {
  return <CaloriePredictionClient />;
}
