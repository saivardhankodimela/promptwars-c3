from app.schemas.assessment import AssessmentSubmitSchema
from app.schemas.carbon import CarbonBreakdown, CarbonEquivalencies, CarbonScoreResponse
from datetime import datetime, timezone

# Indian context specific emission factors (kg CO2e)
GRID_INTENSITY_KG_PER_KWH = 0.82   # High reliance on coal in Indian power grid
AVERAGE_ELECTRICITY_RATE_INR = 8.0 # Average price per unit/kWh in India
LPG_CYLINDER_CO2_KG = 42.5        # One domestic 14.2kg LPG cylinder produces ~42.5kg CO2 when consumed
TREE_ABSORPTION_MONTHLY_KG = 1.8   # A mature tree absorbs ~22kg CO2 per year (~1.8kg per month)
HOMES_POWERED_KWH_MONTHLY = 150.0  # Average Indian household monthly electricity consumption

TRANSPORT_FACTORS = {
    "two_wheeler": 0.045,   # Motorbike/scooter (petrol)
    "petrol_car": 0.143,    # Petrol hatchback/sedan
    "diesel_car": 0.165,    # Diesel SUV/sedan
    "electric_car": 0.051,  # EV charged via Indian grid (0.15 kWh/km * 0.82 / efficiency)
    "auto_rickshaw": 0.075,  # Auto-rickshaw (CNG/LPG)
    "metro_bus": 0.032,     # Public transport bus/metro shared average
    "bicycle_walk": 0.000   # Zero direct emissions
}

DIET_FACTORS = {
    "vegan": 60.0,          # kg CO2e / month
    "vegetarian": 100.0,    # standard Indian vegetarian (with dairy)
    "pescatarian": 140.0,
    "omnivore": 200.0,      # mixed diet
    "heavy_meat": 290.0
}

DELIVERY_VEHICLE_KG = 1.5   # Packaging + motorbike courier delivery emissions
AC_POWER_KW = 1.5          # Average split AC power rating
APPLIANCE_EFFICIENCY_MULTIPLIERS = {
    "high_efficiency": 0.85,
    "average": 1.00,
    "low_efficiency": 1.25
}

FLIGHT_DOMESTIC_KG = 200.0      # Average flight (e.g. Mumbai to Delhi)
FLIGHT_INTERNATIONAL_KG = 1100.0 # Long haul flight average per passenger

ONLINE_SHOPPING_ORDER_KG = 2.0  # Courier logistics + packaging
CLOTHING_HABIT_KG = {
    "fast_fashion": 35.0,     # kg CO2e / month
    "sustainable": 10.0,
    "minimalist": 3.0
}

def calculate_carbon_footprint(uid: str, assessment: AssessmentSubmitSchema) -> CarbonScoreResponse:
    # 1. Transportation
    daily_commute = assessment.transportation.dailyCommuteDistanceKm
    mode = assessment.transportation.mode
    mode_factor = TRANSPORT_FACTORS.get(mode, 0.045)
    monthly_transport_co2 = daily_commute * 30 * mode_factor
    
    # 2. Food Habits
    diet = assessment.food.dietType
    deliveries_weekly = assessment.food.deliveryFrequencyWeekly
    diet_co2 = DIET_FACTORS.get(diet, 100.0)
    deliveries_co2 = deliveries_weekly * 4.33 * DELIVERY_VEHICLE_KG
    monthly_food_co2 = diet_co2 + deliveries_co2

    # 3. Energy Usage
    bill_inr = assessment.energy.electricityBillEstimateInr
    kwh_estimate = bill_inr / AVERAGE_ELECTRICITY_RATE_INR
    electricity_co2 = kwh_estimate * GRID_INTENSITY_KG_PER_KWH
    
    ac_hours = assessment.energy.acUsageHoursDaily
    ac_co2 = ac_hours * 30 * AC_POWER_KW * GRID_INTENSITY_KG_PER_KWH
    
    efficiency_multiplier = APPLIANCE_EFFICIENCY_MULTIPLIERS.get(assessment.energy.appliancesRating, 1.0)
    monthly_energy_co2 = (electricity_co2 + ac_co2) * efficiency_multiplier

    # 4. Travel
    domestic_flights = assessment.travel.domesticFlightsAnnual
    international_flights = assessment.travel.internationalFlightsAnnual
    annual_flight_co2 = (domestic_flights * FLIGHT_DOMESTIC_KG) + (international_flights * FLIGHT_INTERNATIONAL_KG)
    monthly_travel_co2 = annual_flight_co2 / 12.0

    # 5. Shopping Habits
    online_orders = assessment.shopping.onlineShoppingFrequencyMonthly
    clothing = assessment.shopping.clothingPurchaseHabit
    shopping_co2 = (online_orders * ONLINE_SHOPPING_ORDER_KG) + CLOTHING_HABIT_KG.get(clothing, 10.0)
    monthly_shopping_co2 = shopping_co2

    # Aggregate
    total_monthly = monthly_transport_co2 + monthly_food_co2 + monthly_energy_co2 + monthly_travel_co2 + monthly_shopping_co2

    # Calculate equivalencies for Indian context
    lpg_cylinders = total_monthly / LPG_CYLINDER_CO2_KG
    trees_offset = total_monthly / TREE_ABSORPTION_MONTHLY_KG
    homes_powered = (kwh_estimate + (ac_hours * 30 * AC_POWER_KW)) / HOMES_POWERED_KWH_MONTHLY

    breakdown = CarbonBreakdown(
        transportation=round(monthly_transport_co2, 2),
        food=round(monthly_food_co2, 2),
        energy=round(monthly_energy_co2, 2),
        travel=round(monthly_travel_co2, 2),
        shopping=round(monthly_shopping_co2, 2)
    )

    equivalencies = CarbonEquivalencies(
        homesPoweredForMonth=round(homes_powered, 2),
        treesPlantedToOffset=round(trees_offset, 2),
        lpgCylindersUsed=round(lpg_cylinders, 2)
    )

    return CarbonScoreResponse(
        uid=uid,
        timestamp=datetime.now(timezone.utc),
        breakdown=breakdown,
        totalMonthly=round(total_monthly, 2),
        equivalencies=equivalencies
    )
