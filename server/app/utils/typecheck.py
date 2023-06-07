import json


def isJson(testStr):
    try:
        json.loads(testStr)
    except:
        return False
    return True


def isNumber(testStr):
    try:
        float(testStr)
    except:
        return False
    return True
