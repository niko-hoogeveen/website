"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const TICK_MS = 130;

/**
 * Simple keyboard-controlled Snake game used to determine draft lottery order.
 * Score = number of food items eaten. Calls onGameOver once when the snake
 * collides with the wall or itself.
 */
export default function SnakeGame({ onGameOver }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const gameOverCalledRef = useRef(false);

  const placeFood = useCallback(() => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snakeRef.current.some((seg) => seg.x === newFood.x && seg.y === newFood.y)
    );
    foodRef.current = newFood;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Food
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE,
      foodRef.current.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );

    // Snake
    ctx.fillStyle = "#3b82f6";
    snakeRef.current.forEach((seg) => {
      ctx.fillRect(
        seg.x * CELL_SIZE,
        seg.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (dir.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (dir.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (dir.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (dir.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const interval = setInterval(() => {
      directionRef.current = nextDirectionRef.current;
      const dir = directionRef.current;
      const snake = snakeRef.current;
      const head = snake[0];
      const newHead: Point = { x: head.x + dir.x, y: head.y + dir.y };

      const hitWall =
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE;
      const hitSelf = snake.some(
        (seg) => seg.x === newHead.x && seg.y === newHead.y
      );

      if (hitWall || hitSelf) {
        clearInterval(interval);
        setGameOver(true);
        if (!gameOverCalledRef.current) {
          gameOverCalledRef.current = true;
          onGameOver(score);
        }
        return;
      }

      const newSnake = [newHead, ...snake];

      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => s + 1);
        placeFood();
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
      draw();
    }, TICK_MS);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, gameOver, draw, placeFood, onGameOver]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleStart = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    gameOverCalledRef.current = false;
    setScore(0);
    setGameOver(false);
    placeFood();
    setStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg font-semibold text-gray-200">Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="border border-gray-700 rounded-lg"
      />
      {!started && (
        <button
          onClick={handleStart}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          Start Game
        </button>
      )}
      {gameOver && (
        <p className="text-gray-300">
          Game over! Final score: <span className="font-bold">{score}</span>
        </p>
      )}
      <p className="text-sm text-gray-500">Use arrow keys to control the snake.</p>
    </div>
  );
}
