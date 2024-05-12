import sys

import boto3

def create_s3_client(endpoint, access_key, secret_key):
    """
    Takes in the minio variables and creates the s3 client.

    :param endpoint: the minio endpoint url.
    :param access_key: the access key required to create s3 client.
    :param secret_key: the secret key required to create s3 client.
    """
    
    s3_client = boto3.client('s3',
                             endpoint_url=endpoint,
                             aws_access_key_id=access_key,
                             aws_secret_access_key=secret_key)
    
    return s3_client

def download_from_s3(s3_client, bucket, key, download_path) -> bool:

    try:
        s3_client.download_file(Bucket=bucket,
                                Key=key,
                                Filename=download_path)
    except Exception as e:
        print(e, file=sys.stderr)
        return False
    else:
        return True

def upload_to_s3(s3_client, final_output, bucket_name):
    """
    Uploads the final output file to the specified bucket

    :param final_outout: the name of the final output file.
    :param bucket_name: the name of the bucket to be uploaded to.
    """

    try:
        with open(final_output, 'rb') as file:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=f"final-product/{final_output}",
                Body=file,
                ACL='public-read')

        s3_client.get_waiter('object_exists').wait(
            Bucket=bucket_name,
            Key=f"final-product/{final_output}"
        )
    except Exception as e:
        print("Error:", e, file=sys.stderr)
