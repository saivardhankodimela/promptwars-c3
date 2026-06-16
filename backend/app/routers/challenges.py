from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.services.challenge_service import challenge_service
from app.schemas.challenges import ChallengeResponse, UserChallengeResponse, LeaderboardEntryResponse
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/challenges",
    tags=["Community Challenges & Leaderboards"]
)

class ProgressUpdateRequest(BaseModel):
    progress: float = Field(..., ge=0, le=100, description="Progress percentage (0-100)")

@router.get("", response_model=list[ChallengeResponse])
async def get_challenges(current_user: dict = Depends(get_current_user)):
    """
    Lists all available community challenges.
    """
    return challenge_service.get_available_challenges()

@router.get("/active", response_model=list[UserChallengeResponse])
async def get_user_active_challenges(current_user: dict = Depends(get_current_user)):
    """
    Lists the challenges the user is currently participating in.
    """
    return challenge_service.get_user_active_challenges(current_user["uid"])

@router.post("/{id}/join", response_model=UserChallengeResponse)
async def join_challenge(id: str, current_user: dict = Depends(get_current_user)):
    """
    Enrolls the user in a community challenge.
    """
    try:
        return challenge_service.join_user_challenge(current_user["uid"], id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{id}/progress", response_model=UserChallengeResponse)
async def update_challenge_progress(
    id: str,
    request: ProgressUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Updates progress on an active challenge. Reaching 100% completes it and awards points.
    """
    try:
        return challenge_service.update_user_challenge_progress(current_user["uid"], id, request.progress)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/leaderboard", response_model=list[LeaderboardEntryResponse])
async def get_leaderboard(current_user: dict = Depends(get_current_user)):
    """
    Fetches the global leaderboard rankings based on points and streaks.
    """
    return challenge_service.get_top_leaderboard()
