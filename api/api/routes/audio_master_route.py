import json
from flask import Blueprint, request, jsonify
from utils import audio_master

bp = Blueprint('audio_master_route', __name__)


@bp.route("/audio-master", methods=["POST"])
def merge_files():
    """
    Applies audio mastering to the provided podcast file.
    """
    data_str = request.data.decode('utf-8')
    data = json.loads(data_str)
    response = audio_master.main(data["bucket"])
    return jsonify(response)
