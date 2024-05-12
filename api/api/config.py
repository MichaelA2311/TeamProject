class DatabaseConfig:
    """
    Database configuration
    """

    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentDatabaseConfig(DatabaseConfig):
    """
    Database configuration for development use.
    """

    USERNAME = 'myuser'
    PASSWORD = 'mypassword'
    HOST = 'localhost'
    PORT = '5432'
    DATABASE = 'mydatabase'
    SQLALCHEMY_DATABASE_URI = f'postgresql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}'
