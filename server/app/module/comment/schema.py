from typing import Optional, Union

from pydantic import BaseModel


class Comment(BaseModel):
    comment: str
    comment_time: str
    screenshot: Optional[Union[str, None]]
    screenshot_width: Optional[Union[str, None]]
    screenshot_height: Optional[Union[str, None]]
    chart: Optional[Union[str, None]]
