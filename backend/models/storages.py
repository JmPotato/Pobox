from .base import *

class Folder(BaseModel):
    name = CharField(max_length=64, unique=True)

class File(BaseModel):
    folder = ForeignKeyField(Folder, backref="files")
    filename = CharField(index=True)
    open_public_share = BooleanField()
    public_share_url = CharField()