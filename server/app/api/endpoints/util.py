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

            # Get top 10 action indices
            top3_probabilities, top10_indices = torch.topk(output, 30)

            processed_suggestions = [
                label_lookup[index]["label"] for index in top10_indices[0].tolist()
            ]

            # Should be multiple schemas in the input we are only interested in the last one
            processed_input = [json.loads(entry) for entry in rec_input][-1]
            print("\n\n\nprocessed_input: ", processed_input)

            filtered_suggestions = []

            def is_in_processed_input(src, dst, start_schema):
                for edge in start_schema:
                    if edge["src"] == src and edge["dst"] == dst:
                        return True
                return False

            add_edge_counter = 0
            remove_edge_counter = 0
            modify_edge_counter = 0

            for entry in processed_suggestions:
                action = entry.split(" ", 1)[0]
                print(entry.split(" ", 1)[1])
                value = json.loads(entry.split(" ", 1)[1])

                if (
                    action == "change_edge"
                    and is_in_processed_input(
                        value["src"], value["dst"], processed_input
                    )
                    and modify_edge_counter < 2
                ):
                    filtered_suggestions.append({"action": action, "value": value})
                    modify_edge_counter += 1

                if (
                    action == "add_edge"
                    and not is_in_processed_input(
                        value["src"], value["dst"], processed_input
                    )
                    and add_edge_counter < 2
                    and add_edge_counter + remove_edge_counter < 3
                ):
                    filtered_suggestions.append({"action": action, "value": value})
                    add_edge_counter += 1

                if (
                    action == "remove_edge"
                    and is_in_processed_input(
                        value["src"], value["dst"], processed_input
                    )
                    and remove_edge_counter < 2
                    and add_edge_counter + remove_edge_counter < 3
                ):
                    filtered_suggestions.append({"action": action, "value": value})
                    remove_edge_counter += 1

                if len(filtered_suggestions) == 4:
                    break

            return filtered_suggestions

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

        # Get top 10 action indices
        top3_probabilities, top10_indices = torch.topk(output, 30)

        processed_suggestions = [
            label_lookup[index]["label"] for index in top10_indices[0].tolist()
        ]

        schema_dict = json.loads(rec_input[-1])

        filtered_suggestions = []

        add_property_counter = 0
        add_edge_counter = 0
        change_node_counter = 0
        remove_edge_counter = 0
        remove_prop_counter = 0

        for entry in processed_suggestions:
            action = entry.split(" ")[0]
            value = entry.split(" ")[1]

            if (
                action in ["add_edge", "add_property"]
                and value not in schema_dict["properties"]
                and value not in schema_dict["edges"]
                and not value == schema_dict["node"]
            ):
                if action == "add_edge":
                    if add_edge_counter < 1:
                        filtered_suggestions.append({"action": action, "value": value})
                        add_edge_counter += 1
                if action == "add_property":
                    if add_property_counter < 1:
                        filtered_suggestions.append({"action": action, "value": value})
                        add_property_counter += 1
            if action == "remove_property" and value in schema_dict["properties"]:
                if remove_prop_counter < 1:
                    filtered_suggestions.append({"action": action, "value": value})
                    remove_prop_counter += 1
            if action == "remove_edge" and value in schema_dict["edges"]:
                if remove_edge_counter < 1:
                    filtered_suggestions.append({"action": action, "value": value})
                    remove_edge_counter += 1
            if (
                action == "change_node"
                and value != schema_dict["node"]
                and value not in schema_dict["properties"]
                and value not in schema_dict["edges"]
            ):
                if change_node_counter < 1:
                    filtered_suggestions.append({"action": action, "value": value})
                    change_node_counter += 1

            if len(filtered_suggestions) == 4:
                break

        return filtered_suggestions

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
        top3_probabilities, top5_indices = torch.topk(output, 9)

        processed_suggestions = [
            get_schema_label(index, schema_lookup) for index in top5_indices[0].tolist()
        ]

        return processed_suggestions
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
