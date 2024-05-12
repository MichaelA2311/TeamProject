import json
from flask import Blueprint, request, jsonify
from utils import mediaSelector

bp = Blueprint('merge_route', __name__)


@bp.route("/merge-files", methods=["POST"])
def merge_files():
    """
    Merges files in project folder into one file.
    """
    data_str = request.data.decode('utf-8')
    data = json.loads(data_str)
    response = mediaSelector.main(data["bucket"])
    return jsonify(response)
