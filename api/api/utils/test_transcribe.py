import os
import librosa
from utils.transcribe import (
    get_audio_from_video,
    get_json_transcript
    )
from utils.editingUtils import add_audio_to_video

def test_get_audio_from_video(mock_video_file, mock_audio_file):
    """
    GIVEN a mock video and audio file, audio is attatched to video file
    WHEN the audio is extracted from the video file
    THEN ensure the extracted audio file exists
    """
    dest_path = "temp"
    out_file = "audioout.wav"
    in_file = "testvideo.mp4"
    add_audio_to_video(mock_video_file, mock_audio_file, in_file)
    get_audio_from_video(in_file, dest_path, out_file)
    output_file = os.path.realpath(os.path.join(dest_path, out_file))
    assert os.path.exists(output_file)
    os.remove(output_file)
    os.remove(in_file)

def test_get_json_transcript():
    """
    GIVEN a sample audio file containing spoken english 
    WHEN a transcript is generated from the audio
    THEN ensure it exists and is in the required format
    """
    sample = librosa.example("libri2")
    transcript = get_json_transcript(sample)
    assert len(transcript) > 0 and "text" in transcript
