from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.schemas.ai import CoachChatRequest, CoachChatResponse, SimulationRequest, SimulationResponse, StoryResponse
from app.services.firebase_service import firebase_service
from app.services.gemini_service import gemini_service
from app.services.carbon_calculator import calculate_carbon_footprint, TRANSPORT_FACTORS, DELIVERY_VEHICLE_KG, AC_POWER_KW, GRID_INTENSITY_KG_PER_KWH, FLIGHT_DOMESTIC_KG, APPLIANCE_EFFICIENCY_MULTIPLIERS
from app.schemas.assessment import AssessmentSubmitSchema
import logging

logger = logging.getLogger("ecomind")

router = APIRouter(
    prefix="/ai",
    tags=["AI Services (Vertex AI)"]
)

@router.post("/coach/chat", response_model=CoachChatResponse)
async def chat_with_coach(
    request: CoachChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Interacts with the AI Sustainability Coach (EcoDeva), feeding in user context.
    """
    uid = current_user["uid"]
    profile = firebase_service.get_profile(uid)
    latest_score = firebase_service.get_latest_carbon_score(uid)

    response_text = gemini_service.get_coach_response(
        user_message=request.message,
        chat_history=request.chatHistory,
        profile_data=profile or {},
        carbon_score_data=latest_score
    )
    return CoachChatResponse(response=response_text)

@router.post("/simulate", response_model=SimulationResponse)
async def simulate_decisions(
    request: SimulationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Simulates carbon savings and sustainability improvements based on user action sliders.
    """
    uid = current_user["uid"]
    assessment_dict = firebase_service.get_assessment(uid)
    current_score = firebase_service.get_latest_carbon_score(uid)

    if not assessment_dict or not current_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Onboarding assessment is required before using the simulator."
        )

    try:
        # Create a modified copy of the user's assessment to calculate projections
        assessment = AssessmentSubmitSchema(**assessment_dict)
        
        # 1. Transportation adjustment
        original_transport = current_score["breakdown"]["transportation"]
        commute_dist = assessment.transportation.dailyCommuteDistanceKm
        mode = assessment.transportation.mode
        original_factor = TRANSPORT_FACTORS.get(mode, 0.045)
        
        # Switched trips: we replace part of original mode with metro_bus
        metro_factor = TRANSPORT_FACTORS.get("metro_bus")
        weekly_trips = 14.0 # Assumed total weekly commutes (2 per day * 7 days)
        switch_ratio = min(1.0, request.useMetroWeekly / weekly_trips)
        
        projected_transport = (
            (commute_dist * 30 * original_factor * (1.0 - switch_ratio)) +
            (commute_dist * 30 * metro_factor * switch_ratio)
        )
        
        # 2. Food adjustment
        original_food = current_score["breakdown"]["food"]
        new_deliveries = max(0, assessment.food.deliveryFrequencyWeekly - request.reduceDeliveryWeekly)
        projected_food = (
            original_food - 
            (assessment.food.deliveryFrequencyWeekly * 4.33 * DELIVERY_VEHICLE_KG) + 
            (new_deliveries * 4.33 * DELIVERY_VEHICLE_KG)
        )

        # 3. Energy adjustment
        original_energy = current_score["breakdown"]["energy"]
        new_ac_hours = max(0.0, assessment.energy.acUsageHoursDaily - request.reduceAcHours)
        ac_reduction = request.reduceAcHours * 30 * AC_POWER_KW * GRID_INTENSITY_KG_PER_KWH
        efficiency_multiplier = APPLIANCE_EFFICIENCY_MULTIPLIERS.get(assessment.energy.appliancesRating, 1.0)
        projected_energy = max(0.0, original_energy - (ac_reduction * efficiency_multiplier))

        # 4. Travel adjustment
        original_travel = current_score["breakdown"]["travel"]
        flight_reduction_co2 = (request.reduceFlightsAnnual * FLIGHT_DOMESTIC_KG) / 12.0
        projected_travel = max(0.0, original_travel - flight_reduction_co2)

        # 5. Shopping (remains same in simulation)
        projected_shopping = current_score["breakdown"]["shopping"]

        # Aggregate Projected Score
        projected_total = projected_transport + projected_food + projected_energy + projected_travel + projected_shopping
        
        projected_score_data = {
            "totalMonthly": round(projected_total, 2),
            "breakdown": {
                "transportation": round(projected_transport, 2),
                "food": round(projected_food, 2),
                "energy": round(projected_energy, 2),
                "travel": round(projected_travel, 2),
                "shopping": round(projected_shopping, 2)
            }
        }

        # Request Gemini insights comparing the current vs simulated projections
        insights = gemini_service.get_simulator_insights(
            simulation_input=request.model_dump(),
            current_score_data=current_score,
            projected_score_data=projected_score_data
        )

        return insights

    except Exception as e:
        logger.error(f"Simulator error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute simulator projections."
        )

@router.post("/story/generate", response_model=StoryResponse)
async def generate_weekly_story(current_user: dict = Depends(get_current_user)):
    """
    Generates and records the weekly motivational sustainability story for the user.
    """
    uid = current_user["uid"]
    profile = firebase_service.get_profile(uid)
    latest_score = firebase_service.get_latest_carbon_score(uid)

    if not latest_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Carbon score history is empty. Onboarding assessment is required first."
        )

    try:
        story = gemini_service.generate_weekly_story(
            profile_data=profile or {},
            current_score_data=latest_score
        )
        
        # Save story to Firestore (awards points and updates profile)
        firebase_service.save_story(uid, story.model_dump())
        
        return story
    except Exception as e:
        logger.error(f"Story generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate weekly story."
        )
