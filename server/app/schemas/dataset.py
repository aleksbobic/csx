from pydantic import BaseModel


class SettingsCreate(BaseModel):
    name: str
    anchor: str
    defaults: dict
    default_schemas: dict


class SettingsUpdate(BaseModel):
    anchor: str
    defaults: dict
