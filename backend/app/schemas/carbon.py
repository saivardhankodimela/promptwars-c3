from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict

class CarbonBreakdown(BaseModel):
    transportation: float = Field(..., description="Monthly transport emissions in kg CO2e")
    food: float = Field(..., description="Monthly food emissions in kg CO2e")
    energy: float = Field(..., description="Monthly energy emissions in kg CO2e")
    travel: float = Field(..., description="Monthly flight/long travel emissions in kg CO2e")
    shopping: float = Field(..., description="Monthly shopping/consumer emissions in kg CO2e")

class CarbonEquivalencies(BaseModel):
    homesPoweredForMonth: float = Field(..., description="Equivalent monthly electricity for average Indian household")
    treesPlantedToOffset: float = Field(..., description="Number of mature trees required to absorb this carbon in a month")
    lpgCylindersUsed: float = Field(..., description="Equivalent number of standard 14.2kg domestic LPG cylinders")

class CarbonScoreResponse(BaseModel):
    model_config = {"extra": "ignore"}
    id: str | None = None
    uid: str
    timestamp: datetime
    breakdown: CarbonBreakdown
    totalMonthly: float
    equivalencies: CarbonEquivalencies

class CarbonHistoryResponse(BaseModel):
    scores: list[CarbonScoreResponse]
