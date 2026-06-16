from pydantic import BaseModel, Field
from typing import List, Literal, Dict, Any

class PersonaResponse(BaseModel):
    personaType: Literal["Eco Warrior", "Conscious Improver", "Carbon Explorer", "Urban Commuter", "Frequent Flyer"]
    tagline: str = Field(..., description="An engaging subtitle for the persona in an Indian context")
    summary: str = Field(..., description="Detailing why they fit this category")
    topEmissionsSource: str = Field(..., description="The sector that contributes the most to their footprint")
    primaryOpportunity: str = Field(..., description="Highly actionable high-impact change for them")

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class CoachChatRequest(BaseModel):
    message: str = Field(..., description="The user's chat message")
    chatHistory: List[ChatMessage] = Field(default=[], description="Previous conversation history")

class CoachChatResponse(BaseModel):
    response: str = Field(..., description="Empathetic, contextual response from the coach")

class SimulationRequest(BaseModel):
    reduceAcHours: float = Field(0.0, ge=0, description="Hours of daily AC use to reduce")
    useMetroWeekly: int = Field(0, ge=0, description="Number of weekly trips switched to public transport/metro")
    reduceDeliveryWeekly: int = Field(0, ge=0, description="Number of food delivery orders reduced per week")
    reduceFlightsAnnual: int = Field(0, ge=0, description="Number of flights reduced per year")

class SimulationResponse(BaseModel):
    currentEmissionsKg: float = Field(..., description="Current monthly emissions")
    projectedEmissionsKg: float = Field(..., description="Projected monthly emissions after changes")
    savingsKg: float = Field(..., description="Emissions saved in kg CO2e")
    percentReduction: float = Field(..., description="Percentage reduction in emissions")
    insights: str = Field(..., description="Gemini-generated insights about the simulated changes")

class StoryResponse(BaseModel):
    title: str = Field(..., description="Catchy motivational title of the story")
    narrative: str = Field(..., description="2-3 paragraphs describing the carbon usage using a relatable metaphor")
    metaphor: str = Field(..., description="Short metaphor (e.g., planting trees or cycling distances)")
    pointsEarned: int = Field(..., description="Points awarded for positive actions (0-100)")
    scoreImpact: int = Field(..., description="Effect on overall sustainability score (-10 to +10)")
