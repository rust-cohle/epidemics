import sys
import json
import base64
import numpy as np
import matplotlib.pyplot as plt

if len(sys.argv) != 3:
    print("Wrong number of arguments.")
    print("GENERATE_GRAPH path base64EncodedJson")
    raise SystemExit

# First argument is the path where to generate the graph image
path = sys.argv[1]

# Second argument is a Base64 encoded JSON
encodedJson = sys.argv[2]
decodedJson = base64.b64decode(encodedJson)
jsonObj = json.loads(decodedJson)

jsonObj = [{'counts': {'N': 82, 'D': 0, 'Im': 0, 'C': 18, 'In': 0}}, {'counts': {'N': 81, 'D': 0, 'Im': 0, 'C': 19, 'In': 0}}, {'counts': {'N': 81, 'D': 0, 'Im': 0, 'C': 19, 'In': 0}}, {'counts': {'N': 81, 'D': 0, 'Im': 0, 'C': 19, 'In': 0}}, {'counts': {'N': 79, 'D': 0, 'Im': 0, 'C': 21, 'In': 0}}, {'counts': {'N': 76, 'D': 0, 'Im': 0, 'C': 24, 'In': 0}}, {'counts': {'N': 72, 'D': 0, 'Im': 0, 'C': 28, 'In': 0}}, {'counts': {'N': 69, 'D': 0, 'Im': 0, 'C': 31, 'In': 0}}, {'counts': {'N': 68, 'D': 0, 'Im': 0, 'C': 32, 'In': 0}}, {'counts': {'N': 64, 'D': 0, 'Im': 0, 'C': 36, 'In': 0}}, {'counts': {'N': 61, 'D': 0, 'Im': 0, 'C': 39, 'In': 0}}, {'counts': {'N': 59, 'D': 0, 'Im': 0, 'C': 41, 'In': 0}}, {'counts': {'N': 55, 'D': 0, 'Im': 0, 'C': 45, 'In': 0}}, {'counts': {'N': 54, 'D': 0, 'Im': 0, 'C': 46, 'In': 0}}, {'counts': {'N': 52, 'D': 0, 'Im': 0, 'C': 48, 'In': 0}}, {'counts': {'N': 52, 'D': 0, 'Im': 0, 'C': 48, 'In': 0}}, {'counts': {'N': 49, 'D': 0, 'Im': 0, 'C': 51, 'In': 0}}, {'counts': {'N': 46, 'D': 0, 'Im': 0, 'C': 54, 'In': 0}}, {'counts': {'N': 45, 'D': 0, 'Im': 0, 'C': 55, 'In': 0}}, {'counts': {
    'N': 42, 'D': 0, 'Im': 0, 'C': 58, 'In': 0}}, {'counts': {'N': 36, 'D': 0, 'Im': 0, 'C': 64, 'In': 0}}, {'counts': {'N': 32, 'D': 0, 'Im': 0, 'C': 68, 'In': 0}}, {'counts': {'N': 24, 'D': 0, 'Im': 0, 'C': 76, 'In': 0}}, {'counts': {'N': 21, 'D': 0, 'Im': 0, 'C': 79, 'In': 0}}, {'counts': {'N': 19, 'D': 0, 'Im': 0, 'C': 81, 'In': 0}}, {'counts': {'N': 18, 'D': 0, 'Im': 0, 'C': 82, 'In': 0}}, {'counts': {'N': 16, 'D': 0, 'Im': 0, 'C': 84, 'In': 0}}, {'counts': {'N': 14, 'D': 0, 'Im': 0, 'C': 86, 'In': 0}}, {'counts': {'N': 8, 'D': 0, 'Im': 0, 'C': 92, 'In': 0}}, {'counts': {'N': 7, 'D': 0, 'Im': 0, 'C': 93, 'In': 0}}, {'counts': {'N': 7, 'D': 0, 'Im': 0, 'C': 93, 'In': 0}}, {'counts': {'N': 5, 'D': 0, 'Im': 0, 'C': 95, 'In': 0}}, {'counts': {'N': 5, 'D': 0, 'Im': 0, 'C': 95, 'In': 0}}, {'counts': {'N': 5, 'D': 0, 'Im': 0, 'C': 95, 'In': 0}}, {'counts': {'N': 3, 'D': 0, 'Im': 0, 'C': 97, 'In': 0}}, {'counts': {'N': 2, 'D': 0, 'Im': 0, 'C': 98, 'In': 0}}, {'counts': {'N': 0, 'D': 0, 'Im': 0, 'C': 100, 'In': 0}}, {'counts': {'N': 0, 'D': 0, 'Im': 0, 'C': 100, 'In': 0}}, {'counts': {'N': 0, 'D': 0, 'Im': 0, 'C': 100, 'In': 0}}]

def getTimeSeries(jsonObj, personType):
  timeSeries = [snapshot['counts'][personType] for snapshot in jsonObj]
  return np.array(timeSeries);


fig, ax = plt.subplots()

normalSeries = getTimeSeries(jsonObj, 'N')
contagiousSeries = getTimeSeries(jsonObj, 'C')

normalLine = ax.plot(normalSeries, label="Normal")
contagiousLine = ax.plot(contagiousSeries, label="Contagious")

ax.legend()
plt.savefig(path)
