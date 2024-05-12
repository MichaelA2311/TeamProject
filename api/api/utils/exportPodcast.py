import os
import sys
import json


from utils.minioUtils import create_s3_client, download_from_s3, upload_to_s3
from utils.mediaSelector import process_video_segments, align_and_merge_audio, attach_audio_to_video
from utils.editingUtils import separate_audio_video

s3_client = create_s3_client(
    os.environ["MINIO_ENDPOINT"],
    os.environ["ACCESS_KEY"],
    os.environ["SECRET_KEY"])

def timestamps_to_trim_sections(timestamp_file_path):
    """
    Takes timestamp file and finds trim sections
    :param timestamp_file_path: the path to the file containing timestamps
    :return trim_sections a list of tuples containing trim sections
    """
    with open(timestamp_file_path, 'rb') as f:
        timestamps = json.load(f)
    trim_sections = []
    for timestamp in timestamps:
        if not timestamp["enabled"]:
            payload = timestamp["payload"]
            trim_section = (payload["start"], payload["end"], 0) # need 0 for reasons
            trim_sections.append(trim_section)
    
    return trim_sections

def trim_to_keep(trim_sections):
    """
    Takes trim sections and turns this into segments to keep
    i.e. the inverse of trim!
    :param trim_sections: a list of tuples containing timestamps to trim
    :returns segments: a list of tuples containing timestamps to keep
    """
    segments = []
    last_end = 0.0

    for start, end, _ in trim_sections:
        segments.append((last_end, start, 0))
        last_end = end
    segments.append((last_end, None, 0))

    return segments
def getTimestamps(bucket: str) -> str:
    """
    Gets timestamp from bucket using s3 client
    :param bucket: string of bucket name
    :returns download_path | "": where the file is downloaded, or nothing if it could not be found
    """

    download_path = "timestamps.json"

    if not download_from_s3(s3_client, 
                            bucket,
                            "final-product/timestamps.json", 
                            download_path):
        return ""
    return download_path

def getPodcast(bucket):
    """
    Gets podcast from bucket using s3 client
    :param bucket: string of bucket name
    :returns download_path | "": where the file is downloaded, or nothing if it could not be found
    """
    
    download_path = "podcast.mp4"

    if not download_from_s3(s3_client,
                            bucket,
                            "final-product/final_podcast_mastered.mp4",
                            download_path):
        return ""
    return download_path

def clean_files():
    """
    Cleans files if they exist
    """

    files_to_clean = ["timestamps.json", "podcast.mp4", "i.mp4", "i.mp3", \
                      "final_podcast_trim.mp4", "final_podcast_trim.mp3", \
                      "final_podcast_export.mp3"]

    for file_to_clean in files_to_clean:
        if os.path.exists(file_to_clean):
            os.remove(file_to_clean)

def createFinalPodcast(bucket):
    """
    Runs the whole exporting process
    Including
        - Geting mastered podcast and timestamps
        - Finding sections to remove/keep
        - Running a ffmpeg pipeline to make the final exported podcast
        - Upload this to s3 bucket
        - Cleaning up
    """
    output_video_path = "final_podcast_trim.mp4"
    output_audio_path = "final_podcast_trim.mp3"
    output_file_path = "final_podcast_export.mp4"

    podcast_file_path = getPodcast(bucket)
    if not podcast_file_path:
        clean_files()
        raise FileNotFoundError("Could not find podcast in s3 bucket")
    timestamp_file_path = getTimestamps(bucket)

    if not timestamp_file_path: # since empty strings are falsey
        clean_files()
        raise Exception("Could not find timestamp from s3 bucket")

    trim_sections = timestamps_to_trim_sections(timestamp_file_path)
    if not trim_sections:
        print("No sections to trim", file=sys.stderr)
        os.rename(podcast_file_path, output_file_path)
        upload_to_s3(s3_client, output_file_path, bucket)
        clean_files()
        return
    kept_sections = trim_to_keep(trim_sections)

    
    
    separate_audio_video(podcast_file_path, "i.mp4", "i.mp3")
    
    process_video_segments({0: 'i.mp4'}, kept_sections, output_video_path, {})
    align_and_merge_audio({0: 'i.mp3'}, kept_sections, output_audio_path, {})
    attach_audio_to_video(output_video_path, output_audio_path, output_file_path)

    
    upload_to_s3(s3_client, output_file_path, bucket)
    clean_files()
