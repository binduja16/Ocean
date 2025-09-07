# backend/train_model.py
import pandas as pd
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

sst = pd.read_csv(os.path.join(DATA_DIR, "sst_sample.csv"), parse_dates=['date'])
fish = pd.read_csv(os.path.join(DATA_DIR, "fisheries_sample.csv"), parse_dates=['date'])
dna = pd.read_csv(os.path.join(DATA_DIR, "dna_sample.csv"), parse_dates=['date'])

# Merge on date & location (simple)
df = pd.merge(fish, sst, on=['date','lat','lon'], how='left')
df = pd.merge(df, dna[['date','lat','lon','species']], on=['date','lat','lon'], how='left')

# create dna_presence flag
df['dna_presence'] = df['species'].apply(lambda s: 1 if 'Tuna' in str(s) else 0)

# create label: high catch next day (this is demo; real labelling needs domain logic)
df = df.sort_values('date')
df['next_catch'] = df['catch_kg'].shift(-1)
df = df.dropna(subset=['next_catch'])
median = df['next_catch'].median()
df['label'] = (df['next_catch'] > median).astype(int)

# features
X = df[['sst','catch_kg','dna_presence']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=50, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

# save model
joblib.dump(clf, os.path.join(MODEL_DIR, "model.joblib"))
print("Saved model to models/model.joblib")
