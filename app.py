import logging
from sqlalchemy import event
from sqlalchemy.pool import Pool
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_POOL_SIZE, SQLALCHEMY_MAX_OVERFLOW, SQLALCHEMY_POOL_TIMEOUT, SQLALCHEMY_POOL_RECYCLE

import re

# Initialize the Flask app
app = Flask(__name__, static_folder='static')

# Load configuration from config.py
app.config.from_pyfile('config.py')

# Set up the database connection with pooling options
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_POOL_SIZE'] = SQLALCHEMY_POOL_SIZE
app.config['SQLALCHEMY_MAX_OVERFLOW'] = SQLALCHEMY_MAX_OVERFLOW
app.config['SQLALCHEMY_POOL_TIMEOUT'] = SQLALCHEMY_POOL_TIMEOUT
app.config['SQLALCHEMY_POOL_RECYCLE'] = SQLALCHEMY_POOL_RECYCLE


# Initialize the database
db = SQLAlchemy(app)



# Configure logging to see pool activity
logging.basicConfig()
logging.getLogger('sqlalchemy.pool').setLevel(logging.INFO)

# Event listeners to track pool activity
@event.listens_for(Pool, "connect")
def on_connect(dbapi_connection, connection_record):
    print("New DB connection created")

@event.listens_for(Pool, "checkout")
def on_checkout(dbapi_connection, connection_record, connection_proxy):
    print("DB connection checked out")

@event.listens_for(Pool, "checkin")
def on_checkin(dbapi_connection, connection_record):
    print("DB connection checked in")




class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    job = db.Column(db.String(100))
    event = db.Column(db.String(100))
    last_run = db.Column(db.String(100))
    prefix = db.Column(db.String(50))
    type = db.Column(db.String(50))
    remedy_support_group = db.Column(db.String(100))
    snow_support_group = db.Column(db.String(100))
    snow_support_group_mgr = db.Column(db.String(100))
    support_market = db.Column(db.String(50))
    app_name = db.Column(db.String(100))
    ldap_group = db.Column(db.String(100))
    env = db.Column(db.String(50))
    purpose = db.Column(db.String(200))
    job_owner = db.Column(db.String(100))
    troux_name = db.Column(db.String(100))
    troux_id = db.Column(db.String(100))
    status = db.Column(db.String(50))
    impact = db.Column(db.String(50))
    complexity = db.Column(db.String(50))
    remarks = db.Column(db.String(200))
    sign_off_name = db.Column(db.String(100))
    sign_off_date = db.Column(db.DateTime)
    target_week = db.Column(db.String(50))
    company = db.Column(db.String(100))  # Add the company column
    def serialize(self):
        return {
            'id': self.id,
            'job': self.job,
            'company': self.company,
            'event': self.event,
            'last_run': self.last_run.strftime('%Y-%m-%d') if self.last_run else None,
            'prefix': self.prefix,
            'type': self.type,
            'remedy_support_group': self.remedy_support_group,
            'snow_support_group': self.snow_support_group,
            'snow_support_group_mgr': self.snow_support_group_mgr,
            'support_market': self.support_market,
            'app_name': self.app_name,
            'ldap_group': self.ldap_group,
            'env': self.env,
            'purpose': self.purpose,
            'job_owner': self.job_owner,
            'troux_name': self.troux_name,
            'troux_id': self.troux_id,
            'status': self.status,
            'impact': self.impact,
            'complexity': self.complexity,
            'remarks': self.remarks,
            'sign_off_name': self.sign_off_name,
            'sign_off_date': None if self.sign_off_date in ['0000-00-00 00:00:00', '0000-00-00'] else \
    parse(self.sign_off_date).strftime('%Y-%m-%d') if isinstance(self.sign_off_date, str) else \
    self.sign_off_date.strftime('%Y-%m-%d') if self.sign_off_date else None,
            'target_week': self.target_week
        }
def is_valid_email(email):
    # Basic email validation function
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def format_date(date_str):
    if not date_str or date_str in ['0000-00-00 00:00:00', '0000-00-00']:
        return None  # Return None for invalid or placeholder dates
    try:
        return datetime.strptime(date_str.split(' ')[0], '%Y-%m-%d')
    except ValueError:
        return None



# Route to render index.html
@app.route('/')
def index():
    return render_template('index.html')

# Route to fetch all jobs from the database, with optional company filter
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
# Fetch the company filter from the query parameters, default to all companies
    company = request.args.get('company', '')  
    
    # Get pagination details
    page = int(request.args.get('page', 1))  
    limit = int(request.args.get('limit', 20))  
    
    # Start the base query
    query = Job.query
    
    # If a company is selected, apply the filter
    if company:
        query = query.filter_by(company=company)
    
    # Get the total number of rows before pagination
    total_count = query.count()

    # Apply pagination
    jobs = query.offset((page - 1) * limit).limit(limit).all()
    
    # Serialize the job objects into JSON format for the frontend
    job_list = [job.serialize() for job in jobs]
    
    job_list = [{
        'id': job.id,
        'job': job.job,
        'event': job.event,
        'last_run': job.last_run,
        'prefix': job.prefix,
        'type': job.type,
        'remedy_support_group': job.remedy_support_group,
        'snow_support_group': job.snow_support_group,
        'snow_support_group_mgr': job.snow_support_group_mgr,
        'support_market': job.support_market,
        'app_name': job.app_name,
        'ldap_group': job.ldap_group,
        'env': job.env,
        'purpose': job.purpose,
        'job_owner': job.job_owner,
        'troux_name': job.troux_name,
        'troux_id': job.troux_id,
        'status': job.status,
        'impact': job.impact,
        'complexity': job.complexity,
        'remarks': job.remarks,
        'sign_off_name': job.sign_off_name,
        'sign_off_date': job.sign_off_date.strftime('%Y-%m-%d') if isinstance(job.sign_off_date, datetime) else job.sign_off_date,
        'target_week': job.target_week,
        'company': job.company  # Include the company in the response
    } for job in jobs]
    
    return jsonify({
        'total_count': total_count,  # Send the total row count before pagination
        'jobs': job_list  # Send the paginated job data
    })

