import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from '@aws-cdk/aws-lambda';

interface ServiceBProps {
  dynamoTable: dynamodb.Table
}

export class ServiceB extends cdk.Stack {

  constructor(app: cdk.App, id: string, stackProps: cdk.StackProps, props :ServiceBProps) {
    super(app, id, stackProps);

    function name(name: string): string {
      return id + "-" + name;
    }

    new lambda.Function(this, name("function-b"), {
      functionName: name("function-b"),
      code: lambda.Code.fromAsset("src/lambda/function-b"),
      handler: 'app.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        DYN_TABLE_NAME: props.dynamoTable.tableName
      }
    });
  }

}

export default ServiceB;
