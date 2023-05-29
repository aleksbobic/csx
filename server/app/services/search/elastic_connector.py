import os
from typing import Union

from app.services.search.base import BaseSearchConnector

from elasticsearch import Elasticsearch


class ElasticConnector(BaseSearchConnector):
    def __init__(self, hostname="csx_elastic", port="9200", retry_on_timeout=True):
        self.hostname = hostname
        self.port = port
        self.retry_on_timeout = retry_on_timeout
        self.connect()

    def __del__(self):
        self.disconnect()

    def connect(self) -> None:
        self.es = Elasticsearch(
            f"{self.hostname}:{self.port}",
            retry_on_timeout=self.retry_on_timeout,
            http_auth=("elastic", os.getenv("ELASTIC_PASSWORD")),
        )

    def disconnect(self) -> None:
        self.es.transport.close()

    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        dataset_index = self.es.indices.get(index=dataset_name)[dataset_name]

        if "properties" not in dataset_index["mappings"]:
            return None

        return dataset_index["mappings"]["properties"]
