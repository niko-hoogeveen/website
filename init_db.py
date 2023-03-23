import sqlite3

connection = sqlite3.connect('database.db')


with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

#cur.execute("INSERT INTO login (username, password, isprofilecreated) VALUES (?, ?, ?)",
#            ('Doug', 'dougpass', 0)
#            )

#cur.execute("INSERT INTO profiles (username, height, weight, sex, age) VALUES (?, ?, ?, ?, ?)",
#            ('Doug', 72.0, 150.0, 'male', 22)
#            )

#cur.execute("INSERT INTO workouts (username, filename, workout, elapsedtime, intensity, calories) VALUES (?, ?, ?, ?, ?, ?)",
#            ('Doug', 'test.mp4', 'deadlift', 42.0, 2, 100.0)
#            )

connection.commit()
connection.close()