import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.auth import get_current_user
from app.schemas.challenges import ChallengeResponse, UserChallengeResponse, LeaderboardEntryResponse
from app.schemas.ai import StoryResponse, PersonaResponse, SimulationResponse

# Mock authorization dependency
async def override_get_current_user():
    return {
        "uid": "test-user-123",
        "email": "test@ecomind.ai",
        "name": "Test User",
        "picture": "http://mock-photo.com/user.jpg"
    }

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "EcoMind" in response.json()["app"]

@patch("app.services.challenge_service.challenge_service.get_available_challenges")
def test_get_challenges(mock_get_challenges):
    mock_get_challenges.return_value = [
        ChallengeResponse(
            id="test_challenge",
            title="Test Challenge",
            description="Test description",
            category="transport",
            pointsReward=100,
            durationDays=7,
            targetMetric="1 ride",
            participantsCount=10
        )
    ]
    response = client.get("/api/v1/challenges")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == "test_challenge"
    assert response.json()[0]["pointsReward"] == 100

@patch("app.services.challenge_service.challenge_service.join_user_challenge")
def test_join_challenge(mock_join):
    mock_join.return_value = UserChallengeResponse(
        id="test-user-123_test_challenge",
        uid="test-user-123",
        challengeId="test_challenge",
        status="joined",
        progress=0.0,
        joinedAt="2026-06-21T00:00:00Z",
        completedAt=None
    )
    response = client.post("/api/v1/challenges/test_challenge/join")
    assert response.status_code == 200
    assert response.json()["status"] == "joined"
    assert response.json()["challengeId"] == "test_challenge"

