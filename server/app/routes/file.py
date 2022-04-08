import pandas as pd
import json
import os

from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/upload")
def uploadfile(file: UploadFile):
    data = pd.read_csv(file.file)

    columns = data.dtypes.to_dict()

    for column in list(columns.keys()):
        if columns[column] == object:
            if isinstance(data.iloc[0][column], list):
                columns[column] = "list"
            else:
                columns[column] = "string"
        else:
            columns[column] = "number"

    directory_path = os.getcwd()
    print("My current directory is : " + directory_path)
    with open(f'./app/data/files/{file.filename.rpartition(".")[0]}.ndjson', "a") as f:
        for i, row in data.iterrows():
            f.write(json.dumps({"index": {"_id": i}}) + "\n")
            line_entry = {col: str(row[col]) for col in columns.keys()}
            f.write(json.dumps(line_entry) + "\n")

    return {"name": file.filename.rpartition(".")[0], "columns": columns}
