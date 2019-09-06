from peewee import *

db = SqliteDatabase("mydb.db", pragmas=(('foreign_keys', 'on'),))

class BaseModel(Model):

    class Meta:
        database = db

class Folder(BaseModel):
    name = CharField(max_length=64, unique=True)

def creat_all_tables():
    db.connect()
    db.create_tables([Folder])

if __name__ == "__main__":
    creat_all_tables()