from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.services.firebase_service import firebase_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication & Profiles"]
)

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_user(current_user: dict = Depends(get_current_user)):
    """
    Syncs the authenticated Firebase user details to Firestore,
    initializing their profile if it is a new account.
    """
    try:
        # Save user credentials
        firebase_service.save_user(
            uid=current_user["uid"],
            email=current_user["email"],
            display_name=current_user["name"],
            photo_url=current_user["picture"]
        )
        # Initialize profile
        profile = firebase_service.init_profile(
            uid=current_user["uid"],
            display_name=current_user["name"],
            photo_url=current_user["picture"]
        )
        return {"status": "success", "profile": profile}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync user: {str(e)}"
        )

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the user's sustainability profile details.
    """
    profile = firebase_service.get_profile(current_user["uid"])
    if not profile:
        # Proactively initialize if missing
        profile = firebase_service.init_profile(
            uid=current_user["uid"],
            display_name=current_user["name"],
            photo_url=current_user["picture"]
        )
    return profile
