from abc import ABC, abstractmethod
from typing import Any, Dict, List, Union

import pandas as pd


class BaseSearchConnector(ABC):
    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def disconnect(self) -> None:
        pass

    @abstractmethod
    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        # Returns the features of a dataset and their types
        pass

    @abstractmethod
    def get_all_datasets(self) -> List[str]:
        # Returns a list of all datasets
        pass

    @abstractmethod
    def delete_dataset(self, dataset_name: str) -> None:
        # Deletes a dataset
        pass

    @abstractmethod
    def insert_dataset(
        self, dataset_name: str, dataset_config: dict, dataset: pd.DataFrame
    ) -> None:
        # Inserts a dataset
        pass

    @abstractmethod
    def get_full_dataset(self, dataset_name: str) -> pd.DataFrame:
        # Returns the full dataset
        pass

    @abstractmethod
    def simple_search(
        self, dataset_name: str, query: str, features: List[str]
    ) -> pd.DataFrame:
        # Performs a simple search with a string query
        pass

    @abstractmethod
    def advanced_search(
        self, dataset_name: str, query: dict, features: List[str]
    ) -> pd.DataFrame:
        # Performs an advanced search with a dict representation of the advanced search query
        pass

    @abstractmethod
    def get_entries_by_id(
        self, dataset_name: str, entry_ids: List[str]
    ) -> pd.DataFrame:
        # Returns entries by their id
        pass
