import base64
import random
import uuid

from fastapi import APIRouter, status

router = APIRouter(prefix="/utils", tags=["utils"])


@router.get("/uuid")
def get_uuid() -> str:
    return uuid.uuid4().hex


@router.get(
    "/image",
    responses={200: {"content": {"image/png": {}}}},
    status_code=status.HTTP_200_OK,
)
def get_random_image():
    image_number = random.randint(1, 10)

    num_to_animal = [
        "parrot",
        "dog",
        "bird",
        "dog",
        "dog",
        "bunny",
        "dog",
        "cat",
        "dog",
        "cat",
    ]

    with open(f"./app/data/images/{image_number}.png", "rb") as f:
        base64image = base64.b64encode(f.read())

    return {"image": base64image, "animal": num_to_animal[image_number - 1]}
