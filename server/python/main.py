import sys
import json
import base64

if len(sys.argv) != 2:
  print("Wrong number of arguments");
  raise SystemExit

# First argument is a Base64 encoded JSON
encodedJson = sys.argv[1]
decodedJson = base64.b64decode(encodedJson)
jsonObj = json.loads(decodedJson)
print(jsonObj)