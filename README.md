# AWS CDK parallel deploy example

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
