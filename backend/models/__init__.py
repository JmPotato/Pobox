from .users import *
from .storages import *

def init_all_tables():
    db.connect()
    db.create_tables([Folder, File, User])