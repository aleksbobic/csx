from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints.util import router as util_router
from app.api.endpoints.search import router as search_router

from app.api.endpoints.graph import router as graph_router
from app.api.endpoints.study import router as study_router
from app.api.endpoints.history import router as history_router
from app.api.endpoints.comment import router as comment_router
from app.api.endpoints.dataset import router as dataset_router
from app.api.endpoints.public import router as public_router


def get_application():
    app = FastAPI(title="Collaboration Spotting", version="1.3.0")

    app.include_router(util_router)
    app.include_router(search_router)
    app.include_router(graph_router)
    app.include_router(study_router)
    app.include_router(history_router)
    app.include_router(comment_router)
    app.include_router(dataset_router)
    app.include_router(public_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    return app


app = get_application()
