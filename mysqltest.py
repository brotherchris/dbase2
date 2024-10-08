import mysql.connector
from mysql.connector import errorcode

# Database connection configuration
config = {
    'user': 'admin',
    'password': 'rsYI221GuHfPncbHbetH',
    'host': 'database-1.c4xe3p6cmyju.us-east-1.rds.amazonaws.com',  # e.g., your-db-instance.xxxxxxxx.us-west-2.rds.amazonaws.com
    'database': 'datab1',
    'ssl_ca': '/us-east-1-bundle.pem',  # Path to your RDS SSL CA certificate
    #'ssl_cert': '/path/to/client-cert.pem',  # Path to client certificate (if applicable)
    #'ssl_key': '/path/to/client-key.pem',  # Path to client key (if applicable)
}

try:
    # Establishing SSL connection
    conn = mysql.connector.connect(**config)
    
    if conn.is_connected():
        print('Connection successful')
    
    # Create a cursor object to execute queries
    cursor = conn.cursor()
    
    # Execute a test query
    cursor.execute("SELECT DATABASE();")
    row = cursor.fetchone()
    print("Connected to database:", row)
    
    # Close the cursor and connection
    cursor.close()
    conn.close()

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Access denied: Incorrect username or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print("Error:", err)
