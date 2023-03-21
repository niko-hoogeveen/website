DROP TABLE IF EXISTS login;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS workouts;

CREATE TABLE login (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    isprofilecreated INTEGER NOT NULL
);

CREATE TABLE profiles (
    username TEXT PRIMARY KEY,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    sex TEXT NOT NULL,
    age INTEGER NOT NULL
);

CREATE TABLE workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    username TEXT NOT NULL,
    workout TEXT NOT NULL,
    elapsedtime REAL NOT NULL,
    intensity INTEGER NOT NULL,
    calories REAL NOT NULL
);