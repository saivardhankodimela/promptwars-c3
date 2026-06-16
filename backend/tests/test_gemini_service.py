import pytest
from unittest.mock import MagicMock, patch
from app.services.gemini_service import GeminiService
from app.schemas.ai import PersonaResponse, StoryResponse, SimulationResponse

@pytest.fixture
def mock_genai_client():
    with patch("google.genai.Client") as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        yield mock_client

def test_generate_carbon_persona_success(mock_genai_client):
    # Mocking successful API response text conforming to PersonaResponse schema
    mock_response = MagicMock()
    mock_response.text = '{"personaType": "Conscious Improver", "tagline": "Step-by-step eco-gardener", "summary": "Good food and commute but high deliveries.", "topEmissionsSource": "Deliveries", "primaryOpportunity": "Cook local food"}'
    mock_genai_client.models.generate_content.return_value = mock_response
    
    # Initialize service (which uses mocked client)
    service = GeminiService()
    
    result = service.generate_carbon_persona({}, {})
    
    assert isinstance(result, PersonaResponse)
    assert result.personaType == "Conscious Improver"
    assert result.topEmissionsSource == "Deliveries"

def test_generate_weekly_story_success(mock_genai_client):
    mock_response = MagicMock()
    mock_response.text = '{"title": "Banyan Tree Shield", "narrative": "A clean week!", "metaphor": "Planting a neem sapling", "pointsEarned": 50, "scoreImpact": 2}'
    mock_genai_client.models.generate_content.return_value = mock_response
    
    service = GeminiService()
    result = service.generate_weekly_story({}, {})
    
    assert isinstance(result, StoryResponse)
    assert result.title == "Banyan Tree Shield"
    assert result.pointsEarned == 50
