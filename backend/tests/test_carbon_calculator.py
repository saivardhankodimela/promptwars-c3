import pytest
from app.schemas.assessment import AssessmentSubmitSchema
from app.services.carbon_calculator import calculate_carbon_footprint

def test_calculate_carbon_footprint_vegetarian():
    # Setup test input questionnaire
    assessment_data = {
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
    
    assessment = AssessmentSubmitSchema(**assessment_data)
    result = calculate_carbon_footprint("test-user-uid", assessment)
    
    # Assert breakdown elements are calculated and positive
    assert result.uid == "test-user-uid"
    assert result.totalMonthly > 0
    assert result.breakdown.transportation == pytest.approx(10.0 * 30 * 0.032, abs=0.1) # daily_commute * 30 * metro_bus_factor
    assert result.breakdown.food == pytest.approx(100.0 + (2 * 4.33 * 1.5), abs=0.1) # vegetarian_base + deliveries * 4.33 * delivery_factor
    assert result.breakdown.energy > 0
    assert result.breakdown.travel == pytest.approx((2 * 200.0) / 12.0, abs=0.1) # domestic_flights * 200 / 12
    assert result.breakdown.shopping == pytest.approx((3 * 2.0) + 10.0, abs=0.1) # shopping_frequency * 2.0 + sustainable_habit

def test_calculate_carbon_footprint_heavy_meat_car():
    assessment_data = {
        "transportation": {
            "dailyCommuteDistanceKm": 40.0,
            "mode": "diesel_car",
            "vehicleOwnership": True
        },
        "food": {
            "dietType": "heavy_meat",
            "deliveryFrequencyWeekly": 5
        },
        "energy": {
            "acUsageHoursDaily": 10.0,
            "electricityBillEstimateInr": 6000.0,
            "appliancesRating": "low_efficiency"
        },
        "travel": {
            "domesticFlightsAnnual": 10,
            "internationalFlightsAnnual": 2
        },
        "shopping": {
            "onlineShoppingFrequencyMonthly": 12,
            "clothingPurchaseHabit": "fast_fashion"
        }
    }
    
    assessment = AssessmentSubmitSchema(**assessment_data)
    result = calculate_carbon_footprint("heavy-user-uid", assessment)
    
    # Assert that heavy user emissions are significantly larger than vegetarian/public transit user
    assert result.totalMonthly > 500.0
    assert result.breakdown.transportation == pytest.approx(40.0 * 30 * 0.165, abs=0.1)
    assert result.equivalencies.lpgCylindersUsed > 0
    assert result.equivalencies.treesPlantedToOffset > 0
