import logging
from app.services.firebase_service import firebase_service
from app.schemas.challenges import ChallengeResponse, UserChallengeResponse, LeaderboardEntryResponse

logger = logging.getLogger("ecomind")

class ChallengeService:
    def get_available_challenges(self) -> list[ChallengeResponse]:
        challenges = firebase_service.get_challenges()
        return [ChallengeResponse(**c) for c in challenges]

    def get_user_active_challenges(self, uid: str) -> list[UserChallengeResponse]:
        user_challenges = firebase_service.get_user_challenges(uid)
        return [UserChallengeResponse(**uc) for uc in user_challenges]

    def join_user_challenge(self, uid: str, challenge_id: str) -> UserChallengeResponse:
        data = firebase_service.join_challenge(uid, challenge_id)
        return UserChallengeResponse(**data)

    def update_user_challenge_progress(self, uid: str, challenge_id: str, progress: float) -> UserChallengeResponse:
        data = firebase_service.update_challenge_progress(uid, challenge_id, progress)
        return UserChallengeResponse(**data)

    def get_top_leaderboard(self, limit: int = 15) -> list[LeaderboardEntryResponse]:
        leaderboard = firebase_service.get_leaderboard(limit)
        return [LeaderboardEntryResponse(**entry) for entry in leaderboard]

challenge_service = ChallengeService()
