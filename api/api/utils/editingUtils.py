import ffmpeg
import audiosegment


def separate_audio_video(input_file: str, output_video_file: str, output_audio_file: str):
    """
    Separates audio and video streams from a file.

    :param input_file: str - Path to the input file.
    :param output_video_file: str - Path to the output video file (no audio).
    :param output_audio_file: str - Path to the output audio file.
    """

    ffmpeg.input(input_file).output(
        output_video_file,
        an=None).run(
            overwrite_output=True, quiet=True)
    ffmpeg.input(input_file).output(
        output_audio_file,
        vn=None).run(
            overwrite_output=True, quiet=True)


def add_audio_to_video(video_file: str, audio_file: str, output_file: str):
    """
    Adds or replaces an audio track in a video file.

    :param video_file: str - Path to the video file.
    :param audio_file: str - Path to the audio file to add to the video.
    :param output_file: str - Path to the output video file.
    """

    input_video = ffmpeg.input(video_file)
    input_audio = ffmpeg.input(audio_file)
    try:
        ffmpeg.output(
            input_video.video,
            input_audio.audio,
            output_file,
            acodec='aac').run(
                overwrite_output=True, quiet=True)
    except ffmpeg.Error as e:
        print(f"Error during ffmpeg operation: {e}")
        raise e


def read_file_to_array(filename, sample_rate_Hz=32_000):
    audio = audiosegment.from_file(filename).resample(sample_rate_Hz=sample_rate_Hz,
                                                      sample_width=2,
                                                      channels=1)
    array = audio.to_numpy_array()
    return array
