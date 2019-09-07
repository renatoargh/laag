const path = require('path')
const pwd = process.env.PWD
const packageJsonPath = path.join(pwd, 'package.json')
const pkg = require(packageJsonPath)

module.exports = () => ({
  getRemainingTimeInMillis: () => {
    return 999999
  },
  functionName: pkg.name,
  functionVersion: pkg.version,
  invokedFunctionArn: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logGroupName: '',
  logStreamName: '',
  identity: {
    cognitoIdentityId: '',
    cognitoIdentityPoolId: '',
    clientContext: '',
    client: {
      installation_id: '',
      app_title: '',
      app_version_name: '',
      app_version_code: '',
      app_package_name: ''
    },
    env: {
      platform_version: '',
      platform: '',
      make: '',
      model: '',
      locale: ''
    }
  }
})
