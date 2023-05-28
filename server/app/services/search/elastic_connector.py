import os

from app.services.search.base import BaseSearchConnector

from elasticsearch import Elasticsearch


class ElasticConnector(BaseSearchConnector):
    def __init__(self, hostname="elasticsearch", port="9200", retry_on_timeout=True):
        self.hostname = hostname
        self.port = port
        self.retry_on_timeout = retry_on_timeout
        self.connect()

    def connect(self) -> None:
        self.es = Elasticsearch(
            f"{self.hostname}:{self.port}",
            retry_on_timeout=self.retry_on_timeout,
            http_auth=("elastic", os.getenv("ELASTIC_PASSWORD")),
        )

    def disconnect(self) -> None:
        self.es.transport.close()
