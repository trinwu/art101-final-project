"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email

url_signer = URLSigner(session)

@action('index')
@action.uses('index.html', db, auth, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url = URL('my_callback', signer=url_signer),
    )

@action('my_callback')
@action.uses() # Add here things like db, auth, etc.
def my_callback():
    # The return value should be a dictionary that will be sent as JSON.
    return dict(my_value=3)

@action("get_species", method=["GET"])
@action.uses(db)
def get_species():
    try:
        species = db(db.species).select().as_list()
        return dict(species=species)
    except Exception as e:
        return dict(error=str(e))

@action('my_checklists')
@action.uses('my_checklists.html', db, auth)
def my_checklists():
    # Ensure you fetch and pass the correct data (user's checklists) here
    checklists = db(db.checklist.user_email == auth.user.email).select()
    return dict(checklists=checklists)

def checklist():
    """
    Render the edit page for a specific checklist
    URL: /checklist/<checklist_id>
    """
    checklist_id = request.args(0)
    checklist = db.checklists(checklist_id)
    
    if not checklist:
        session.flash = 'Checklist not found'
        redirect(URL('my_checklists'))
    
    return dict(checklist=checklist)

def update_checklist():
    """
    Update a checklist's information
    URL: /update_checklist/<checklist_id>
    """
    checklist_id = request.args(0)
    checklist = db.checklists(checklist_id)
    
    if not checklist:
        session.flash = 'Checklist not found'
        redirect(URL('my_checklists'))
    
    # Validate and update the checklist
    try:
        # Get form data
        species_name = request.vars.species_name
        latitude = float(request.vars.latitude)
        longitude = float(request.vars.longitude)
        date_observed = request.vars.date_observed
        time_observation_started = request.vars.time_observation_started
        duration_observed = int(request.vars.duration_observed)
        
        # Update the record
        checklist.update_record(
            species_name=species_name,
            latitude=latitude,
            longitude=longitude,
            date_observed=date_observed,
            time_observation_started=time_observation_started,
            duration_observed=duration_observed
        )
        
        # Commit the transaction
        db.commit()
        
        # Set a success message
        session.flash = 'Checklist updated successfully'
        redirect(URL('my_checklists'))
    
    except Exception as e:
        # Handle potential errors
        db.rollback()
        session.flash = f'Error updating checklist: {str(e)}'
        redirect(URL('checklist', args=checklist_id))

@action('add_checklist')
@action.uses('add_checklist.html', db, auth)
def add_checklist():
    return dict()
