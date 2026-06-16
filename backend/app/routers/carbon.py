from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.services.firebase_service import firebase_service
from app.schemas.carbon import CarbonScoreResponse, CarbonHistoryResponse

router = APIRouter(
    prefix="/carbon",
    tags=["Carbon Footprint Engine"]
)

@router.get("/current", response_model=CarbonScoreResponse)
async def get_current_footprint(current_user: dict = Depends(get_current_user)):
    """
    Fetches the user's latest calculated carbon footprint breakdown and equivalencies.
    """
    score = firebase_service.get_latest_carbon_score(current_user["uid"])
    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No carbon score found. Please complete the onboarding assessment first."
        )
    return CarbonScoreResponse(**score)

@router.get("/history", response_model=CarbonHistoryResponse)
async def get_footprint_history(current_user: dict = Depends(get_current_user)):
    """
    Fetches the historical record list of user's calculated carbon footprints.
    """
    scores = firebase_service.get_carbon_history(current_user["uid"])
    return CarbonHistoryResponse(scores=[CarbonScoreResponse(**s) for s in scores])
