# AWS CDK parallel deployments

**This the code base for a blog post:[https://www.rehanvdm.com/blog/cdk-shorts-2-parallel-deployments](https://www.rehanvdm.com/blog/cdk-shorts-2-parallel-deployments)**

## Intro 

The ability to deploy stacks in parallel is beyond the CDK and CloudFormation scope. It is up to the caller to
orchestrate and specify the order of the stack when this granularity is desired.

In this post we show how a basic **3 stack application**'s deployment time can be reduced by deploying stacks in parallel where possible.
The stacks in question are:
- **`stacks/Infrastructure`** this contains the all resources used by the Service stacks, like VPCs, DBs ect. In this example it only contains a DynamoDB Table.
- **`stacks/ServiceA`** this is one of the Service stacks, it only contains a Lambda that receives the DynamoDB Table name as an environment variable from the Infrastructure stack.
  It is thus dependent on the Infrastructure stack and needs that to be deployed first.
- **`stacks/ServiceB`** exactly the same as `stacks/ServiceA`.

In theory, we could have looped over an array and created as many stacks as we want (`ServiceX`) but the example is keeping it concrete and simple with only two Service stacks.

---


## Prerequisites
- AWS SDK installed and profile has been set
- AWS CDK installed and the targeted AWS account has been bootstrapped

## Deployment

A Gulp file is used for a build script to make the process platform-agnostic. This is a basic implementation of the
fourth method as explained in one of my other blog posts
[4 Methods to configure multiple environments in the AWS CDK](https://www.rehanvdm.com/blog/4-methods-to-configure-multiple-environments-in-the-aws-cdk)

1. `npm install` in the root dir
2. Make a copy of `config.example.json` and name it `config.json`, fill it with the correct values for deployment.

### Diff 
To view the full CDK diff:
```
npm run diff
```

### Deploy
The deploy command creates a cloud assembly with the `cdk synth` command, then it deploys the infrastructure stack followed 
by the deploying the service A and B stacks in parallel. Take a closer look in `deploy/gulpfile.js` ~ line 104.

To deploy the CDK:
```
npm run deploy
```

### Destroy
Does the `cdk destroy` command on all the stacks
```
npm run diff
```
