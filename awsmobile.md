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
    * Facebook
    * Google
    * LoginWithAmazon
  * App client customization, which includes:
    * A custom domain name for the hosted login UI (`auth.grancentral.ai`)
      * For now, the hosted UI is accessed under the Amazon domain name
       `grancentral-mvp.auth.us-west-2.amazoncognito.com`, due to a bug
        with porting the custom domain from an old user pool.
    * A custom logo (`hosted-logo.jpg` in this repo)
    * Changing the background of the "banner" component to "white"
