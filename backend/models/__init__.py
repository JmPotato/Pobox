from .model import *

def creat_all_tables():
    db.connect()
    db.create_tables([Folder, File])