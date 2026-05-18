import datetime
from typing import Any

from app.core.exceptions import ResourceNotFoundException
from app.models.enums import UserRole
from app.models.user import PasswordResetToken, User
from app.repositories.interfaces.user import AbstractUserRepository


class InMemoryUserRepository(AbstractUserRepository):
    def __init__(self) -> None:
        self.users: dict[int, User] = {}
        self.tokens: dict[str, PasswordResetToken] = {}
        self._next_user_id: int = 1

    async def get_by_id(self, user_id: int) -> User | None:
        return self.users.get(user_id)

    async def get_by_username(self, username: str) -> User | None:
        for user in self.users.values():
            if user.username == username:
                return user
        return None

    async def get_by_unique_fields(
        self,
        username: str | None = None,
        email: str | None = None,
        register_number: str | None = None,
        mobile_number: str | None = None,
    ) -> User | None:
        for user in self.users.values():
            if username and user.username == username:
                return user
            if email and user.email == email:
                return user
            if register_number and user.register_number == register_number:
                return user
            if mobile_number and user.mobile_number == mobile_number:
                return user
        return None

    async def get_by_email(self, email: str) -> User | None:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

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
        filtered_users = list(self.users.values())

        if username is not None:
            filtered_users = [u for u in filtered_users if username.lower() in u.username.lower()]
        if full_name is not None:
            filtered_users = [u for u in filtered_users if full_name.lower() in u.full_name.lower()]
        if role is not None:
            filtered_users = [u for u in filtered_users if u.role == role]
        if mobile_number is not None:
            filtered_users = [u for u in filtered_users if mobile_number in u.mobile_number]
        if department is not None:
            filtered_users = [u for u in filtered_users if u.department == department]
        if register_number is not None:
            filtered_users = [u for u in filtered_users if register_number in u.register_number]
        if email is not None:
            filtered_users = [u for u in filtered_users if email.lower() in u.email.lower()]
        if is_active is not None:
            filtered_users = [u for u in filtered_users if u.is_active == is_active]
        if is_banned is not None:
            filtered_users = [u for u in filtered_users if u.is_banned == is_banned]
        if terms_accepted is not None:
            filtered_users = [u for u in filtered_users if u.terms_accepted == terms_accepted]

        # Sort users by created_at (mocked as sorting by user id or created_at if present)
        # Using a stable key since created_at is datetime
        def get_sort_key(u: User) -> Any:
            return u.created_at or datetime.datetime.min

        filtered_users.sort(key=get_sort_key, reverse=sort_desc)

        total = len(filtered_users)
        paginated = filtered_users[offset : offset + limit]
        return paginated, total

    async def save_user(self, user: User) -> User:
        if not user.id:
            user.id = self._next_user_id
            self._next_user_id += 1
        self.users[user.id] = user
        return user

    async def create_user(self, **kwargs: Any) -> User:
        user = User(**kwargs)
        user.id = self._next_user_id
        self._next_user_id += 1
        self.users[user.id] = user
        return user

    async def accept_terms(self, user_id: int) -> None:
        user = await self.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundException("User not found", details={"user_id": user_id})
        user.terms_accepted = True
        user.terms_accepted_at = datetime.datetime.now()
        await self.save_user(user)

    async def create_reset_token(
        self, user_id: int, token_hash: str, expires_at: datetime.datetime
    ) -> None:
        reset_token = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False,
        )
        self.tokens[token_hash] = reset_token

    async def get_password_reset_token(self, token_hash: str) -> PasswordResetToken | None:
        return self.tokens.get(token_hash)

    async def mark_token_as_used(self, token: PasswordResetToken) -> None:
        if token.token_hash in self.tokens:
            self.tokens[token.token_hash].is_used = True
