from flask import Flask, request
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.sql import text

app = Flask(__name__)
CORS(app)

engine = create_engine('postgresql+psycopg2://postgres:password@db:5432/postgres')


@app.route('/documentation/<id>', methods=["POST"])
def updateDocument(id):

    s = text("SELECT * from tags where tag_id = :tag_id")
    result = engine.execute(s, {"tag_id": id}).all()

    if len(result) == 0:
        s = text("INSERT INTO tags (tag_id, description) VALUES (:tag_id, :description)")
    else:
        s = text("UPDATE tags SET description = :description WHERE tags.tag_id = :tag_id")

    engine.execute(s, {"description": request.get_json().get('description'), "tag_id": id})

    return "Success"


@app.route('/documentation/<id>', methods=["GET"])
def getDescription(id):

    s = text("SELECT * from tags where tag_id = :tag_id")

    result = engine.execute(s, {"tag_id": id}).one()

    return str(result[2])

@app.route("/greet")
def hello_world():
    return "hello world"

@app.route("/bye")
def bye():
    return "hello world"


