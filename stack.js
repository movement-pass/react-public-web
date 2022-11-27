const { Stack, App, RemovalPolicy } = require('aws-cdk-lib');

const {
  HostedZone,
  ARecord,
  RecordTarget
} = require('aws-cdk-lib/aws-route53');

const { Bucket, BlockPublicAccess } = require('aws-cdk-lib/aws-s3');

const { StringParameter } = require('aws-cdk-lib/aws-ssm');

const { Certificate } = require('aws-cdk-lib/aws-certificatemanager');

const {
  OriginAccessIdentity,
  CloudFrontWebDistribution,
  PriceClass,
  ViewerProtocolPolicy,
  ViewerCertificate,
  SSLMethod,
  SecurityPolicyProtocol
} = require('aws-cdk-lib/aws-cloudfront');

const { CloudFrontTarget } = require('aws-cdk-lib/aws-route53-targets');

const { BucketDeployment, Source } = require('aws-cdk-lib/aws-s3-deployment');

class PublicWebStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const rootFile = 'index.html';
    const appName = this.node.tryGetContext('app');
    const version = this.node.tryGetContext('version');
    const domain = this.node.tryGetContext('domain');
    const configRootKey = `/${appName}/${version}`;

    const zone = HostedZone.fromLookup(this, 'Zone', {
      domainName: domain
    });

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: `${this.region}.${domain}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN
    });

    const certificateArn = StringParameter.valueForStringParameter(
      this,
      `${configRootKey}/clientCertificateArn`
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn
    );

    const accessIdentity = new OriginAccessIdentity(this, 'AccessIdentity', {
      comment: `${appName}-public-web-identity`
    });

    const distribution = new CloudFrontWebDistribution(this, 'Distribution', {
      priceClass: PriceClass.PRICE_CLASS_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [domain],
        sslMethod: SSLMethod.SNI,
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021
      }),
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: accessIdentity
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              forwardedValues: {
                queryString: true
              }
            }
          ]
        }
      ],
      errorConfigurations: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: `/${rootFile}`
        },
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: `/${rootFile}`
        }
      ]
    });

    new ARecord(this, 'Mount', {
      recordName: domain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone
    });

    new BucketDeployment(this, 'Deployment', {
      distribution: distribution,
      destinationBucket: bucket,
      distributionPaths: [`/${rootFile}`],
      sources: [Source.asset('build')]
    });
  }
}

const app = new App();

new PublicWebStack(app, 'PublicWebStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stackName: `${app.node.tryGetContext(
    'app'
  )}-public-web-${app.node.tryGetContext('version')}`
});

app.synth();
