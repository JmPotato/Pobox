from peewee import *

db = SqliteDatabase('test.db')

class User(Model):
    name = CharField()

    class Meta:
        database = db

def creat_all_tables():
    db.connect()
    db.create_tables([User])

if __name__ == "__main__":
    creat_all_tables()