import os
import sys
import subprocess
import tempfile
import ffmpeg

from utils.minioUtils import create_s3_client, upload_to_s3
from utils.editingUtils import separate_audio_video, add_audio_to_video
from utils.mediaSelector import (
    wait_for_file,  
    generate_response,
    clear_up_api_folder)

s3_client = create_s3_client(
    os.environ["MINIO_ENDPOINT"],
    os.environ["ACCESS_KEY"],
    os.environ["SECRET_KEY"])


def audio_limiter(aud_in: str, aud_out: str, frame_size: float, compression_factor: float):
    """
    Applies a Limiter to the input audio file and creates a new updated audio file.
    :param aud_in: audio file to be processed
    :param aud_out: output audio file after processing
    :param frame_size: number of samples processed at once
    :param compression_factor: factor at which limiter is applied
    """
    audio_input = ffmpeg.input(aud_in)
    filter_graph = f'dynaudnorm=f={frame_size}:g={compression_factor}'
    audio_output = audio_input.output(aud_out, af=filter_graph)
    audio_output.run(quiet=True)


def audio_compressor(aud_in: str, aud_out: str, attack: float, peak: float, adjustment: float):
    """
    Applies a Compressor to the input audio file and creates a new updated audio file.
    :param aud_in: audio file to be processed
    :param aud_out: output audio file after processing
    :param attack: specifies the attack time
    :param peak: highest peak in audio
    :param adjustment: how much the peaks should be reduced by
    """
    audio_input = ffmpeg.input(aud_in)
    filter_graph = f'compand=attacks={attack}:points={peak}/{peak + adjustment}:0/10'
    audio_output = audio_input.output(aud_out, af=filter_graph)
    audio_output.run(quiet=True)


def audio_highpass_filter(aud_in: str, aud_out: str, cutoff_frequency: float):
    """
    Applies a Highpass Filter to the input audio file and creates a new updated audio file.
    :param aud_in: audio file to be processed
    :param aud_out: output audio file after processing
    :param cutoff_freq: frequency at which filter will be applied  
    """
    audio_input = ffmpeg.input(aud_in)
    filter_graph = f'highpass=f={cutoff_frequency}'
    audio_output = audio_input.output(aud_out, af=filter_graph)
    audio_output.run(quiet=True)


def apply_gain(aud_in: str, aud_out: str, gain_db: float):
    """
    Applies Gain to the input audio file and creates a new updated audio file.
    :param aud_in: audio file to be processed
    :param aud_out: output audio file after processing
    :param gain_db: gain in db that will be applied to audio  
    """
    filter_graph = f'[0:a]volume={gain_db}dB[audio]'
    ffmpeg.input(aud_in).output(aud_out, af=filter_graph).run(quiet=True)


def get_amplitude_info(aud_in: str):
    """
    Gets amplitude information from an input audio file
    :param aud_in: audio file to get information from
    """
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    command = [
        'ffmpeg',
        '-y',
        '-i', aud_in,
        '-af', 'astats=metadata=1:reset=1',
        '-f', 'null', temp_file.name
    ]
    peak_amplitude = None
    rms_amplitude = None
    result = subprocess.run(command, capture_output=True, text=True)

    for line in result.stderr.split('\n'):
        if 'Peak level' in line:
            peak_amplitude = float(line.split(' ')[-1])
        if 'RMS level' in line:
            rms_amplitude = float(line.split(' ')[-1])
    temp_file.close()
    return peak_amplitude, rms_amplitude


def get_dynamic_range(aud_in: str):
    """
    Uses the get_amplitude_info function to calculate the dynamic range of a given audio file.
    :param aud_in: audio file to calculate dynamic range of
    """
    p, r = get_amplitude_info(aud_in)
    return abs(p) - abs(r)


def auto_master(aud_in: str, aud_out: str):
    """
    Applies all of the audio mastering function to an input audio file and creates a new output file
    :param aud_in: input audio file to be mastered
    :param aud_out: mastered output file name
    """
    absolute_path = os.path.abspath(aud_in)
    p, _ = get_amplitude_info(absolute_path)
    dyn_range = get_dynamic_range(absolute_path)
    frame_size = 200
    compression_factor = 3
    attack = 200
    cut_off_freq = 20
    gain = 10

    temp_file_a = "temp_a.wav"
    temp_file_b = "temp_b.wav"
    temp_file_c = "temp_c.wav"

    try:
        audio_limiter(absolute_path, temp_file_a,
                      frame_size, compression_factor)
        audio_compressor(temp_file_a, temp_file_b, attack, p, dyn_range)
        apply_gain(temp_file_b, temp_file_c, gain)
        audio_highpass_filter(temp_file_a, aud_out, cut_off_freq)
    except ffmpeg.Error as e:
        print(f"Error during ffmpeg operation: {e}")
        raise e

    os.remove(temp_file_a)
    os.remove(temp_file_b)
    os.remove(temp_file_c)


def main(bucket_name):
    """
    Retrieves the finilised podcast from minio, extracts the audio, 
    applies audio mastering, combines new audio to video, uploads mastered podcast.
    :param bucket_name: the minio bucket containing the required project files.
    """
    clear_up_api_folder()

    object_key = "final-product/final_podcast.mp4"
    download_file_path = "master_temp.mp4"
    temp_output_vid = "tempv.mp4"
    temp_output_aud = "tempa.wav"
    final_aud = "finala.wav"
    final_podcast = "final_podcast_mastered.mp4"

    s3_client.download_file(
        bucket_name, object_key, download_file_path)

    wait_for_file(download_file_path)

    separate_audio_video(download_file_path, temp_output_vid, temp_output_aud)

    auto_master(temp_output_aud, final_aud)

    add_audio_to_video(download_file_path, final_aud, final_podcast)

    upload_to_s3(s3_client, final_podcast, bucket_name)

    response = generate_response(final_podcast, bucket_name)

    try:
        os.remove(temp_output_vid)
        os.remove(temp_output_aud)
        os.remove(final_aud)
        os.remove(download_file_path)
        os.remove(final_podcast)
        print("Files deleted successfully.")
    except Exception:
        print("Error, files not deleted", file=sys.stderr)
        response = {"Error": "Files not cleaned up"}

    return response
