from flask import Flask, request
from flask_cors import CORS
from models.base import UserControl, Tag

app = Flask(__name__)
CORS(app)

USER_CONTROL = "user_control"
TAG = "tag"


@app.route('/documentation/<id>', methods=["POST"])
def update_user_control(id):

    uc = UserControl.upsert(
        where=UserControl.user_control_id == id,
        update=UserControl(
            user_control_id=id,
            description=request.get_json().get('description'))
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
