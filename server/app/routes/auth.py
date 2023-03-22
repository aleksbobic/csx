from typing_extensions import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, status


def verify_user_exists(user_id: Annotated[str, Header(convert_underscores=False)]):
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user_id
