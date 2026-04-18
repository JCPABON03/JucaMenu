# app/schemas/restaurant_schema.py
from pydantic import BaseModel
from typing import Optional


class RestaurantBase(BaseModel):
    name:         str
    description:  Optional[str] = None
    address:      Optional[str] = None
    phone:        Optional[str] = None
    instagram:    Optional[str] = None
    facebook:     Optional[str] = None
    tiktok:       Optional[str] = None
    schedule:     Optional[str] = None
    maps_url:     Optional[str] = None
    theme_primary: Optional[str] = '#faf6f0'
    theme_accent:  Optional[str] = '#c8860a'
    theme_text:    Optional[str] = '#1a1209'
    theme_card:    Optional[str] = '#ffffff'


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantThemeUpdate(BaseModel):
    theme_primary: Optional[str] = None
    theme_accent:  Optional[str] = None
    theme_text:    Optional[str] = None
    theme_card:    Optional[str] = None


class RestaurantResponse(RestaurantBase):
    id:      int
    slug:    str
    user_id: int
    logo:    Optional[str] = None
    banner:  Optional[str] = None

    class Config:
        from_attributes = True