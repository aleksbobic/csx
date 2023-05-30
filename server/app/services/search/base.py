from abc import ABC, abstractmethod
from typing import Any, Dict, List, Union

from pandas import DataFrame


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
    def get_all_datasets(self) -> Dict[str, Any]:
        # Returns a list of all datasets
        pass

    @abstractmethod
    def delete_dataset(self, dataset_name: str) -> None:
        # Deletes a dataset
        pass

    @abstractmethod
    def insert_dataset(
        self, dataset_name: str, dataset_config: dict, dataset: DataFrame
    ) -> None:
        # Inserts a dataset
        pass

    @abstractmethod
    def get_full_dataset(self, dataset_name: str) -> DataFrame:
        # Returns the full dataset
        pass

    @abstractmethod
    def simple_search(
        self, dataset_name: str, query: str, features: List[str]
    ) -> DataFrame:
        # Performs a simple search with a string query
        pass

    @abstractmethod
    def advanced_search(
        self, dataset_name: str, query: dict, features: List[str]
    ) -> DataFrame:
        # Performs an advanced search with a dict representation of the advanced search query
        pass
