import * as cdk from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb, aws_lambda as lambda, aws_iot as iot } from 'aws-cdk-lib';
import { v4 as uuid } from 'uuid';

import * as selfsigned from 'selfsigned';
import {GenerateResult} from 'selfsigned';
import { Construct } from 'constructs';

export class CloudStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const weatherTable = new dynamodb.Table(this, `dtable_${uuid()}`, {
      tableName: 'weatherTable',
      partitionKey: { name: 'StationId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'StationTimestamp', type: dynamodb.AttributeType.STRING}
    });

    const thing = new iot.CfnThing(this, `iotthing_${uuid()}`, {
      thingName: 'VSENSOR'
    });

    const thingPolicy = new iot.CfnPolicy(this, `iotpolicy_${uuid()}`, {
      policyName: 'all',
      policyDocument: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "*",
            "Resource": "*"
          }
        ]
      }
    });

    const certificate: GenerateResult = selfsigned.generate();

    const thingCertificate = new iot.CfnCertificate(this, `iotcert_${uuid()}`, {
      status: 'ACTIVE',
      certificateSigningRequest: certificate.fingerprint,
    });

    new iot.CfnPolicyPrincipalAttachment(this, `iotpolicyattachment_${uuid()}`, {
      policyName: thingPolicy.policyName!!,
      principal: thingCertificate.attrArn
    });
    
    /*
    new lambda.Function(this, `lambda_${uuid()}`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset("../../dist/index.js"),
      environment: {
        "CERT": certificate.cert,
        "PRIVATE_KEY": certificate.private,
        "ENDPOINT": "ajika3uspzv9m-ats.iot.us-east-1.amazonaws.com",
        "CLIENT_ID": "sdk-nodejs-v2",
      }
    });
*/
    
  }
}
