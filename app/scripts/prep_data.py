import pandas as pd
import re

state_df = pd.read_csv('../data/stategroups.csv')
state_df.columns = ['scenario', 'group', 'number', 'rate']
state_df[state_df['group'] != "all"].to_csv('../data/states_cleaned.csv', index=False)

income_df = pd.read_csv('../data/incomegroups.csv')
income_df.columns = ['scenario', 'group', 'number', 'rate']
income_df.to_csv('../data/income_cleaned.csv', index=False)

def fixScenarios(df):
  df['king'] = df.apply(lambda x : return re.match('king'))