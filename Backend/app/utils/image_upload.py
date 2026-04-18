import os
from fastapi import UploadFile


UPLOAD_DIR = "static/images"


def save_upload_file(file: UploadFile, destination: str) -> None:
    with open(destination, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)


def handle_product_images(files: list[UploadFile]) -> list[str]:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    urls: list[str] = []
    for f in files:
        filename = f"{int(os.times().system)}_{f.filename}"
        path = os.path.join(UPLOAD_DIR, filename)
        save_upload_file(f, path)
        # ← guardar con slash forward y prefijo /
        urls.append(path.replace("\\", "/"))
    return urls
