import sys, json

for line in sys.stdin:
    obj = {
        "imageUrl": line, 
        "boundary": {
            "x": 10, 
            "y": 10, 
            "w": 20, 
            "h": 20
        }
    }
    print(json.dumps(obj))
