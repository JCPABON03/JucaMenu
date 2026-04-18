# app/utils/image_upload.py
import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

def handle_product_images(files: list[UploadFile]) -> list[str]:
    urls = []
    for f in files:
        result = cloudinary.uploader.upload(
            f.file,
            folder="jucamenu/products",
            resource_type="image",
        )
        urls.append(result["secure_url"])
    return urls
