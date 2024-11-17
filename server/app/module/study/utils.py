from typing import Any, Dict, List


def extract_comments(comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract comments from a list of comment dictionaries.

    Args:
        comments (List[Dict[str, Any]]): The list of comment dictionaries.

    Returns:
        List[Dict[str, Any]]: The extracted comments.
    """
    return [
        {
            "id": str(comment["_id"]),
            "comment": comment["comment"],
            "time": comment["time"],
            "screenshot": comment["screenshot"],
            "screenshot_width": comment["screenshot_width"],
            "screenshot_height": comment["screenshot_height"],
            "chart": comment["chart"],
        }
        for comment in comments
    ]


def format_study_response(
    study: Dict[str, Any],
    history_item: Dict[str, Any],
    history: List[Dict[str, Any]],
    charts: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Format the study response.

    Args:
        study (Dict[str, Any]): The study dictionary.
        history_item (Dict[str, Any]): The history item dictionary.
        history (List[Dict[str, Any]]): The list of history items.
        charts (List[Dict[str, Any]]): The list of charts.

    Returns:
        Dict[str, Any]: The formatted study response.
    """
    return {
        "graph": history_item.get(history[-1]["graph_type"], {}),
        "study_name": study["study_name"],
        "study_description": study["study_description"],
        "study_author": study.get("study_author", ""),
        "history": history,
        "index": study["index"],
        "charts": charts,
        "empty": False,
        "public": study["public"],
        "public_url": study["public_url"],
    }
