import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Google Cloud settings
    GCP_PROJECT: str = "promptwars-c3"
    VERTEX_AI_LOCATION: str = "us-central1"  # Vertex AI models are widely available in us-central1
    
    # Firestore & Firebase Authentication
    FIREBASE_SERVICE_ACCOUNT_JSON: str | None = None
    
    # Cloud Storage for Badges/Reports
    STORAGE_BUCKET_NAME: str = ""  # Populated dynamically if empty, e.g. project-id.appspot.com
    
    # CORS setup
    CORS_ORIGINS: str = "*"  # Comma separated list of origins or "*"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
