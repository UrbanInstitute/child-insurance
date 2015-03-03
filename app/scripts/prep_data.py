import pandas as pd
import json

with open('../data/weights.json') as weightjson:
  weights = json.load(weightjson)

scenarios = {
  "noaca" :       {"aca" : False, "king" : False, "scenario" : "current"},
  "currentaca" :  {"aca" : True, "king" : False, "scenario" : "current"},
  "acanoschip" :  {"aca" : True, "king" : False, "scenario" : "noschip"},
  "acanomoe" :    {"aca" : True, "king" : False, "scenario" : "nomoe"},
  "king" :        {"aca" : True, "king" : True, "scenario" : "current"},
  "kingnoschip" : {"aca" : True, "king" : True, "scenario" : "noschip"},
  "kingnomoe" :   {"aca" : True, "king" : True, "scenario" : "nomoe"}
}

def csvToDF(csvfile):
  df = pd.read_csv(csvfile)
  df.columns = ['scenario', 'group', 'number', 'rate']
  records = df.to_dict('records')
  for r in records:
    s = r['scenario']
    r['aca'] = scenarios[s]['aca']
    r['king'] = scenarios[s]['king']
    r['scenario'] = scenarios[s]['scenario']
    g = str(r['group'])
    r['weight'] = weights[g] if g != "all" else 1

  return pd.DataFrame(records)


if __name__ == '__main__':
  states = csvToDF('../data/stategroups.csv')
  incomes = csvToDF('../data/incomegroups.csv')
  states['chart'] = 'states'
  incomes['chart'] = 'incomes'
  states.to_csv('../data/states.csv', index=False)
  incomes.to_csv('../data/incomes.csv', index=False)