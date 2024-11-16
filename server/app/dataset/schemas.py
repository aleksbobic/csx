from typing import Any, Dict, Optional

from pydantic import BaseModel


class FeatureDefaults(BaseModel):
    name: str
    isDefaultVisible: bool
    isDefaultSearch: bool
    isDefaultLink: bool
    dataType: str

    def __getitem__(self, item):
        return getattr(self, item)

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        return getattr(self, key, default)


class DatasetSettings(BaseModel):
    anchor: str
    defaults: Dict[str, FeatureDefaults]

    def __getitem__(self, item):
        return getattr(self, item)


class DatasetSettingsFull(DatasetSettings):
    name: str
    default_schemas: dict

    def __getitem__(self, item):
        return getattr(self, item)
