import json


def isJson(testStr):
    try:
        json.loads(testStr)
        return True
    except:
        return False


def isNumber(testStr):
    try:
        float(testStr)
        return True
    except:
        return False
