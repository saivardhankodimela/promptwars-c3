from pydantic import BaseModel, Field
from typing import Literal

class TransportationSchema(BaseModel):
    dailyCommuteDistanceKm: float = Field(..., ge=0, description="Daily commute distance in kilometers")
    mode: Literal["two_wheeler", "petrol_car", "diesel_car", "electric_car", "auto_rickshaw", "metro_bus", "bicycle_walk"]
    vehicleOwnership: bool = Field(default=False, description="Whether the user owns the vehicle")

class FoodSchema(BaseModel):
    dietType: Literal["vegan", "vegetarian", "pescatarian", "omnivore", "heavy_meat"]
    deliveryFrequencyWeekly: int = Field(..., ge=0, description="Number of food deliveries ordered weekly")

class EnergySchema(BaseModel):
    acUsageHoursDaily: float = Field(..., ge=0, le=24, description="Average AC usage per day in hours")
    electricityBillEstimateInr: float = Field(..., ge=0, description="Monthly electricity bill in INR")
    appliancesRating: Literal["high_efficiency", "average", "low_efficiency"]

class TravelSchema(BaseModel):
    domesticFlightsAnnual: int = Field(..., ge=0, description="Number of domestic flights taken in a year")
    internationalFlightsAnnual: int = Field(..., ge=0, description="Number of international flights taken in a year")

class ShoppingSchema(BaseModel):
    onlineShoppingFrequencyMonthly: int = Field(..., ge=0, description="Number of online orders per month")
    clothingPurchaseHabit: Literal["fast_fashion", "sustainable", "minimalist"]

class AssessmentSubmitSchema(BaseModel):
    transportation: TransportationSchema
    food: FoodSchema
    energy: EnergySchema
    travel: TravelSchema
    shopping: ShoppingSchema
