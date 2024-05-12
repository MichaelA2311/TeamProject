import os
import subprocess
import pytest


def pytest_configure():
    """
    Sets up environmental variables for pytest running.
    :param config: Requried for pytest configuration.
    """
    os.environ['ACCESS_KEY'] = 'minio_user'
    os.environ['SECRET_KEY'] = 'minio_password'
    os.environ['MINIO_ENDPOINT'] = 'http://127.0.0.1:9000'


@pytest.fixture
def mock_audio_file(tmpdir):
    """
    Mocks an audio file to be used in tests, no need for static sample file
    :param tmpdir: Temporary directory to store mocked file.
    """
    # Create a temporary directory to store the mock audio file
    temp_dir = str(tmpdir.mkdir("mock_audio_files"))

    # Define parameters for the mock audio file
    duration_seconds = 10
    sample_rate = 44100
    channels = 2  


    # Define the file name for the mock audio file
    file_name = "mock_audio.wav"

    # Generate a synthetic audio file using ffmpeg
    file_path = os.path.join(temp_dir, file_name)
    command = [
        'ffmpeg', 
        '-f', 'lavfi', 
        '-i', 'anoisesrc', 
        '-t', str(duration_seconds), 
        '-ar', str(sample_rate), 
        '-ac', str(channels),  
        '-c:a', 'pcm_s16le', 
        file_path
    ]

    subprocess.run(command, check=True)

    return file_path

@pytest.fixture
def mock_video_file(tmpdir):
    """
    Mocks a video file to be used in tests, no need for static sample file
    :param tmpdir: Temporary directory to store mocked file.
    """
    # Create a temporary directory to store the mock video file
    temp_dir = str(tmpdir.mkdir("mock_video_files"))

    # Define parameters for the mock video file
    duration_seconds = 10
    width = 640
    height = 480
    framerate = 30

    # Define the file name for the mock video file
    file_name = "mock_video.mp4"

    # Generate a synthetic video file using ffmpeg
    file_path = os.path.join(temp_dir, file_name)
    command = [
        'ffmpeg', 
        '-f', 'lavfi', 
        '-i', f'color=s={width}x{height}:r={framerate}:d={duration_seconds}',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-t', str(duration_seconds),
        file_path
    ]

    subprocess.run(command, check=True)

    return file_path
