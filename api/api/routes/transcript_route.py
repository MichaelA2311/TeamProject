import json
from flask import Blueprint, jsonify, request
from utils import transcribe

bp = Blueprint('transcript_route', __name__)


@bp.route("/get-transcript", methods=["POST"])
def get_transcript():
    """
    This method gets :
        the relative video file path
        temporary folder
        name of the output audio file that will be produced
        boolean to determine if the produced audio file should be sampled at 16kHz
    from the front-end and passes them to the transcription logic
    The response is a json that is returned to the front end
    """

    data_str = request.data.decode('utf-8')
    data = json.loads(data_str)
    response = transcribe.process_video_to_JSON(
        data['video_file_path'], data["temp_folder"],
        data["output_file_name"], data["isCompressed"])
    return jsonify(response)
