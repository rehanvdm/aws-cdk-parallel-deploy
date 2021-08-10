import Infrastructure from "./stacks/Infrastructure";
import ServiceA from "./stacks/ServiceA";
import ServiceB from "./stacks/ServiceB";
import * as cdk from "@aws-cdk/core";
const fs = require("fs");
const path = require("path");

const paths = {
  configFile: path.resolve(__dirname + "/config.json"),
};
interface Config {
  readonly AWSProfileName: string;
  readonly AWSProfileRegion: string;
  readonly AWSAccountID: string;
}
const app = new cdk.App();

function getConfig(): Config
{
  let localConfig = JSON.parse(fs.readFileSync( paths.configFile, "utf8"));

  let requiredProps = ["AWSProfileName", "AWSProfileRegion", "AWSAccountID"];
  for(let prop of requiredProps)
  {
    if(!localConfig[prop])
      throw new Error(prop+" not in config.json, make a copy of config.example.json with your values.");
  }

  let config: Config = {
    AWSProfileName: localConfig.AWSProfileName,
    AWSAccountID: localConfig.AWSAccountID,
    AWSProfileRegion: localConfig.AWSProfileRegion,
  };

  return config;
}


async function Main()
{
  let config = getConfig();

  const stackNames = {
    infra: "parallel-deploy-infra",
    serviceA: "parallel-deploy-service-a",
    serviceB: "parallel-deploy-service-b",
  };

  const stackProps: cdk.StackProps = {
    env: {
      region: config.AWSProfileRegion,
      account: config.AWSAccountID
    },
  }

  const infraStack = new Infrastructure(app, stackNames.infra, stackProps);

  new ServiceA(app, stackNames.serviceA, stackProps, {
    dynamoTable: infraStack.dynamoTable
   });

  new ServiceB(app, stackNames.serviceB, stackProps, {
    dynamoTable: infraStack.dynamoTable
  });

  app.synth();
}

Main();
