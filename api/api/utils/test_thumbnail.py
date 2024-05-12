import os
from utils.thumbnail import get_first_5_secs_frame

def test_get_first_5_secs_frame(mock_video_file):
    """
    GIVEN a video file
    WHEN a thumbnail is extracted from video
    THEN check is has been successfully created
    """
    output_file = "thumbnail.jpg"
    thumbnail_created = get_first_5_secs_frame(mock_video_file, output_file)
    os.remove(output_file)
    assert thumbnail_created
