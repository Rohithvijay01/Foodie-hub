import datetime
from abc import ABC, abstractmethod
from typing import Any

from app.models.enums import UserRole
from app.models.user import PasswordResetToken, User


class AbstractUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: int) -> User | None:
        """Retrieve a user by their unique primary key ID."""
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> User | None:
        """Retrieve a user by their unique username."""
        pass

    @abstractmethod
    async def get_by_unique_fields(
        self,
        username: str | None = None,
        email: str | None = None,
        register_number: str | None = None,
        mobile_number: str | None = None,
    ) -> User | None:
        """Retrieve a user dynamically by any of their unique fields."""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None:
        """Retrieve a user by their email address."""
        pass

    @abstractmethod
    async def list_all(
        self,
        limit: int = 100,
        offset: int = 0,
        username: str | None = None,
        full_name: str | None = None,
        role: UserRole | None = None,
        mobile_number: str | None = None,
        department: str | None = None,
        register_number: str | None = None,
        email: str | None = None,
        is_active: bool | None = None,
        is_banned: bool | None = None,
        terms_accepted: bool | None = None,
        sort_desc: bool = True,
    ) -> tuple[list[User], int]:
        """List paginated, filtered, and sorted users."""
        pass

    @abstractmethod
    async def save_user(self, user: User) -> User:
        """Persist or update user state in the repository."""
        pass

    @abstractmethod
    async def create_user(self, **kwargs: Any) -> User:
        """Create and persist a new user instance."""
        pass

    @abstractmethod
    async def accept_terms(self, user_id: int) -> None:
        """Mark terms of service as accepted for a user."""
        pass

    @abstractmethod
    async def create_reset_token(
        self, user_id: int, token_hash: str, expires_at: datetime.datetime
    ) -> None:
        """Create and record a new password reset token."""
        pass

    @abstractmethod
    async def get_password_reset_token(self, token_hash: str) -> PasswordResetToken | None:
        """Retrieve a password reset token record by its hash."""
        pass

    @abstractmethod
    async def mark_token_as_used(self, token: PasswordResetToken) -> None:
        """Mark a password reset token as consumed."""
        pass
