import logging
from datetime import datetime, timedelta
from firebase_admin import firestore, storage
from google.cloud.firestore_v1.base_query import FieldFilter
from app.config import settings

logger = logging.getLogger("ecomind")

class FirebaseService:
    def __init__(self):
        self.db = firestore.client()
        self._bucket = None

    @property
    def bucket(self):
        if not self._bucket:
            # Lazy initialize the storage bucket
            self._bucket = storage.bucket()
        return self._bucket

    def save_user(self, uid: str, email: str, display_name: str, photo_url: str | None = None) -> dict:
        user_ref = self.db.collection("users").document(uid)
        user_data = {
            "uid": uid,
            "email": email,
            "displayName": display_name,
            "photoURL": photo_url,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        user_ref.set(user_data, merge=True)
        return user_data

    def get_profile(self, uid: str) -> dict | None:
        profile_ref = self.db.collection("profiles").document(uid)
        doc = profile_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None

    def init_profile(self, uid: str, display_name: str, photo_url: str | None = None) -> dict:
        profile_ref = self.db.collection("profiles").document(uid)
        doc = profile_ref.get()
        if doc.exists:
            return doc.to_dict()
        
        profile_data = {
            "uid": uid,
            "displayName": display_name,
            "photoURL": photo_url,
            "persona": None,
            "score": 50.0, # Default starting sustainability score
            "points": 100, # Initial signup reward
            "streak": 1,
            "lastActive": firestore.SERVER_TIMESTAMP,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        profile_ref.set(profile_data)
        
        # Also cache in leaderboard
        self.db.collection("leaderboards").document(uid).set({
            "uid": uid,
            "displayName": display_name,
            "photoURL": photo_url,
            "points": 100,
            "streak": 1,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })
        
        return profile_data

    def update_profile_score(self, uid: str, score: float, points_added: int, update_streak: bool = False) -> dict:
        profile_ref = self.db.collection("profiles").document(uid)
        doc = profile_ref.get()
        if not doc.exists:
            raise ValueError("Profile does not exist.")
        
        profile_data = doc.to_dict()
        new_score = max(0.0, min(100.0, score))
        new_points = profile_data.get("points", 0) + points_added
        
        streak = profile_data.get("streak", 1)
        if update_streak:
            last_active = profile_data.get("lastActive")
            if last_active:
                # Firestore returns datetime objects
                if isinstance(last_active, datetime):
                    last_active_dt = last_active
                else:
                    last_active_dt = datetime.fromisoformat(str(last_active))
                
                diff = datetime.utcnow() - last_active_dt.replace(tzinfo=None)
                if diff.days == 1:
                    streak += 1
                elif diff.days > 1:
                    streak = 1
            else:
                streak = 1

        updates = {
            "score": round(new_score, 1),
            "points": new_points,
            "streak": streak,
            "lastActive": firestore.SERVER_TIMESTAMP
        }
        profile_ref.update(updates)
        
        # Update leaderboard cache
        self.db.collection("leaderboards").document(uid).update({
            "points": new_points,
            "streak": streak,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })

        profile_data.update(updates)
        return profile_data

    def save_persona(self, uid: str, persona: dict) -> None:
        profile_ref = self.db.collection("profiles").document(uid)
        profile_ref.update({
            "persona": {
                **persona,
                "generatedAt": firestore.SERVER_TIMESTAMP
            }
        })

    def save_assessment(self, uid: str, assessment_dict: dict) -> None:
        self.db.collection("assessments").document(uid).set({
            **assessment_dict,
            "submittedAt": firestore.SERVER_TIMESTAMP
        })

    def get_assessment(self, uid: str) -> dict | None:
        doc = self.db.collection("assessments").document(uid).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def save_carbon_score(self, uid: str, score_data: dict) -> str:
        # Save to history collection
        doc_ref = self.db.collection("carbon_scores").document()
        score_data["id"] = doc_ref.id
        doc_ref.set(score_data)
        
        # Also compute a new sustainability score based on emissions.
        # Let's say: emissions below 200 kg CO2e/month = score 100, emissions above 1500 kg CO2e/month = score 0.
        # Linear interpolation in between:
        total_monthly = score_data.get("totalMonthly", 500)
        sustainability_score = 100.0 - ((total_monthly - 200.0) / (1500.0 - 200.0) * 100.0)
        sustainability_score = max(0.0, min(100.0, sustainability_score))
        
        self.update_profile_score(uid, sustainability_score, points_added=20) # Award 20 points for submitting assessment
        
        return doc_ref.id

    def get_latest_carbon_score(self, uid: str) -> dict | None:
        query = self.db.collection("carbon_scores") \
            .where(filter=FieldFilter("uid", "==", uid)) \
            .order_by("timestamp", direction=firestore.Query.DESCENDING) \
            .limit(1)
        docs = query.get()
        if docs:
            return docs[0].to_dict()
        return None

    def get_carbon_history(self, uid: str, limit: int = 12) -> list[dict]:
        query = self.db.collection("carbon_scores") \
            .where(filter=FieldFilter("uid", "==", uid)) \
            .order_by("timestamp", direction=firestore.Query.DESCENDING) \
            .limit(limit)
        docs = query.get()
        return [doc.to_dict() for doc in docs]

    def save_story(self, uid: str, story_data: dict) -> None:
        doc_ref = self.db.collection("stories").document()
        story_data["id"] = doc_ref.id
        story_data["createdAt"] = firestore.SERVER_TIMESTAMP
        doc_ref.set(story_data)
        
        # Award points for story generation / reviewing actions
        self.update_profile_score(uid, score=self.get_profile(uid).get("score", 50.0) + story_data.get("scoreImpact", 0), points_added=story_data.get("pointsEarned", 10))

    def get_latest_story(self, uid: str) -> dict | None:
        query = self.db.collection("stories") \
            .where(filter=FieldFilter("uid", "==", uid)) \
            .order_by("createdAt", direction=firestore.Query.DESCENDING) \
            .limit(1)
        docs = query.get()
        if docs:
            return docs[0].to_dict()
        return None

    def seed_challenges_if_empty(self) -> None:
        challenges_ref = self.db.collection("challenges")
        docs = challenges_ref.limit(1).get()
        if len(docs) > 0:
            return

        # Seed initial Indian contextual challenges
        default_challenges = [
            {
                "id": "metro_ride_week",
                "title": "Namma Metro Commuter",
                "description": "Switch from drive to Metro or public bus for at least 5 commutes this week.",
                "category": "transport",
                "pointsReward": 150,
                "durationDays": 7,
                "targetMetric": "5 commutes",
                "participantsCount": 240
            },
            {
                "id": "veggie_week",
                "title": "Green Plate Week",
                "description": "Eat purely vegetarian or vegan meals for 5 consecutive days.",
                "category": "food",
                "pointsReward": 200,
                "durationDays": 7,
                "targetMetric": "5 vegetarian days",
                "participantsCount": 450
            },
            {
                "id": "ac_off_challenge",
                "title": "Breeze is Enough",
                "description": "Reduce AC usage by 3 hours daily and use natural ventilation or ceiling fans instead.",
                "category": "energy",
                "pointsReward": 100,
                "durationDays": 5,
                "targetMetric": "3 hours daily reduction",
                "participantsCount": 180
            },
            {
                "id": "delivery_detox",
                "title": "Home Cooked Feasts",
                "description": "Zero food delivery orders this week. Support your local vendor or cook at home.",
                "category": "food",
                "pointsReward": 120,
                "durationDays": 7,
                "targetMetric": "0 deliveries",
                "participantsCount": 310
            }
        ]
        for challenge in default_challenges:
            challenges_ref.document(challenge["id"]).set({
                **challenge,
                "createdAt": firestore.SERVER_TIMESTAMP
            })

    def get_challenges(self) -> list[dict]:
        self.seed_challenges_if_empty()
        docs = self.db.collection("challenges").get()
        return [doc.to_dict() for doc in docs]

    def get_user_challenges(self, uid: str) -> list[dict]:
        docs = self.db.collection("user_challenges") \
            .where(filter=FieldFilter("uid", "==", uid)).get()
        return [doc.to_dict() for doc in docs]

    def join_challenge(self, uid: str, challenge_id: str) -> dict:
        challenge_ref = self.db.collection("challenges").document(challenge_id)
        challenge_doc = challenge_ref.get()
        if not challenge_doc.exists:
            raise ValueError("Challenge does not exist")
        
        user_challenge_id = f"{uid}_{challenge_id}"
        user_challenge_ref = self.db.collection("user_challenges").document(user_challenge_id)
        
        user_challenge_doc = user_challenge_ref.get()
        if user_challenge_doc.exists:
            return user_challenge_doc.to_dict()
            
        data = {
            "id": user_challenge_id,
            "uid": uid,
            "challengeId": challenge_id,
            "status": "joined",
            "joinedAt": firestore.SERVER_TIMESTAMP,
            "completedAt": None,
            "progress": 0.0
        }
        user_challenge_ref.set(data)
        
        # Increment challenge participant count
        challenge_ref.update({"participantsCount": firestore.Increment(1)})
        return data

    def update_challenge_progress(self, uid: str, challenge_id: str, progress: float) -> dict:
        user_challenge_id = f"{uid}_{challenge_id}"
        user_challenge_ref = self.db.collection("user_challenges").document(user_challenge_id)
        user_challenge_doc = user_challenge_ref.get()
        if not user_challenge_doc.exists:
            raise ValueError("User has not joined this challenge")

        data = user_challenge_doc.to_dict()
        if data["status"] == "completed":
            return data

        status = "joined"
        completed_at = None
        points_awarded = 0

        # If progress is 100% complete
        if progress >= 100.0:
            status = "completed"
            completed_at = firestore.SERVER_TIMESTAMP
            
            # Fetch reward amount
            challenge_doc = self.db.collection("challenges").document(challenge_id).get()
            if challenge_doc.exists:
                points_awarded = challenge_doc.to_dict().get("pointsReward", 50)
                
                # Update user profile points
                self.update_profile_score(uid, score=self.get_profile(uid).get("score", 50.0) + 2.0, points_added=points_awarded)

        updates = {
            "progress": min(100.0, max(0.0, progress)),
            "status": status,
            "completedAt": completed_at
        }
        user_challenge_ref.update(updates)
        data.update(updates)
        return data

    def get_leaderboard(self, limit: int = 15) -> list[dict]:
        # Sort leaderboard cache by points and streaks
        docs = self.db.collection("leaderboards") \
            .order_by("points", direction=firestore.Query.DESCENDING) \
            .order_by("streak", direction=firestore.Query.DESCENDING) \
            .limit(limit).get()
        
        leaderboard = []
        for index, doc in enumerate(docs):
            entry = doc.to_dict()
            entry["rank"] = index + 1
            leaderboard.append(entry)
        return leaderboard

    def generate_signed_url_for_asset(self, filename: str) -> str:
        """
        Generates a secure signed URL for public reading of a certification/badge asset.
        """
        try:
            blob = self.bucket.blob(f"assets/{filename}")
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(days=7),
                method="GET"
            )
            return url
        except Exception as e:
            logger.error(f"Error generating signed URL: {e}")
            return f"https://storage.googleapis.com/{self.bucket.name}/assets/{filename}"

firebase_service = FirebaseService()
