import os
import subprocess
import numpy as np
from utils.audio_master import (
    audio_limiter,  
    audio_compressor,
    audio_highpass_filter,
    apply_gain)

LENGTH_TOLERANCE = 0.1

def test_audio_limiter(mock_audio_file):
    """
    GIVEN an input audio file
    WHEN the audio file is limited
    THEN ensure the limiter has been applied and the length has not changed
    """
    temp_output_file = "temp_limiter.wav"
    audio_limiter(mock_audio_file, temp_output_file, 200, 3)

    original_length = get_audio_length(mock_audio_file)
    processed_length = get_audio_length(temp_output_file)

    assert np.isclose(original_length, processed_length, atol=LENGTH_TOLERANCE)
    assert not is_identical_audio(mock_audio_file, temp_output_file)

    os.remove(temp_output_file)


def test_audio_compressor(mock_audio_file):
    """
    GIVEN an input audio file
    WHEN the audio file is compressed
    THEN ensure the compressor has been applied and the length has not changed

    """
    temp_output_file = "temp_compressor.wav"
    audio_compressor(mock_audio_file, temp_output_file, 200, 0.9, 6)

    original_length = get_audio_length(mock_audio_file)
    processed_length = get_audio_length(temp_output_file)

    assert np.isclose(original_length, processed_length, atol=LENGTH_TOLERANCE)
    assert not is_identical_audio(mock_audio_file, temp_output_file)

    os.remove(temp_output_file)


def test_audio_highpass_filter(mock_audio_file):
    """
    GIVEN an input audio file
    WHEN the audio file is put through highpass filter
    THEN ensure the filter has been applied and the length has not changed

    """
    temp_output_file = "temp_highpass.wav"
    audio_highpass_filter(mock_audio_file, temp_output_file, 200)

    original_length = get_audio_length(mock_audio_file)
    processed_length = get_audio_length(temp_output_file)

    assert np.isclose(original_length, processed_length, atol=LENGTH_TOLERANCE)
    assert not is_identical_audio(mock_audio_file, temp_output_file)

    os.remove(temp_output_file)


def test_apply_gain(mock_audio_file):
    """
    GIVEN an input audio file
    WHEN the audio file has gain applied
    THEN ensure the gain has been applied and the length has not changed

    """
    temp_output_file = "temp_gain.wav"
    apply_gain(mock_audio_file, temp_output_file, 10)

    original_length = get_audio_length(mock_audio_file)
    processed_length = get_audio_length(temp_output_file)

    assert np.isclose(original_length, processed_length, atol=LENGTH_TOLERANCE)
    assert not is_identical_audio(mock_audio_file, temp_output_file)

    os.remove(temp_output_file)


def get_audio_length(file_path):
    """
    Mock function to get audio length (in seconds).
    : param file_path: file to have length retrieved
    """
    result = subprocess.run(['ffmpeg', '-i', file_path], stderr=subprocess.PIPE)
    output = result.stderr.decode('utf-8')
    duration_index = output.find("Duration:")
    duration_str = output[duration_index:duration_index+21] 
    duration_parts = duration_str.split(",")[0].split(":")[1:] 
    duration_seconds = (
        int(duration_parts[0]) * 3600 + 
        int(duration_parts[1]) * 60 + 
        float(duration_parts[2])
    )
    return duration_seconds


def is_identical_audio(file_path1, file_path2):
    """
    Mock function to check if two audio files are identical.
    : param file_path1:
    : param file_path2: 
    """
    cmd = ['ffmpeg', '-i', file_path1, '-i', file_path2, '-filter_complex',
           'diff=-1,ametadata=print:file=-', '-f', 'null', '-']
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if "Total similarity" in result.stdout:
        return True
    return False
