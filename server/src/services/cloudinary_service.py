import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Setup Cloudinary with your credentials
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

def upload_image(file, folder="alumni_conn"):
    """
    Takes a FastAPI UploadFile and uploads it to Cloudinary.
    Returns the secure HTTPS URL.
    """
    try:
        # Upload directly from the file stream
        upload_result = cloudinary.uploader.upload(
            file.file, 
            folder=folder,
            resource_type="auto"
        )
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary Error: {e}")
        return None
