import base64
import random
import uuid
import torch
import json
import torch.nn as nn
from pydantic import BaseModel
from typing import Dict, List, Literal, Optional, Union

from fastapi import APIRouter, status

router = APIRouter(prefix="/utils", tags=["utils"])


@router.get("/uuid")
def get_uuid() -> str:
    return uuid.uuid4().hex


@router.get(
    "/image",
    responses={200: {"content": {"image/png": {}}}},
    status_code=status.HTTP_200_OK,
)
def get_random_image():
    image_number = random.randint(1, 10)

    num_to_animal = [
        "parrot",
        "dog",
        "bird",
        "dog",
        "dog",
        "bunny",
        "dog",
        "cat",
        "dog",
        "cat",
    ]

    with open(f"./app/data/images/{image_number}.png", "rb") as f:
        base64image = base64.b64encode(f.read())

    return {"image": base64image, "animal": num_to_animal[image_number - 1]}


class MultiActionDetailLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=1, dropout=0.0):
        super(MultiActionDetailLSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, (h_n, c_n) = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out


class MultiActionOverviewLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=1, dropout=0.0):
        super(MultiActionOverviewLSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, (h_n, c_n) = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out


class MultiSchemaDetailLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=1, dropout=0.0):
        super(MultiSchemaDetailLSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, (h_n, c_n) = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out


class MultiSchemaOverviewLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=1, dropout=0.0):
        super(MultiSchemaOverviewLSTM, self).__init__()
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, (h_n, c_n) = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out


def read_data(filename):
    data = []
    with open(f"./app/data/lookup_files/{filename}.json", "r") as f:
        data = json.load(f)
    return data


def get_schema_id(schema, lookup):
    for entry in lookup:
        if entry["schema"] == schema:
            return entry["id"]


def extract_schema_ids(session, lookup):
    return [get_schema_id(schema, lookup) for schema in session]


def one_hot_encode(action, action_count):
    one_hot = torch.zeros(action_count)
    print(f"the actions is: {action} and its type is {type(action)}")
    one_hot[action] = 1
    return one_hot


def sequence_to_one_hot(sequence, action_count):
    return torch.stack([one_hot_encode(action, action_count) for action in sequence])


def get_schema_label(schema_id, schemas_lookup):
    for entry in schemas_lookup:
        if entry["id"] == schema_id:
            return entry["schema"]
    return 0


class ReccmmendationData(BaseModel):
    schematype: str
    rectype: str
    recinput: List[str]


@router.post("/recommendation", status_code=status.HTTP_200_OK)
def get_recommendation(data: ReccmmendationData):
    schema_type = data.schematype
    rec_type = data.rectype
    rec_input = data.recinput

    if rec_type == "action":
        if schema_type == "detail":
            MODEL_PATH = "./app/data/models/2.4._lstm_model_v1.pth"

            schema_lookup = read_data("action_rec_detail_schema_lookup")
            label_lookup = read_data("action_rec_detail_label_lookup")

            model = MultiActionDetailLSTM(
                input_size=len(schema_lookup),
                hidden_size=32,
                output_size=len(label_lookup),
                num_layers=4,
                dropout=0.2,
            )

            model.load_state_dict(torch.load(MODEL_PATH))
            model.eval()

            sample_input_ids = extract_schema_ids(rec_input, schema_lookup)
            sample_input_onehot = sequence_to_one_hot(
                sample_input_ids, len(schema_lookup)
            )
            sample_input_tensor = torch.stack([sample_input_onehot])

            with torch.no_grad():
                output = model(sample_input_tensor)

            # Get top 3 action indices
            top3_probabilities, top3_indices = torch.topk(output, 3)

            return [label_lookup[index]["label"] for index in top3_indices[0].tolist()]

        MODEL_PATH = "./app/data/models/2.3._lstm_model_v1.2.pth"

        schema_lookup = read_data("action_rec_overview_schema_lookup")
        label_lookup = read_data("action_rec_overview_label_lookup")

        model = MultiActionOverviewLSTM(
            input_size=len(schema_lookup),
            hidden_size=32,
            output_size=len(label_lookup),
            num_layers=4,
            dropout=0.2,
        )

        model.load_state_dict(torch.load(MODEL_PATH))
        model.eval()

        sample_input_ids = extract_schema_ids(rec_input, schema_lookup)
        sample_input_onehot = sequence_to_one_hot(sample_input_ids, len(schema_lookup))
        sample_input_tensor = torch.stack([sample_input_onehot])

        with torch.no_grad():
            output = model(sample_input_tensor)

        # Get top 3 action indices
        top3_probabilities, top3_indices = torch.topk(output, 3)

        return [label_lookup[index]["label"] for index in top3_indices[0].tolist()]

    if schema_type == "detail":
        MODEL_PATH = "./app/data/models/2.2._lstm_model_v1.pth"

        schema_lookup = read_data("detail_schemas_lookup")

        model = MultiSchemaDetailLSTM(
            input_size=len(schema_lookup),
            hidden_size=32,
            output_size=len(schema_lookup),
            num_layers=1,
            dropout=0.8,
        )

        model.load_state_dict(torch.load(MODEL_PATH))
        model.eval()

        sample_input_ids = extract_schema_ids(rec_input, schema_lookup)
        sample_input_onehot = sequence_to_one_hot(sample_input_ids, len(schema_lookup))
        sample_input_tensor = torch.stack([sample_input_onehot])

        with torch.no_grad():
            output = model(sample_input_tensor)

        # Get top 3 action indices
        top3_probabilities, top3_indices = torch.topk(output, 3)

        return [
            get_schema_label(index, schema_lookup) for index in top3_indices[0].tolist()
        ]
    MODEL_PATH = "./app/data/models/2.1._lstm_model_v1.pth"

    schema_lookup = read_data("overview_schemas_lookup")

    model = MultiSchemaOverviewLSTM(
        input_size=len(schema_lookup),
        hidden_size=32,
        output_size=len(schema_lookup),
        num_layers=1,
        dropout=0.8,
    )

    model.load_state_dict(torch.load(MODEL_PATH))
    model.eval()

    def get_schema_id_for_overview(schema, schema_lookup):
        for entry in schema_lookup:
            if json.dumps(entry["schema"]) == schema:
                return entry["id"]
        return 0

    def extract_ids_for_overview(session, schema_lookup):
        return [get_schema_id_for_overview(schema, schema_lookup) for schema in session]

    sample_input_ids = extract_ids_for_overview(rec_input, schema_lookup)
    sample_input_onehot = sequence_to_one_hot(sample_input_ids, len(schema_lookup))
    sample_input_tensor = torch.stack([sample_input_onehot])

    with torch.no_grad():
        output = model(sample_input_tensor)

    # Get top 3 action indices
    top3_probabilities, top3_indices = torch.topk(output, 3)

    return [
        get_schema_label(index, schema_lookup) for index in top3_indices[0].tolist()
    ]
