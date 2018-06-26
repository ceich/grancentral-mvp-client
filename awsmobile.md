# Notes on awsmobile script

[awsmobile](https://github.com/aws/awsmobile-cli) is a tool that allows you
to set up (most of) a back end from the command line.
I recommend you install it with `yarn`:

```
sudo yarn global add awsmobile-cli
awsmobile configure
```

Now you can create a new backend with `awsmobile init` (in a clean app directory).

If you enable the `appsync` feature, you can then edit the schema, data sources and templates locally, and use `awsmobile push` to create an AppSync API.

## What's missing
* User Pool customization
  * ID Providers
  * App client customization
    * This includes setting up a CNAME for the hosted login UI