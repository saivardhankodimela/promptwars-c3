import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

# Must patch before import to avoid Firebase init error
firestore_patcher = patch("app.services.firebase_service.firestore.client")
mock_firestore = firestore_patcher.start()
storage_patcher = patch("app.services.firebase_service.storage.bucket")
mock_storage = storage_patcher.start()

from app.services.firebase_service import FirebaseService


@pytest.fixture(autouse=True)
def reset_mocks():
    mock_firestore.reset_mock()
    mock_storage.reset_mock()
    yield


@pytest.fixture
def service():
    return FirebaseService()


def test_get_profile_found(service):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"uid": "test-uid", "score": 50.0}
    service.db.collection.return_value.document.return_value.get.return_value = mock_doc
    result = service.get_profile("test-uid")
    assert result == {"uid": "test-uid", "score": 50.0}


def test_get_profile_not_found(service):
    mock_doc = MagicMock()
    mock_doc.exists = False
    service.db.collection.return_value.document.return_value.get.return_value = mock_doc
    result = service.get_profile("test-uid")
    assert result is None


def test_init_profile_new(service):
    mock_doc = MagicMock()
    mock_doc.exists = False
    service.db.collection.return_value.document.return_value.get.return_value = mock_doc
    result = service.init_profile("test-uid", "Test User")
    assert result["uid"] == "test-uid"
    assert result["displayName"] == "Test User"
    assert result["score"] == 50.0
    assert result["points"] == 100
    assert isinstance(result["lastActive"], datetime)
    assert result["lastActive"].tzinfo is not None


def test_init_profile_exists(service):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"uid": "test-uid", "score": 75.0}
    service.db.collection.return_value.document.return_value.get.return_value = mock_doc
    result = service.init_profile("test-uid", "Test User")
    assert result["score"] == 75.0


def test_get_latest_carbon_score(service):
    mock_docs = [MagicMock()]
    mock_docs[0].to_dict.return_value = {"uid": "test-uid", "totalMonthly": 200.0}
    query = MagicMock()
    query.get.return_value = mock_docs
    service.db.collection.return_value.where.return_value.order_by.return_value.limit.return_value = query
    result = service.get_latest_carbon_score("test-uid")
    assert result["totalMonthly"] == 200.0


def test_get_latest_carbon_score_empty(service):
    query = MagicMock()
    query.get.return_value = []
    service.db.collection.return_value.where.return_value.order_by.return_value.limit.return_value = query
    result = service.get_latest_carbon_score("test-uid")
    assert result is None


def test_join_challenge_not_found(service):
    mock_doc = MagicMock()
    mock_doc.exists = False
    service.db.collection.return_value.document.return_value.get.return_value = mock_doc
    with pytest.raises(ValueError, match="Challenge does not exist"):
        service.join_challenge("test-uid", "invalid-id")


def test_get_carbon_history(service):
    mock_docs = [MagicMock(), MagicMock()]
    mock_docs[0].to_dict.return_value = {"uid": "test-uid", "totalMonthly": 200.0}
    mock_docs[1].to_dict.return_value = {"uid": "test-uid", "totalMonthly": 300.0}
    query = MagicMock()
    query.get.return_value = mock_docs
    service.db.collection.return_value.where.return_value.order_by.return_value.limit.return_value = query
    result = service.get_carbon_history("test-uid")
    assert len(result) == 2


def test_get_leaderboard(service):
    mock_docs = [MagicMock(), MagicMock()]
    mock_docs[0].to_dict.return_value = {"uid": "user-1", "points": 200}
    mock_docs[1].to_dict.return_value = {"uid": "user-2", "points": 150}
    query = MagicMock()
    query.get.return_value = mock_docs
    service.db.collection.return_value.order_by.return_value.order_by.return_value.limit.return_value = query
    result = service.get_leaderboard()
    assert len(result) == 2
    assert result[0]["rank"] == 1
    assert result[1]["rank"] == 2
