# Jack Hester
# Get only rows of interest in an ECS log file and save it to new csv
import pandas as pd
import numpy as np

# Load the original CSV file
df = pd.read_csv('/Users/jack/Downloads/logs may 28/logger_05-28-2023_15-44-54.csv')

# Criteria to filter (select) rows by
#criteria = (df['engineSequence'] == 'PROP_OPEN_1s') | (df['currentState'].isin(['CLOSE_PROP_1800','OPEN_PROP_1200']))
criteria = (df['engineSequence'].isin(['PROP_OPEN_1s','FIRE_TEST'])) | (df['currentState'].isin(['CLOSE_PROP_1800','OPEN_PROP_1200']))
indices = df[criteria].index

# Also get the 10 rows before and after for each index
extra_indices = []
for i in indices:
    extra_indices.extend(range(max(0, i-10), min(len(df), i+11)))

indices_to_keep = sorted(set(extra_indices))

df_filtered = df.loc[indices_to_keep]

# Add blanks between sets of rows that were originally consecutive to note break in log continuity
df_with_blanks = pd.DataFrame(columns=df.columns)
prev_idx = -1
for idx in indices_to_keep:
    if idx != prev_idx + 1 and prev_idx != -1:
        df_with_blanks = pd.concat([df_with_blanks, pd.DataFrame([np.full(len(df.columns), np.nan)], columns=df.columns)], ignore_index=True)
    df_with_blanks = pd.concat([df_with_blanks, df_filtered.loc[idx:idx]], ignore_index=True)
    prev_idx = idx

#df_filtered.to_csv('filtered_csvs/ker_waterflow.csv', index=False)
df_with_blanks.to_csv('/Users/jack/Downloads/logs may 28/filtered_csvs/ker_waterflow.csv', index=False)