# Function to check SSL status
def check_ssl_status():
    with app.app_context():
        try:
            with db.connect() as connection:
                # Use the text() function to create an executable statement
                result = connection.execute(text("SHOW STATUS LIKE 'Ssl_cipher';"))
                ssl_status = result.fetchone()

                if ssl_status and ssl_status[1]:
                    app.logger.info(f"SSL encryption enabled, cipher: {ssl_status[1]}")
                else:
                    app.logger.warning("SSL encryption not enabled.")
        except SQLAlchemyError as e:
            app.logger.error(f"Database error occurred: {e}")

@app.route('/api/single_update', methods=['POST'])
def single_update():
    data = request.json
    job_id = data.get('job_id')
    field = data.get('field')
    value = data.get('value')

    print(f"Debug: Received single update request - Job ID: {job_id}, Field: {field}, Value: {value}")

    # Fetch the job record
    job = Job.query.get(job_id)
    if not job:
        print(f"Debug: Job with ID {job_id} not found.")
        return jsonify({'error': 'Job not found'}), 404

    # Convert 'sign_off_date' to 'YYYY-MM-DD' format if necessary
    if field == 'sign_off_date':
        try:
            # Convert from 'MM/DD/YYYY' to 'YYYY-MM-DD'
            value = datetime.strptime(value, '%m/%d/%Y').strftime('%Y-%m-%d')
            print(f"Debug: Converted sign_off_date to {value}")
        except ValueError as e:
            print(f"Debug: Invalid date format for sign_off_date - {value}, Error: {e}")
            return jsonify({'error': f'Invalid date format: {value}. Please use MM/DD/YYYY format.'}), 400

    # Update sign_off_name and handle sign_off_date accordingly
    if field == 'sign_off_name':
        job.sign_off_name = value
        job.sign_off_date = datetime.now() if value else None  # Set date to current datetime if name is not empty
        print(f"Debug: Updating sign_off_name to {value} and sign_off_date to {job.sign_off_date}")
    else:
        setattr(job, field, value)

    try:
        db.session.commit()
        print(f"Debug: Job ID {job_id} updated successfully.")
        return jsonify({'message': 'Job updated successfully'})
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Debug: Error committing update for Job ID {job_id} - {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/mass_update', methods=['POST'])
def mass_update():
    data = request.json
    field = data.get('field')
    new_value = data.get('value')
    selected_ids = data.get('selected_ids')

    print(f"Debug: Mass update - Field: {field}, New Value: {new_value}, Selected IDs: {selected_ids}")  # Debug print

    if not field or not new_value or not selected_ids:
        return jsonify({'error': 'Missing data'}), 400

    jobs = Job.query.filter(Job.id.in_(selected_ids)).all()
    if not jobs:
        print(f"Debug: No matching jobs found for IDs: {selected_ids}")
        return jsonify({'error': 'No matching jobs found'}), 404

    for job in jobs:
        if field == 'sign_off_name':
            job.sign_off_name = new_value
            job.sign_off_date = datetime.now() if new_value else None
            print(f"Debug: Updating Job ID {job.id} - sign_off_name: {new_value}, sign_off_date: {job.sign_off_date}")
        else:
            setattr(job, field, new_value)

    try:
        db.session.commit()
        print(f"Debug: Mass update successful for Job IDs: {selected_ids}")
        return jsonify({'success': True}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Debug: Error during mass update - {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/undo_mass_update', methods=['POST'])
def undo_mass_update():
    try:
        original_data = request.json

        for item in original_data:
            job_id = item.get('job_id')
            field = item.get('field')
            original_value = item.get('original_value')

            # Get the job by ID
            job = Job.query.get(job_id)
            if not job:
                return jsonify({'error': f'Job with ID {job_id} not found'}), 404

            # Revert the field to the original value
            setattr(job, field, original_value)

        # Commit changes to the database
        db.session.commit()

        return jsonify({'success': True}), 200

    except Exception as e:
        db.session.rollback()  # Rollback in case of any error
        return jsonify({'error': str(e)}), 400
    
# Route to get distinct company names for the company filter
@app.route('/api/companies', methods=['GET'])
def get_companies():
    companies = db.session.query(Job.company).distinct().all()
    company_list = [company[0] for company in companies]
    return jsonify(company_list)

@app.route('/getFilteredData', methods=['POST'])
def get_filtered_data():
    filters = request.json
    query = Job.query

    if filters['jobName']:
        query = query.filter(Job.job_name.ilike(f"%{filters['jobName']}%"))
    if filters['espAppName']:
        query = query.filter(Job.esp_app_name.ilike(f"%{filters['espAppName']}%"))
    if filters['lastRunDate']:
        query = query.filter(Job.last_run_date.ilike(f"%{filters['lastRunDate']}%"))
    if filters['prefix']:
        query = query.filter(Job.prefix.ilike(f"%{filters['prefix']}%"))
    if filters['type']:
        query = query.filter(Job.type.ilike(f"%{filters['type']}%"))
    if filters['comments']:
        query = query.filter(Job.comments.ilike(f"%{filters['comments']}%"))

    filtered_data = query.all()

    # Convert the data into a JSON-friendly format
    result = [row.to_dict() for row in filtered_data]
    
    return jsonify(result)

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
check_ssl_status()