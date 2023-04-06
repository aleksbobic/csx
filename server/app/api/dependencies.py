import app.services.study.study as csx_study
from fastapi import Depends, Header, HTTPException, status
from typing_extensions import Annotated


def verify_user_exists(user_id: Annotated[str, Header(convert_underscores=False)]):
    """Get the user_id from the request header and verify that the user exists."""

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user_id


def get_current_study(
    study_id: str,
    user_id: str = Depends(verify_user_exists),
) -> dict:
    """Get the study_id from the request header and verify that the study exists."""

    if not study_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    study = csx_study.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    return study
