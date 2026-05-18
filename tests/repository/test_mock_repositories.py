import datetime
import pytest

from app.models.enums import BidStatus, Departments, OrderStatus, UserRole
from app.models.user import User
from tests.repository.in_memory_order_repository import InMemoryOrderBidRepository, InMemoryOrderRepository
from tests.repository.in_memory_user_repository import InMemoryUserRepository


@pytest.mark.asyncio
async def test_in_memory_user_repository():
    repo = InMemoryUserRepository()

    # Test create_user
    user = await repo.create_user(
        username="john_doe",
        full_name="John Doe",
        role=UserRole.CONSUMER,
        mobile_number="9876543210",
        department=Departments.AIML,
        register_number="212223240096",
        email="john@example.com",
        is_active=True,
        is_banned=False,
    )
    assert user.id == 1
    assert user.username == "john_doe"

    # Test get_by_id
    retrieved = await repo.get_by_id(1)
    assert retrieved is not None
    assert retrieved.username == "john_doe"

    # Test get_by_username
    retrieved = await repo.get_by_username("john_doe")
    assert retrieved is not None
    assert retrieved.email == "john@example.com"

    # Test get_by_unique_fields
    retrieved = await repo.get_by_unique_fields(email="john@example.com")
    assert retrieved is not None
    assert retrieved.username == "john_doe"

    # Test list_all
    users, total = await repo.list_all(username="john")
    assert total == 1
    assert users[0].username == "john_doe"

    # Test save_user
    user.full_name = "John Smith"
    saved = await repo.save_user(user)
    assert saved.full_name == "John Smith"

    # Test accept_terms
    await repo.accept_terms(1)
    assert user.terms_accepted is True


@pytest.mark.asyncio
async def test_in_memory_order_repository():
    order_repo = InMemoryOrderRepository()

    # Test create order
    order = await order_repo.create(
        consumer_id=42,
        total_amount=150.0,
        status=OrderStatus.BIDDING,
    )
    assert order.id == 1
    assert order.consumer_id == 42
    assert order.total_amount == 150.0

    # Test get_by_id
    retrieved = await order_repo.get_by_id(1)
    assert retrieved is not None
    assert retrieved.total_amount == 150.0

    # Test get_orders_by_consumer_id
    orders = await order_repo.get_orders_by_consumer_id(42)
    assert len(orders) == 1
    assert orders[0].id == 1

    # Test list_orders
    orders, total = await order_repo.list_orders(consumer_id=42)
    assert total == 1
    assert orders[0].id == 1

    # Test order stats
    stats = await order_repo.get_order_stats()
    assert len(stats) == 1
    assert stats[0]["status"] == OrderStatus.BIDDING
    assert stats[0]["count"] == 1
    assert stats[0]["revenue"] == 150.0


@pytest.mark.asyncio
async def test_in_memory_order_bid_repository():
    bid_repo = InMemoryOrderBidRepository()

    # Test create_bid
    bid = await bid_repo.create_bid(
        order_id=1,
        delivery_user_id=10,
        bid_amount=25.0,
        upi_screenshot_url="http://example.com/ss.jpg",
    )
    assert bid.id == 1
    assert bid.order_id == 1
    assert bid.amount == 25.0

    # Test list_bids_for_order
    bids = await bid_repo.list_bids_for_order(1)
    assert len(bids) == 1
    assert bids[0].id == 1

    # Test get_bid_by_id
    retrieved = await bid_repo.get_bid_by_id(1)
    assert retrieved is not None
    assert retrieved.amount == 25.0

    # Test save_bid and get_accepted_bid
    bid.status = BidStatus.ACCEPTED
    await bid_repo.save_bid(bid)
    accepted = await bid_repo.get_accepted_bid_by_order_id(1)
    assert accepted is not None
    assert accepted.id == 1

    # Test delete_bid
    await bid_repo.delete_bid(1)
    retrieved = await bid_repo.get_bid_by_id(1)
    assert retrieved is None
