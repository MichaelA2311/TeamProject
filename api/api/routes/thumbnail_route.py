import json
from flask import Blueprint, request, jsonify

from utils import thumbnail


bp = Blueprint('thumbnail_route', __name__)


@bp.route("/get-thumbnail", methods=["POST"])
def get_thumbnail():
    """
    Fetches bucket and key of video file that thumbnail is to be generated from, 
    returns if it an audiofile.
    """
    data_str = request.data.decode('utf-8')
    data = json.loads(data_str)
    if data["key"].endswith(".mp4"):
        response = thumbnail.generate_thumbnail(data["bucket"], data["key"])
    else:
        response = {"error": "Audio file recieved", "error_code": 500}
    return jsonify(response)
