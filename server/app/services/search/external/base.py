from abc import ABC, abstractmethod
from typing import Any, Dict, List, Union

import pandas as pd


class BaseExternalSearchConnector(ABC):
    @abstractmethod
    def get_config(self) -> dict:
        # return the external dataset config
        pass

    @abstractmethod
    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        # Returns the features of a dataset and their types
        pass

    @abstractmethod
    def simple_search(
        self, dataset_name: str, query: Union[str, int, float], features: Dict[str, str]
    ) -> pd.DataFrame:
        # Performs a simple search with a string query
        pass

    @abstractmethod
    def advanced_search(
        self, dataset_name: str, query: dict, features: Dict[str, str]
    ) -> pd.DataFrame:
        # Performs an advanced search with a dict representation of the advanced search query
        pass

    @abstractmethod
    def get_suggestions(self, dataset, value, feature) -> List:
        # Returns a list of suggestions for the provided value and feature
        pass
