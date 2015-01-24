import csv
import json


with open("lad_lookup.csv", "Ur") as lookup, open("lad_lookup.json", "w") as out:
    reader = csv.DictReader(lookup)
    json.dump(list(reader), out)


with open("lhb_lookup.csv", "Ur") as lookup, open("lhb_lookup.json", "w") as out:
    reader = csv.DictReader(lookup)
    json.dump(list(reader), out)