import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings

logger = logging.getLogger("ecomind")

# Initialize Firebase Admin SDK
try:
    firebase_admin.get_app()
    logger.info("Firebase Admin already initialized.")
except ValueError:
    # Set up app credentials
    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        logger.info("Initializing Firebase Admin with service account key.")
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        firebase_admin.initialize_app(cred, {
            'storageBucket': settings.STORAGE_BUCKET_NAME or f"{settings.GCP_PROJECT}.appspot.com"
        })
    else:
        logger.info("Initializing Firebase Admin with Application Default Credentials.")
        firebase_admin.initialize_app(options={
            'storageBucket': settings.STORAGE_BUCKET_NAME or f"{settings.GCP_PROJECT}.appspot.com"
        })

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to verify the Firebase ID Token in the Authorization header.
    Returns the decoded token dictionary if valid, otherwise raises HTTP 401.
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name", ""),
            "picture": decoded_token.get("picture", "")
        }
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
