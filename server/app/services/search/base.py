from abc import ABC, abstractmethod
from typing import Union


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
