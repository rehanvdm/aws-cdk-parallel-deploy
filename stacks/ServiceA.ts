import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from '@aws-cdk/aws-lambda';

interface ServiceAProps {
  dynamoTable: dynamodb.Table
}

export class ServiceA extends cdk.Stack {

  constructor(app: cdk.App, id: string, stackProps: cdk.StackProps, props :ServiceAProps) {
    super(app, id, stackProps);

    function name(name: string): string {
      return id + "-" + name;
    }

    new lambda.Function(this, name("function-a"), {
      functionName: name("function-a"),
      code: lambda.Code.fromAsset("src/lambda/function-a"),
      handler: 'app.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        DYN_TABLE_NAME: props.dynamoTable.tableName
      }
    });
  }

}

export default ServiceA;







