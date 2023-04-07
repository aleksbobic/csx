from abc import ABC, abstractmethod


class StorageConnector(ABC):
    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def disconnect(self) -> None:
        pass

    @abstractmethod
    def delete_dataset(self, dataset_name: str) -> None:
        pass

    @abstractmethod
    def insert_nodes(self, collection_name: str, nodes: list) -> None:
        pass

    @abstractmethod
    def get_history_item(self, item_id: str) -> dict:
        pass

    @abstractmethod
    def update_history_item_charts(
        self,
        collection_name: str,
        study_id: str,
        user_id: str,
        item_index: int,
        charts: list,
    ) -> None:
        pass
