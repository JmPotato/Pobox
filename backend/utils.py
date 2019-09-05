from Crypto.Hash import MD5
from Crypto.Cipher import AES

def md5_encode(data):
    hash = MD5.new()
    hash.update(data.encode("utf-8"))
    return hash.hexdigest()