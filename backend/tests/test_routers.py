import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.auth import get_current_user
from app.schemas.challenges import ChallengeResponse, UserChallengeResponse, LeaderboardEntryResponse

# Mock authorization dependency
async def override_get_current_user():
    return {
        "uid": "test-user-123",
        "email": "test@ecomind.ai",
        "name": "Test User",
        "picture": ""
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
