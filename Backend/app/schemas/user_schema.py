from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str


from pydantic import Field, constr


class UserCreate(UserBase):
    # bcrypt has a 72-byte password limit; enforce this at validation time
    password: constr(min_length=8, max_length=72) | None = Field(
        None,
        description="Password between 8 and 72 characters; will be truncated to 72 bytes if necessary.",
    )


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True