from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.util import router as util_router
from app.routes.search import router as search_router

from app.routes.graph import router as graph_router
from app.routes.study import router as study_router
from app.routes.history import router as history_router
from app.routes.comment import router as comment_router
from app.routes.dataset import router as dataset_router

import os


def get_application():
    app = FastAPI(title="Collaboration Spotting", version="1.0.0")

    app.include_router(util_router)
    app.include_router(search_router)
    app.include_router(graph_router)
    app.include_router(study_router)
    app.include_router(history_router)
    app.include_router(comment_router)
    app.include_router(dataset_router)

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
