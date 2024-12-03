"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table(
    'species',
    Field('COMMON_NAME', 'string')
)

db.define_table(
    'sightings',
    Field('SAMPLING_EVENT_IDENTIFIER', 'string'),
    Field('COMMON_NAME', 'string'),
    Field('OBSERVATION_COUNT', 'string')
)

db.define_table(
    'checklist',
    Field('SAMPLING_EVENT_IDENTIFIER', 'string'),
    Field('LATITUDE', 'double'),
    Field('LONGITUDE', 'double'),
    Field('OBSERVATION_DATE', 'date'),
    Field('TIME_OBSERVATIONS_STARTED', 'time'),
    Field('OBSERVER_ID', 'string'),
    Field('DURATION_MINUTES', 'double')
)

# Define a mapping of table names to their corresponding CSV file paths
seed_data = {
    "species": r"apps/birds/uploads/species.csv",
    "sightings": r"apps/birds/uploads/sightings.csv",
    "checklist": r"apps/birds/uploads/checklists.csv",
}

# Loop through the mapping and process each table
for table_name, csv_path in seed_data.items():
    if db(db[table_name]).isempty():  # Check if the table is empty
        with open(os.path.join(os.getcwd(), csv_path), 'r') as dumpfile:
            db[table_name].import_from_csv_file(dumpfile)  # Import data
        db.commit()  # Commit changes

# #specied data 
# if db(db.species).isempty():
#     with open('apps/birds/uploads/species.csv', 'r') as f:
#         reader = csv.reader(f)
#         next(reader)  #skip header row
#         for row in reader:
#             db.species.insert(name=row[0])  
#     db.commit()

# #checklists data
# if db(db.checklist).isempty():
#     with open('apps/birds/uploads/checklists.csv', 'r') as f:
#         reader = csv.reader(f)
#         next(reader)  #skip the header row
#         for row in reader:
#             db.checklist.insert(
#                 user_email=row[0],  
#                 location=row[1],    
#                 date=row[2],        
#                 SAMPLING_EVENT_IDENTIFIER=row[3]  
#             )
#     db.commit()

# #sightings data 
# if db(db.sightings).isempty():
#     with open('apps/birds/uploads/sightings.csv', 'r') as f:
#         reader = csv.reader(f)
#         next(reader)  #skip the header row
#         for row in reader:
#             try:
#                 OBSERVATION_COUNT = int(row[2])  
#             except ValueError:
#                 OBSERVATION_COUNT = 0

#             db.sightings.insert(
#                 SAMPLING_EVENT_IDENTIFIER=row[0],  t
#                 COMMON_NAME=row[1],  
#                 OBSERVATION_COUNT=OBSERVATION_COUNT,  
#                 user_email=None  
#             )
#     db.commit()

db.commit()
