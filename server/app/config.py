from pydantic import BaseSettings


class Settings(BaseSettings):
    disable_upload: bool
    search_source: str
    elastic_password: str
    mongo_password: str
    mongo_username: str
    show_docs: bool
    show_external_sources: bool = True
    openalex_email: str = ""

    class Config:
        fields = {
            "disable_upload": {"env": "DISABLE_UPLOAD"},
            "search_source": {"env": "SEARCH_SOURCE"},
            "elastic_password": {"env": "ELASTIC_PASSWORD"},
            "mongo_password": {"env": "MONGO_PASSWORD"},
            "mongo_username": {"env": "MONGO_USERNAME"},
            "show_docs": {"env": "SHOW_DOCS"},
            "show_external_sources": {"env": "SHOW_EXTERNAL_SOURCES"},
            "openalex_email": {"env": "OPENALEX_EMAIL"},
        }


settings = Settings()
