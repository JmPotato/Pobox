from .base import *
from .storages import Folder

class User(BaseModel):
    name = CharField(max_length=64, unique=True)
    validation = CharField(max_length=64)
    token = CharField(max_length=64, unique=True)