@patch("app.services.challenge_service.challenge_service.update_user_challenge_progress")
def test_update_challenge_progress(mock_update):
    mock_update.return_value = UserChallengeResponse(
        id="test-user-123_test_challenge",
        uid="test-user-123",
        challengeId="test_challenge",
        status="completed",
        progress=100.0,
        joinedAt="2026-06-21T00:00:00Z",
        completedAt="2026-06-21T01:00:00Z"
    )
    response = client.post(
        "/api/v1/challenges/test_challenge/progress",
        json={"progress": 100.0}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["progress"] == 100.0

@patch("app.services.challenge_service.challenge_service.get_top_leaderboard")
def test_get_leaderboard(mock_leaderboard):
    mock_leaderboard.return_value = [
        LeaderboardEntryResponse(
            uid="test-user-123",
            displayName="Test User",
            photoURL=None,
            points=250,
            streak=3,
            rank=1
        )
    ]
    response = client.get("/api/v1/challenges/leaderboard")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["displayName"] == "Test User"
    assert response.json()[0]["rank"] == 1

@patch("app.services.firebase_service.firebase_service.save_user")
@patch("app.services.firebase_service.firebase_service.init_profile")
def test_sync_user(mock_init_profile, mock_save_user):
    mock_init_profile.return_value = {
        "uid": "test-user-123",
        "displayName": "Test User",
        "photoURL": "http://mock-photo.com/user.jpg",
        "persona": None,
        "score": 50.0,
        "points": 100,
        "streak": 1,
    }
    response = client.post("/api/v1/auth/sync")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["profile"]["uid"] == "test-user-123"
    mock_save_user.assert_called_once()
    mock_init_profile.assert_called_once()

@patch("app.services.firebase_service.firebase_service.get_profile")
def test_get_profile_success(mock_get_profile):
    mock_get_profile.return_value = {
        "uid": "test-user-123",
        "displayName": "Test User",
        "photoURL": "http://mock-photo.com/user.jpg",
        "persona": None,
        "score": 50.0,
        "points": 100,
        "streak": 1,
    }
    response = client.get("/api/v1/auth/profile")
    assert response.status_code == 200
    assert response.json()["uid"] == "test-user-123"

@patch("app.services.firebase_service.firebase_service.save_assessment")
@patch("app.services.firebase_service.firebase_service.save_carbon_score")
@patch("app.services.gemini_service.gemini_service.generate_carbon_persona")
@patch("app.services.firebase_service.firebase_service.save_persona")
def test_submit_assessment(mock_save_persona, mock_gen_persona, mock_save_score, mock_save_assess):
    mock_gen_persona.return_value = PersonaResponse(
        personaType="Conscious Improver",
        tagline="Step-by-step eco-gardener",
        summary="Good food and commute but high deliveries.",
        topEmissionsSource="Deliveries",
        primaryOpportunity="Cook local food"
    )
    assessment_payload = {
        "transportation": {
            "dailyCommuteDistanceKm": 10.0,
            "mode": "metro_bus",
            "vehicleOwnership": False
        },
        "food": {
            "dietType": "vegetarian",
            "deliveryFrequencyWeekly": 2
        },
        "energy": {
            "acUsageHoursDaily": 4.0,
            "electricityBillEstimateInr": 1600.0,
            "appliancesRating": "average"
        },
        "travel": {
            "domesticFlightsAnnual": 2,
            "internationalFlightsAnnual": 0
        },
        "shopping": {
            "onlineShoppingFrequencyMonthly": 3,
            "clothingPurchaseHabit": "sustainable"
        }
    }
    response = client.post("/api/v1/assessment", json=assessment_payload)
    assert response.status_code == 201
    assert response.json()["status"] == "success"
    assert response.json()["persona"]["personaType"] == "Conscious Improver"
    mock_save_assess.assert_called_once()
    mock_save_score.assert_called_once()
    mock_gen_persona.assert_called_once()
    mock_save_persona.assert_called_once()

@patch("app.services.firebase_service.firebase_service.get_profile")
@patch("app.services.firebase_service.firebase_service.get_latest_carbon_score")
@patch("app.services.gemini_service.gemini_service.get_coach_response")
def test_chat_with_coach(mock_get_coach, mock_get_score, mock_get_profile):
    mock_get_profile.return_value = {"uid": "test-user-123"}
    mock_get_score.return_value = {"totalMonthly": 120}
    mock_get_coach.return_value = "Hello from EcoDeva!"

    response = client.post("/api/v1/ai/coach/chat", json={
        "message": "Hello",
        "chatHistory": []
    })
    assert response.status_code == 200
    assert response.json()["response"] == "Hello from EcoDeva!"

@patch("app.services.firebase_service.firebase_service.get_assessment")
@patch("app.services.firebase_service.firebase_service.get_latest_carbon_score")
@patch("app.services.gemini_service.gemini_service.get_simulator_insights")
def test_simulate_decisions(mock_get_insights, mock_get_score, mock_get_assessment):
    mock_get_assessment.return_value = {
        "transportation": {
            "dailyCommuteDistanceKm": 10.0,
            "mode": "metro_bus",
            "vehicleOwnership": False
        },
        "food": {
            "dietType": "vegetarian",
            "deliveryFrequencyWeekly": 2
        },
        "energy": {
            "acUsageHoursDaily": 4.0,
            "electricityBillEstimateInr": 1600.0,
            "appliancesRating": "average"
        },
        "travel": {
            "domesticFlightsAnnual": 2,
            "internationalFlightsAnnual": 0
        },
        "shopping": {
            "onlineShoppingFrequencyMonthly": 3,
            "clothingPurchaseHabit": "sustainable"
        }
    }
    mock_get_score.return_value = {
        "totalMonthly": 300.0,
        "breakdown": {
            "transportation": 50.0,
            "food": 50.0,
            "energy": 100.0,
            "travel": 50.0,
            "shopping": 50.0
        }
    }
    mock_get_insights.return_value = SimulationResponse(
        currentEmissionsKg=300.0,
        projectedEmissionsKg=250.0,
        savingsKg=50.0,
        percentReduction=16.67,
        insights="Keep doing it!"
    )
    
    response = client.post("/api/v1/ai/simulate", json={
        "reduceAcHours": 1.0,
        "useMetroWeekly": 2,
        "reduceDeliveryWeekly": 1,
        "reduceFlightsAnnual": 1
    })
    assert response.status_code == 200
    assert response.json()["insights"] == "Keep doing it!"

@patch("app.services.firebase_service.firebase_service.get_profile")
@patch("app.services.firebase_service.firebase_service.get_latest_carbon_score")
@patch("app.services.gemini_service.gemini_service.generate_weekly_story")
@patch("app.services.firebase_service.firebase_service.save_story")
def test_generate_weekly_story(mock_save_story, mock_gen_story, mock_get_score, mock_get_profile):
    mock_get_profile.return_value = {"uid": "test-user-123"}
    mock_get_score.return_value = {"totalMonthly": 200.0}
    mock_gen_story.return_value = StoryResponse(
        title="Banyan Tree Shield",
        narrative="A clean week!",
        metaphor="Planting a banyan tree",
        pointsEarned=50,
        scoreImpact=2
    )

    response = client.post("/api/v1/ai/story/generate")
    assert response.status_code == 200
    assert response.json()["title"] == "Banyan Tree Shield"
    mock_save_story.assert_called_once()

@patch("app.services.firebase_service.firebase_service.get_latest_story")
def test_get_latest_story(mock_get_story):
    mock_get_story.return_value = {
        "title": "Banyan Tree Shield",
        "narrative": "A clean week!",
        "metaphor": "Planting a banyan tree",
        "pointsEarned": 50,
        "scoreImpact": 2
    }
    response = client.get("/api/v1/ai/story/latest")
    assert response.status_code == 200
    assert response.json()["title"] == "Banyan Tree Shield"
