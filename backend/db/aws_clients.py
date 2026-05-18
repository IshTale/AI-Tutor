from functools import cached_property

import boto3

from backend.config import Settings


class AwsClients:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @cached_property
    def dynamodb(self):
        return boto3.resource("dynamodb", region_name=self.settings.aws_region)

    @cached_property
    def s3(self):
        return boto3.client("s3", region_name=self.settings.aws_region)

    @cached_property
    def polly(self):
        return boto3.client("polly", region_name=self.settings.aws_region)
