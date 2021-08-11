const gulp = require("gulp");
const chalk = require("chalk");
const _ = require("lodash");

const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;

const paths = {
  cloudAssemblyOutPath: path.resolve(__dirname + "/cloud_assembly_output"),
  workingDir: path.resolve(__dirname + "/../"),
  configFile: path.resolve(__dirname + "/../config.json"),
  configPathSandbox: path.resolve(__dirname + "/config.dev.sandbox.yaml"),
  // cdkExe: path.resolve(__dirname + "/../node_modules/aws-cdk/bin/cdk"),
  // tscExe: path.resolve(__dirname + "/../node_modules/typescript/bin/tsc")
};
const stackNames = {
  infra: "parallel-deploy-infra",
  serviceA: "parallel-deploy-service-a",
  serviceB: "parallel-deploy-service-b",
};

async function CommandExec(command, args, cwd, echoOutputs = true, env = null, prefixOutputs = "")
{
  try
  {
    if (!env)
      env = process.env;

    return new Promise((resolve, reject) =>
    {
      let allData = "";
      console.log(chalk.green(">>>", command + " " + args));
      // console.log( chalk.green(">>>", command +" "+ args, "["+cwd+"]"));

      const call = spawn(command, args, {shell: true, windowsVerbatimArguments: true, cwd: cwd, env: env});
      let errOutput = null;

      call.stdout.on("data", function (data)
      {
        allData += data.toString();
        echoOutputs && process.stdout.write(prefixOutputs + data.toString());
      });
      call.stderr.on("data", function (data)
      {
        errOutput = data.toString();
        echoOutputs && process.stdout.write(prefixOutputs + data.toString());
      });
      call.on("exit", function (code)
      {
        if (code == 0)
          resolve(allData);
        else
          reject(errOutput);
      });
    });
  }
  catch (e)
  {
    return Promise.reject(e);
  }
}

async function getConfig()
{
  let localConfig = JSON.parse(fs.readFileSync(paths.configFile, "utf8"));

  let requiredProps = ["AWSProfileName", "AWSProfileRegion", "AWSAccountID"];
  for(let prop of requiredProps)
  {
    if(!localConfig[prop])
      throw new Error(prop+" not in config.json, make a copy of config.example.json with your values.");
  }

  return localConfig;
}

function printConfig(config)
{
  console.log(chalk.blue("### CONFIG ###"));
  console.log(chalk.blue(JSON.stringify(config, null, 4)));
}

gulp.task("diff", async callback =>
{
  try
  {
    let config = await getConfig();
    printConfig(config);

    /* Convert TSC to JS dor CDK */
    await CommandExec("npm", ["run build"], paths.workingDir);

    await CommandExec("cdk",[`diff "*"  --profile ${config.AWSProfileName} || echo Done`], paths.workingDir);

    callback();
  }
  catch (e)
  {
    callback(e);
  }
});

gulp.task("deploy", async callback =>
{
  try
  {
    let config = await getConfig();
    printConfig(config);

    /* Convert TSC to JS dor CDK */
    await CommandExec("npm", ["run build"], paths.workingDir);

    /* Create Cloud Assembly */
    await CommandExec("cdk",[`synth "${stackNames.infra}" --profile ${config.AWSProfileName} ` +
      ` --output ${paths.cloudAssemblyOutPath}`], paths.workingDir);

    /* Deploy Infra stack */
    await CommandExec("cdk",[`deploy "${stackNames.infra}" --require-approval=never ` +
      ` --profile ${config.AWSProfileName} --progress=events --app ${paths.cloudAssemblyOutPath}`], paths.workingDir);

    /* Deploy Service Stacks in parallel */
    let serviceStacks = [stackNames.serviceA, stackNames.serviceB];
    let arrPromises = [];
    for (let stackName of serviceStacks)
    {
      arrPromises.push(
        CommandExec("cdk",[`deploy "${stackName}" --require-approval=never ` +
        ` --profile ${config.AWSProfileName} --progress=events --app ${paths.cloudAssemblyOutPath} --exclusively true`],
        paths.workingDir, true, process.env, `[${stackName}] `)
      );
    }
    await Promise.all(arrPromises);

    callback();
  }
  catch (e)
  {
    callback(e);
  }
});

gulp.task("destroy", async callback =>
{
  try
  {
    let config = await getConfig();
    printConfig(config);

    /* Convert TSC to JS dor CDK */
    await CommandExec("npm", ["run build"], paths.workingDir);

    await CommandExec("cdk",[`destroy "*" -f  --profile ${config.AWSProfileName} || echo Done`], paths.workingDir);

    callback();
  }
  catch (e)
  {
    callback(e);
  }
});
