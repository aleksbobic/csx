from app.api.dependencies import get_storage_connector, verify_user_exists
from app.schemas.comment import Comment
from app.services.storage.base import BaseStorageConnector
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix=("/studies/{study_id}/history/{history_item_id}/comments"), tags=["comments"]
)


@router.post("", status_code=status.HTTP_201_CREATED)
def add_comment(
    data: Comment,
    study_id: str,
    history_item_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> JSONResponse:
    """
    Add a new comment to a history item in a study.

    Args:
        data (Comment): The comment data.
        study_id (str): The ID of the study.
        history_item_id (str): The ID of the history item.
        user_id (str): The ID of the user (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        str: The ID of the newly created comment.
    """
    try:
        comment_id = storage.insert_comment(
            user_id, study_id, history_item_id, **data.dict()
        )
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add comment",
        )

    return JSONResponse(
        content={"comment_id": comment_id}, status_code=status.HTTP_201_CREATED
    )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    study_id: str,
    history_item_id: str,
    comment_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> Response:
    """
    Delete a comment from a history item in a study.

    Args:
        study_id (str): The ID of the study.
        history_item_id (str): The ID of the history item.
        comment_id (str): The ID of the comment to delete.
        user_id (str): The ID of the user (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        Response: A response with status code 204 (No Content).
    """
    try:
        storage.delete_comment(user_id, study_id, history_item_id, comment_id)
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete comment",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{comment_id}", status_code=status.HTTP_200_OK)
def edit_comment(
    data: Comment,
    study_id: str,
    history_item_id: str,
    comment_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> Response:
    """
    Edit an existing comment in a history item in a study.

    Args:
        data (Comment): The updated comment data.
        study_id (str): The ID of the study.
        history_item_id (str): The ID of the history item.
        comment_id (str): The ID of the comment to edit.
        user_id (str): The ID of the user (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        Response: A response with status code 200 (OK).
    """
    try:
        storage.edit_comment(
            study_id, user_id, history_item_id, comment_id, **data.dict()
        )
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not edit comment",
        )

    return Response(status_code=status.HTTP_200_OK)
