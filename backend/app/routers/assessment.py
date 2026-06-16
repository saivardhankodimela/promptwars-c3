from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.schemas.assessment import AssessmentSubmitSchema
from app.services.carbon_calculator import calculate_carbon_footprint
from app.services.firebase_service import firebase_service
from app.services.gemini_service import gemini_service

router = APIRouter(
    prefix="/assessment",
    tags=["Onboarding Assessment"]
)

@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    assessment: AssessmentSubmitSchema,
    current_user: dict = Depends(get_current_user)
):
    """
    Submits user onboarding assessment, computes their initial carbon footprint,
    and runs Gemini to generate their sustainability persona.
    """
    uid = current_user["uid"]
    try:
        # 1. Save onboarding questionnaire answers
        firebase_service.save_assessment(uid, assessment.model_dump())

        # 2. Calculate carbon footprint (with Indian factors)
        carbon_score = calculate_carbon_footprint(uid, assessment)
        
        # 3. Store carbon score (triggers profile points + updates score)
        firebase_service.save_carbon_score(uid, carbon_score.model_dump())

        # 4. Generate AI Carbon Persona
        persona = gemini_service.generate_carbon_persona(
            assessment_data=assessment.model_dump(),
            carbon_score_data=carbon_score.model_dump()
        )
        
        # 5. Store Persona inside Profile
        firebase_service.save_persona(uid, persona.model_dump())

        return {
            "status": "success",
            "carbonScore": carbon_score,
            "persona": persona
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process assessment: {str(e)}"
        )
