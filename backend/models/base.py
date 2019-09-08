from peewee import *

db = SqliteDatabase("pobox.db", pragmas=(('foreign_keys', 'on'),))

class BaseModel(Model):
    class Meta:
        database = db