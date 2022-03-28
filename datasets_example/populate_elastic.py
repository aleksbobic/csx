import requests
import sys

requests.put(f"http://localhost:9200/{sys.argv[1]}?pretty")

headers = {"Content-Type": "application/x-ndjson"}

data = open(sys.argv[2], "rb").read()

requests.post(
    f"http://localhost:9200/{sys.argv[1]}/_bulk?pretty", headers=headers, data=data
)
