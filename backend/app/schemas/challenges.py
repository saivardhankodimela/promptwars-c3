from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    pointsReward: int
    durationDays: int
    targetMetric: str
    participantsCount: int

class UserChallengeResponse(BaseModel):
    id: str
    uid: str
    challengeId: str
    status: str # "joined" | "completed" | "failed"
    joinedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    progress: float

class LeaderboardEntryResponse(BaseModel):
    uid: str
    displayName: str
    photoURL: Optional[str] = None
    points: int
    streak: int
    rank: int
