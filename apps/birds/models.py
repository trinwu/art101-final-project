"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *
import os
import csv

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()

### Define your table below
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

db.define_table(
    'my_checklist',
    Field('SAMPLING_EVENT_IDENTIFIER', 'string'),
    Field('COMMON_NAME', 'string'),
    Field('LATITUDE', 'double'),
    Field('LONGITUDE', 'double'),
    Field('OBSERVATION_DATE', 'date'),
    Field('TIME_OBSERVATIONS_STARTED', 'time'),
    Field('OBSERVER_ID', 'string'),
    Field('DURATION_MINUTES', 'double'),
    Field('OBSERVATION_COUNT', 'double'),
    Field('user_email', default=get_user_email)
)

### Data Seeding ###
def seed_species():
    """Seed the species table from species.csv."""
    csv_path = os.path.join(os.getcwd(), "apps/birds/uploads/species.csv")
    # Clear the table if it already has data
    db(db.species.id > 0).delete()
    db.commit()
    if os.path.exists(csv_path):
        try:
            with open(csv_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    db.species.insert(COMMON_NAME=row['COMMON NAME'].strip())
            db.commit()
            print("Species table seeded successfully.")
        except Exception as e:
            print(f"Error seeding species table: {e}")
    else:
        print(f"File not found: {csv_path}")


def seed_sightings():
    """Seed the sightings table from sightings.csv."""
    csv_path = os.path.join(os.getcwd(), "apps/birds/uploads/sightings.csv")
    if db(db.sightings).isempty():  # Check if the sightings table is empty
        try:
            with open(csv_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        OBSERVATION_COUNT = int(row['OBSERVATION_COUNT'])
                    except ValueError:
                        OBSERVATION_COUNT = 0  # Default to 0 if parsing fails
                    db.sightings.insert(
                        SAMPLING_EVENT_IDENTIFIER=row['SAMPLING_EVENT_IDENTIFIER'],
                        COMMON_NAME=row['COMMON_NAME'],
                        OBSERVATION_COUNT=OBSERVATION_COUNT
                    )
            db.commit()
            print("Sightings table seeded successfully.")
        except Exception as e:
            print(f"Error seeding sightings table: {e}")

def seed_checklist():
    """Seed the checklist table from checklists.csv."""
    csv_path = os.path.join(os.getcwd(), "apps/birds/uploads/checklists.csv")
    if db(db.checklist).isempty():  # Check if the checklist table is empty
        try:
            with open(csv_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    db.checklist.insert(
                        SAMPLING_EVENT_IDENTIFIER=row['SAMPLING_EVENT_IDENTIFIER'],
                        LATITUDE=float(row['LATITUDE']),
                        LONGITUDE=float(row['LONGITUDE']),
                        OBSERVATION_DATE=row['OBSERVATION_DATE'],
                        TIME_OBSERVATIONS_STARTED=row['TIME_OBSERVATIONS_STARTED'],
                        OBSERVER_ID=row['OBSERVER_ID'],
                        DURATION_MINUTES=float(row['DURATION_MINUTES'])
                    )
            db.commit()
            print("Checklist table seeded successfully.")
        except Exception as e:
            print(f"Error seeding checklist table: {e}")

# Seed the tables
seed_species()
seed_sightings()
seed_checklist()

# Always commit your changes to avoid problems later
db.commit()