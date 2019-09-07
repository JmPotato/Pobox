import random
import hashlib

def md5_encode(data):
    return hashlib.md5(data.encode("utf-8")).hexdigest()

def generate_filename(folder, filename):
    return md5_encode(folder + "_" + filename)

def base36_encode(number):
    assert number >= 0, "Positive integer required"
    if number == 0:
        return "0"
    base36 = []
    while number != 0:
        number, i = divmod(number, 36)
        base36.append("0123456789abcdefghijklmnopqrstuvwxyz"[i])
    return "".join(reversed(base36))

def generate_url():
    return base36_encode(random.randint(1, 2147483647))

