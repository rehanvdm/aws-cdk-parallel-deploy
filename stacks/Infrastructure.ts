import * as cdk from "@aws-cdk/core";
import {RemovalPolicy} from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class Infrastructure extends cdk.Stack {

  public dynamoTable: dynamodb.Table;

  constructor(app: cdk.App, id: string, stackProps: cdk.StackProps) {
    super(app, id, stackProps);

    function name(name: string): string {
      return id + "-" + name;
    }

    this.dynamoTable = new dynamodb.Table(this, name("dyn-table"), {
      tableName: name("dyn-table"),
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

  }
}

export default Infrastructure;
