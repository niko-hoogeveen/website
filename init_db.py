import sqlite3

connection = sqlite3.connect('database.db')


with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

cur.execute("INSERT INTO login (username, password, isprofilecreated) VALUES (?, ?, ?)",
            ('Doug', 'dougpass', 0)
            )

cur.execute("INSERT INTO profiles (username, height, weight, sex) VALUES (?, ?, ?, ?)",
            ('Doug', 100.0, 50.0, 'male')
            )

cur.execute("INSERT INTO workouts (username, workout, elapsedtime, intensity) VALUES (?, ?, ?, ?)",
            ('Doug', 'deadlift', 42.0, 8)
            )

connection.commit()
connection.close()