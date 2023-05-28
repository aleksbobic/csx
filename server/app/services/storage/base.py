from abc import ABC, abstractmethod
from typing import List, Union


class BaseStorageConnector(ABC):
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
    def insert_history_item(self, study_id: str, user_id: str, history_item_data: dict):
        pass

    @abstractmethod
    def delete_history_item(self, study_id, user_id, item_id):
        pass

    @abstractmethod
    def insert_study(self, study) -> dict:
        pass

    @abstractmethod
    def get_study(self, user_id, study_id) -> dict:
        pass

    @abstractmethod
    def get_user_studies(self, user_id) -> List[dict]:
        pass

    @abstractmethod
    def delete_study(self, user_id: str, study_id: str) -> None:
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

    @abstractmethod
    def insert_comment(
        self,
        user_id: str,
        study_id: str,
        history_id: str,
        comment: str,
        comment_time: str,
        screenshot: Union[str, None],
        screenshot_width: Union[int, None],
        screenshot_height: Union[int, None],
        chart: Union[str, None],
    ) -> str:
        pass

    @abstractmethod
    def delete_comment(
        self, user_id: str, study_id: str, history_id: str, comment_id: str
    ) -> None:
        pass

    @abstractmethod
    def edit_comment(
        self,
        study_id: str,
        user_id: str,
        history_item_id: str,
        comment_id: str,
        comment: str,
        comment_time: str,
        screenshot: Union[str, None],
        screenshot_width: Union[int, None],
        screenshot_height: Union[int, None],
        chart: Union[str, None],
    ):
        pass
