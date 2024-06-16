import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, 's3bucket-for-shop', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    const OAI = new cloudfront.OriginAccessIdentity(this, "shop-react-rsschool-oai");

    bucket.grantRead(OAI);

    const cloudFront = new cloudfront.CloudFrontWebDistribution(this, 'Cloudfrontistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: OAI,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
    });

    new s3deploy.BucketDeployment(this, 's3deploy', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      distribution: cloudFront,
      distributionPaths: ['/*'],
    });
     new cdk.CfnOutput(this, 'SpaDistributionUrl', {
      value: cloudFront.distributionDomainName,
    });
  }
}
