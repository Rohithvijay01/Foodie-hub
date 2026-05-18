from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Any

from app.models.enums import BidStatus, OrderStatus
from app.models.order import Order, OrderBid
from app.repositories.interfaces.order import AbstractOrderBidRepository, AbstractOrderRepository


class InMemoryOrderRepository(AbstractOrderRepository):
    def __init__(self) -> None:
        self.orders: dict[int, Order] = {}
        self._next_order_id: int = 1

    async def get_by_id(self, order_id: int) -> Order | None:
        return self.orders.get(order_id)

    async def save(self, order: Order) -> Order:
        if not order.id:
            order.id = self._next_order_id
            self._next_order_id += 1
        self.orders[order.id] = order
        return order

    async def get_orders_by_consumer_id(
        self, consumer_id: int, limit: int | None = 100, offset: int | None = 0
    ) -> list[Order]:
        user_orders = [o for o in self.orders.values() if o.consumer_id == consumer_id]
        off = offset or 0
        lim = limit or 100
        return user_orders[off : off + lim]

    async def delete_order(self, order: Order) -> Order | None:
        return self.orders.pop(order.id, None)

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
        filtered = list(self.orders.values())

        if consumer_id is not None:
            filtered = [o for o in filtered if o.consumer_id == consumer_id]
        if hotel_id is not None:
            filtered = [o for o in filtered if o.hotel_id == hotel_id]
        if delivery_user_id is not None:
            filtered = [o for o in filtered if o.delivery_user_id == delivery_user_id]
        if status is not None:
            filtered = [o for o in filtered if o.status == status]
        if is_text_based is not None:
            filtered = [o for o in filtered if o.is_text_based == is_text_based]
        if created_after is not None:
            filtered = [o for o in filtered if o.created_at and o.created_at >= created_after]
        if created_before is not None:
            filtered = [o for o in filtered if o.created_at and o.created_at <= created_before]
        if hotel_manager_id is not None:
            filtered = [o for o in filtered if o.hotel and o.hotel.manager_id == hotel_manager_id]

        def get_sort_key(o: Order) -> Any:
            if sort_by == "created_at":
                return o.created_at or datetime.min
            if sort_by == "total_amount":
                return o.total_amount
            return o.id

        filtered.sort(key=get_sort_key, reverse=sort_desc)
        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        return paginated, total

    async def get_order_stats(
        self, hotel_id: int | None = None, created_after: datetime | None = None
    ) -> Sequence[Any]:
        # Return a simple mock aggregation structure
        stats: dict[OrderStatus, dict[str, Any]] = {}
        for o in self.orders.values():
            if hotel_id is not None and o.hotel_id != hotel_id:
                continue
            if created_after is not None and o.created_at and o.created_at < created_after:
                continue

            if o.status not in stats:
                stats[o.status] = {"status": o.status, "count": 0, "revenue": 0.0}
            stats[o.status]["count"] += 1
            stats[o.status]["revenue"] += o.total_amount

        return list(stats.values())

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
        order = Order(
            consumer_id=consumer_id,
            hotel_id=hotel_id,
            status=status,
            delivery_user_id=delivery_user_id,
            total_amount=total_amount,
            text_order=text_order,
            is_text_based=is_text_based,
            created_at=datetime.now(UTC),
        )
        order.id = self._next_order_id
        self._next_order_id += 1
        self.orders[order.id] = order
        return order


class InMemoryOrderBidRepository(AbstractOrderBidRepository):
    def __init__(self) -> None:
        self.bids: dict[int, OrderBid] = {}
        self._next_bid_id: int = 1

    async def create_bid(
        self, order_id: int, delivery_user_id: int, bid_amount: float, upi_screenshot_url: str
    ) -> OrderBid:
        bid = OrderBid(
            order_id=order_id,
            delivery_user_id=delivery_user_id,
            amount=bid_amount,
            upi_screenshot_url=upi_screenshot_url,
            status=BidStatus.PENDING,
            created_at=datetime.now(UTC),
        )
        bid.id = self._next_bid_id
        self._next_bid_id += 1
        self.bids[bid.id] = bid
        return bid

    async def list_bids_for_order(self, order_id: int) -> list[OrderBid]:
        return [b for b in self.bids.values() if b.order_id == order_id]

    async def get_bid_by_id(self, bid_id: int) -> OrderBid | None:
        return self.bids.get(bid_id)

    async def get_bids_by_delivery_user_id(self, delivery_user_id: int) -> list[OrderBid]:
        return [b for b in self.bids.values() if b.delivery_user_id == delivery_user_id]

    async def save_bid(self, bid: OrderBid) -> None:
        if not bid.id:
            bid.id = self._next_bid_id
            self._next_bid_id += 1
        self.bids[bid.id] = bid

    async def get_accepted_bid_by_order_id(self, order_id: int) -> OrderBid | None:
        for b in self.bids.values():
            if b.order_id == order_id and b.status == BidStatus.ACCEPTED:
                return b
        return None

    async def delete_bid(self, bid_id: int) -> None:
        self.bids.pop(bid_id, None)
