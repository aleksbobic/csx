from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.util import router as util_router
from app.routes.search import router as search_router
from app.routes.file import router as file_router


def get_application():
    app = FastAPI(title="Collaboration Spotting", version="1.0.0")

    app.include_router(util_router, prefix="/util")
    app.include_router(search_router, prefix="/search")
    app.include_router(file_router, prefix="/file")

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
