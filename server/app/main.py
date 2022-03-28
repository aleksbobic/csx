from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.util import router as util_router
from app.routes.search import router as search_router


def get_application():
    app = FastAPI(title="Collaboration Spotting", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(util_router, prefix="/util")
    app.include_router(search_router, prefix="/search")

    return app


app = get_application()
