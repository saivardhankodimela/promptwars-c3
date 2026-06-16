import logging
from google import genai
from google.genai import types
from app.config import settings
from app.schemas.ai import PersonaResponse, StoryResponse, SimulationResponse, ChatMessage

logger = logging.getLogger("ecomind")

class GeminiService:
    def __init__(self):
        # Initialize Google GenAI SDK with Vertex AI configuration
        logger.info(f"Initializing Vertex AI client for project {settings.GCP_PROJECT} in {settings.VERTEX_AI_LOCATION}")
        self.client = genai.Client(
            vertexai=True,
            project=settings.GCP_PROJECT,
            location=settings.VERTEX_AI_LOCATION
        )
        self.model_name = "gemini-2.5-flash" # Default fast multimodal model

    def generate_carbon_persona(self, assessment_data: dict, carbon_score_data: dict) -> PersonaResponse:
        """
        Generates the sustainability persona based on User Onboarding assessment and carbon score.
        """
        prompt = f"""
        You are an expert environmental psychologist and sustainability consultant in India.
        Analyze this user's carbon profile and categorize them into one of the following personas:
        - "Eco Warrior": Exceptionally low carbon footprint, highly conscious choices.
        - "Conscious Improver": Average emissions but making an active effort to improve.
        - "Carbon Explorer": Moderately high emissions, curious but needs guidance.
        - "Urban Commuter": High emissions primarily driven by daily vehicle commute.
        - "Frequent Flyer": High emissions primarily driven by domestic or international flights.

        User Onboarding Questionnaire:
        {assessment_data}

        Calculated Footprint (kg CO2e/month):
        {carbon_score_data}

        Provide your response exactly matching the PersonaResponse schema. Keep the tone insightful, personalized, and culturally relevant to India.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PersonaResponse,
                    temperature=0.7
                )
            )
            # Response text will be structured JSON conforming to the schema
            import json
            data = json.loads(response.text)
            return PersonaResponse(**data)
        except Exception as e:
            logger.error(f"Error generating persona: {e}")
            # Fallback persona if API fails
            return PersonaResponse(
                personaType="Conscious Improver",
                tagline="Making small changes for a greener tomorrow.",
                summary="You commute moderately and eat vegetarian meals mostly, but delivery services contribute to your footprint.",
                topEmissionsSource="Food Deliveries and Online Shopping",
                primaryOpportunity="Reduce weekly food deliveries to cook fresh food, saving points and money."
            )

    def generate_weekly_story(self, profile_data: dict, current_score_data: dict) -> StoryResponse:
        """
        Generates an emotional, metaphor-rich weekly sustainability narrative.
        """
        prompt = f"""
        You are a creative environmental writer. Turn raw carbon footprint data into a compelling, motivational weekly story.
        Rather than overwhelming the user with CO2 metrics, use relatable metaphors tailored to an Indian context (e.g. comparing to Chai preparation, railway distances, LPG gas cylinder consumption, or tree absorption rates).

        User Profile:
        - Current Score (0-100): {profile_data.get('score')}
        - Green Points: {profile_data.get('points')}
        - Active Streak: {profile_data.get('streak')} days

        Current Month's Emissions Breakdown (kg CO2e):
        - Transportation: {current_score_data.get('breakdown', {}).get('transportation')}
        - Food: {current_score_data.get('breakdown', {}).get('food')}
        - Energy: {current_score_data.get('breakdown', {}).get('energy')}
        - Travel: {current_score_data.get('breakdown', {}).get('travel')}
        - Shopping: {current_score_data.get('breakdown', {}).get('shopping')}
        - Total Monthly: {current_score_data.get('totalMonthly')} kg CO2e

        Generate a story conforming to the StoryResponse schema. The story should be motivational and outline clear impacts (positive scoreImpact if their score is high or has improved, negative if it needs work).
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=StoryResponse,
                    temperature=0.8
                )
            )
            import json
            data = json.loads(response.text)
            return StoryResponse(**data)
        except Exception as e:
            logger.error(f"Error generating weekly story: {e}")
            return StoryResponse(
                title="Your Green Streak is Blossoming!",
                narrative="This week, your conscious transportation choices saved enough carbon to match the weekly work of 3 mature banyan trees. You are treading lightly on the Earth, showing that everyday changes accumulate into massive benefits for our climate.",
                metaphor="Equivalent to saving 15 litres of petrol in your commute",
                pointsEarned=40,
                scoreImpact=3
            )

    def get_coach_response(self, user_message: str, chat_history: list[ChatMessage], profile_data: dict, carbon_score_data: dict | None) -> str:
        """
        Conversational coaching response using Vertex AI.
        """
        system_instruction = f"""
        You are 'EcoDeva', a friendly, empathetic, and knowledgeable AI sustainability coach in India.
        Your goal is to guide the user to reduce their carbon footprint through practical everyday adjustments.
        Always keep the user's specific context in mind:
        - Profile: {profile_data}
        - Latest Footprint: {carbon_score_data}

        Tone Guidelines:
        1. Be warm, non-judgmental, and practical.
        2. Give recommendations suited to Indian lifestyles (e.g. using fans instead of ACs, local commuting, public transit like Metro/busses, diet options).
        3. Convert abstract numbers to emotional equivalents. Rather than saying 'you emit 400kg of CO2', explain it as 'that is like burning 10 LPG cylinders. Let's see how we can reduce it!'
        """
        
        contents = []
        for msg in chat_history:
            role_param = "user" if msg.role == "user" else "model"
            contents.append(types.Content(
                role=role_param,
                parts=[types.Part.from_text(text=msg.content)]
            ))
            
        contents.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)]
        ))
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                    max_output_tokens=800
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Error in coach chat: {e}")
            return "I'm having a brief connection issue, but let's continue. Tell me about your daily travel or energy habits and we can find small ways to make a big difference!"

    def get_simulator_insights(self, simulation_input: dict, current_score_data: dict, projected_score_data: dict) -> SimulationResponse:
        """
        Provides Gemini intelligence explaining the long-term impact of simulated changes.
        """
        prompt = f"""
        You are a sustainability architect. The user is using a Decision Simulator to evaluate lifestyle adjustments in India.
        Analyze the changes they simulated and provide insights:
        
        Simulated Adjustments:
        - Reduced AC hours: {simulation_input.get('reduceAcHours')} hours/day
        - Switch to Metro/Public transport: {simulation_input.get('useMetroWeekly')} trips/week
        - Food delivery reduction: {simulation_input.get('reduceDeliveryWeekly')} orders/week
        - Flight reduction: {simulation_input.get('reduceFlightsAnnual')} flights/year

        Emissions comparison (kg CO2e / month):
        - Current: {current_score_data.get('totalMonthly')}
        - Projected: {projected_score_data.get('totalMonthly')}
        - Savings: {current_score_data.get('totalMonthly', 0) - projected_score_data.get('totalMonthly', 0)}
        - Percent Reduction: {((current_score_data.get('totalMonthly', 0) - projected_score_data.get('totalMonthly', 0)) / (current_score_data.get('totalMonthly', 1.0))) * 100}%

        Generate a response matching the SimulationResponse schema. Outline what this change represents long-term in an Indian city context and offer an encouraging closing statement.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SimulationResponse,
                    temperature=0.6
                )
            )
            import json
            data = json.loads(response.text)
            return SimulationResponse(**data)
        except Exception as e:
            logger.error(f"Error generating simulator insights: {e}")
            savings = current_score_data.get('totalMonthly', 0) - projected_score_data.get('totalMonthly', 0)
            pct = (savings / max(1.0, current_score_data.get('totalMonthly', 1))) * 100
            return SimulationResponse(
                currentEmissionsKg=current_score_data.get('totalMonthly', 0),
                projectedEmissionsKg=projected_score_data.get('totalMonthly', 0),
                savingsKg=round(savings, 2),
                percentReduction=round(pct, 1),
                insights="By making these simple shifts—such as choosing the metro for daily travel and turning off the air conditioner a few hours earlier—you prevent substantial carbon emissions. In terms of impact, your daily savings equal the offset potential of multiple trees. Keep pushing for these changes!"
            )

gemini_service = GeminiService()
