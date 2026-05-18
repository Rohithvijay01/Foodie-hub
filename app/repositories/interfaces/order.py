from abc import ABC, abstractmethod
from collections.abc import Sequence
from datetime import datetime
from typing import Any

from app.models.enums import BidStatus, OrderStatus
from app.models.order import Order, OrderBid


class AbstractOrderRepository(ABC):
    @abstractmethod
    async def get_by_id(self, order_id: int) -> Order | None:
        """Retrieve an order by its unique primary key ID."""
        pass

    @abstractmethod
    async def save(self, order: Order) -> Order:
        """Persist or update order state in the database."""
        pass

    @abstractmethod
    async def get_orders_by_consumer_id(
        self, consumer_id: int, limit: int | None = 100, offset: int | None = 0
    ) -> list[Order]:
        """Retrieve all orders placed by a specific consumer with pagination."""
        pass

    @abstractmethod
    async def delete_order(self, order: Order) -> Order | None:
        """Delete an order from the database."""
        pass

    @abstractmethod
    async def list_orders(
        self,
        limit: int = 100,
        offset: int = 0,
        consumer_id: int | None = None,
        hotel_id: int | None = None,
        delivery_user_id: int | None = None,
        status: OrderStatus | None = None,
        is_text_based: bool | None = None,
        created_after: datetime | None = None,
        created_before: datetime | None = None,
        hotel_manager_id: int | None = None,
        sort_by: str = "created_at",
        sort_desc: bool = True,
    ) -> tuple[list[Order], int]:
        """Retrieve a filtered, sorted, and paginated list of orders along with the total count."""
        pass

    @abstractmethod
    async def get_order_stats(
        self, hotel_id: int | None = None, created_after: datetime | None = None
    ) -> Sequence[Any]:
        """Aggregate order counts and total revenue grouped by order status."""
        pass

    @abstractmethod
    async def create(
        self,
        consumer_id: int,
        hotel_id: int | None = None,
        status: OrderStatus = OrderStatus.BIDDING,
        delivery_user_id: int | None = None,
        total_amount: float = 0.0,
        text_order: str | None = None,
        is_text_based: bool = False,
    ) -> Order:
        """Create and persist a new order instance."""
        pass


class AbstractOrderBidRepository(ABC):
    @abstractmethod
    async def create_bid(
        self, order_id: int, delivery_user_id: int, bid_amount: float, upi_screenshot_url: str
    ) -> OrderBid:
        """Create and persist a new order delivery bid."""
        pass

    @abstractmethod
    async def list_bids_for_order(self, order_id: int) -> list[OrderBid]:
        """List all bids submitted for a specific order."""
        pass

    @abstractmethod
    async def get_bid_by_id(self, bid_id: int) -> OrderBid | None:
        """Retrieve an order bid by its unique primary key ID."""
        pass

    @abstractmethod
    async def get_bids_by_delivery_user_id(self, delivery_user_id: int) -> list[OrderBid]:
        """Retrieve all bids submitted by a specific delivery user."""
        pass

    @abstractmethod
    async def save_bid(self, bid: OrderBid) -> None:
        """Persist or update bid state in the database."""
        pass

    @abstractmethod
    async def get_accepted_bid_by_order_id(self, order_id: int) -> OrderBid | None:
        """Retrieve the accepted bid for a given order if one exists."""
        pass

    @abstractmethod
    async def delete_bid(self, bid_id: int) -> None:
        """Delete an order bid by its unique primary key ID."""
        pass
