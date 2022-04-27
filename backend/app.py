from flask import Flask, request
from flask_cors import CORS
from models.base import UserControl, Tag, UserControlTag
import sqlalchemy as sa
import logging

app = Flask(__name__)
CORS(app)
LOGGER = logging.getLogger(__name__)


@app.route('/documentation/<id>', methods=["POST"])
def update_user_control(id):
    uc = UserControl.upsert(
        where=UserControl.user_control_id == id,
        update=UserControl(
            user_control_id=id,
            description=request.get_json().get('description'),
            location=request.get_json().get('location'))
    )
    return uc.as_dict()


@app.route('/documentation/<id>', methods=["GET"])
def get_user_control(id):
    uc = UserControl.get_one(where=UserControl.user_control_id == id)
    return uc.as_dict()


@app.route('/tag', methods=["POST"])
def addTag():
    tag = Tag.create(description=request.get_json().get('description'))
    return tag.as_dict()


@app.route('/tag/<id>', methods=['GET'])
def getTagById(id):
    tag = Tag.get_one(where=Tag.id == id)
    return tag.as_dict()


@app.route('/tag', methods=['GET'])
def getTag():
    tags = Tag.get()
    return {"tags": list(map(lambda t: t.as_dict(), tags))}


@app.route('/documentation/<id>/tag', methods=["POST"])
def tagUserControl(id):
    result = []
    for tag in request.get_json().get("tags"):
        t = UserControlTag.create(user_control_id=id, tag_id=tag)
        result.append(t.as_dict())

    return {"added_tags": result}


@app.route('/documentation/<id>/tag', methods=["PATCH"])
def tagUserControlDelete(id):
    result = 0
    for tag in request.get_json().get("tags"):
        deleted = UserControlTag.delete(
            where=sa.and_(UserControlTag.user_control_id == id, UserControlTag.tag_id == tag))
        result += len(deleted)

    return {"deleted_tags": result}


@app.route('/documentation/<id>/tag', methods=["GET"])
def getTagByUserControl(id):
    result = []
    for tag in UserControlTag.get(where=UserControlTag.user_control_id == id):
        result.append(tag.as_dict())

    return {"tags": result}
