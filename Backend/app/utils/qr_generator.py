import qrcode


def generate_qr(menu_url, filename):

    img = qrcode.make(menu_url)

    dirpath = "static/qr"
    import os
    os.makedirs(dirpath, exist_ok=True)
    path = f"{dirpath}/{filename}.png"

    img.save(path)

    return path