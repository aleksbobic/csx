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
    def delete_history_item(self, study_id, user_id, history_item_id):
        pass

    @abstractmethod
    def get_study(self, user_id, study_id) -> dict:
        pass

    @abstractmethod
    def update_history_item_charts(
        self,
        study_id: str,
        user_id: str,
        item_index: str,
        charts: list,
    ) -> None:
        pass

    @abstractmethod
    def update_study_settings(self, study_id, user_id, settings):
        pass
