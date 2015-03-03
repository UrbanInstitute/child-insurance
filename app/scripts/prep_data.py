import pandas as pd
import re

weights = {
  "ffmschip" : 0.55,
  "ffmnoschip" : 0.11,
  "sbmschip" : 0.17,
  "sbmnoschip" : 0.18,
  "1" : 0.377,
  "2" : 0.116,
  "3" : 0.261,
  "4" : 0.246
}

col_groups = {
  "1" : "<138%",
  "2" : "138-200%",
  "3" : "200-400%",
  "4" : ">400%"
}

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
    r['col_name'] = col_groups[g] if g in col_groups else None

  return pd.DataFrame(records)


if __name__ == '__main__':
  states = csvToDF('../data/stategroups.csv')
  incomes = csvToDF('../data/incomegroups.csv')
  states['chart'] = 'states'
  states['schip'] = states['group'].apply(
    lambda x : re.match('.*noschip.*', x) == None if x else False
  )
  incomes['chart'] = 'incomes'
  states.to_csv('../data/states.csv', index=False)
  incomes.to_csv('../data/incomes.csv', index=False)