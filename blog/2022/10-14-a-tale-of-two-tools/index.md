---
authors: [anja]
tags: [aws, inventory, cloud]
image: ./img/banner-social.png
---

# A Tale of Two Tools

```mdx-code-block
import CodeBlock from '@theme/CodeBlock';
```

**"It [is] the best of times, it [is] the worst of times."** Software engineers working with <abbr title="Amazon Web Services">AWS</abbr> have any cloud service imaginable at their fingertips and developer velocity could hardly be higher. But, even the most shiny of coins has two sides.

While developers can spin up compute instances, databases, and less tangible things like Lambda functions or virtual identities as they wish—at some point, someone will ask, "What is all of this?" And as they hack away in the CLI trying to get an overview of the resources in all of their <abbr title="Amazon Web Services">AWS</abbr> accounts, they will inevitably get frustrated. While Amazon has been a pioneer in cloud computing and offers the largest array of services, there are some things that aren't so ideal. Namely, API consistency.

In this post, I describe a few of the challenges and quirks with the <abbr title="Amazon Web Services">AWS</abbr> API and why we're building Resoto. _(Spoiler alert: It is so that you don't have to!)_

<!--truncate-->

:::info

**If you're curious about the implementation of new resources or new services, please take a look at our [AWS collector contribution guide](/docs/contributing/plugins/aws).**

PRs are always welcome—Resoto is an open-source product, after all! While there is a recipe to follow for each <abbr title="Amazon Web Services">AWS</abbr> service, there are many pitfalls and the devil is in the details. Keep reading below for a few examples…

:::

## Retrieving Resource Information

Generally speaking, the API for every service covers the typical life cycle: creation, tagging, description and deletion of resources. This is about where the similarities end. In Resoto, [everything is a resource](../09-22-cloud-resources-they-have-a-lot-in-common/index.md). Therefore we will be on the lookout for any calls in the realm of `list-...`, `get-...-attributes`, or `describe-...`. This is where the divergence begins.

Can you get complete metadata for all resources of the same kind in a single call, or do you have to make nested calls for every item? For <abbr title="Elastic Compute Cloud">EC2</abbr>, we are lucky and get everything in one go. Other services, however, force you to first retrieve a list of resource identifiers (more on that below) and _then_ query for the attributes or descriptions of each result.

Obtaining metadata by means of manual exploration is forbiddingly arduous. Programmatically, however, it is not half as bad. **Resoto gathers the complete metadata for each and every resource in each collect run.**

## Resource Identification

In an ideal world, every question concerning the distinct identification of any resource should be answered by its ARN. (That's the whole idea behind ARNs!) However, the reality is not so simple.

Let's say you wish to tag a `RestApi` in `ApiGateway`. Looking at the CLI documentation, you can find a [`tag-resource` command](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/apigateway/tag-resource.html) and provide the <abbr title="Amazon Resource Name">ARN</abbr> of the resource and the tags you wish to add. But what is the <abbr title="Amazon Resource Name">ARN</abbr> of the `RestApi`? If you thought that this rather crucial bit of information would be returned by a [`get-rest-apis` call](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/apigateway/get-rest-apis.html), [you're mistaken](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/apigateway/get-rest-apis.html#output). You need to either assemble the <abbr title="Amazon Resource Name">ARN</abbr> manually or try to find it somewhere in the management console.

**This is why we have taken great care to provide ARNs for every resource in Resoto.** You no longer have to care about these idiosyncrasies!

Aside from ARNs, resources can have a name and/or ID. (Sometimes they're the same, though!) The [output of `describe-volumes`](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ec2/describe-volumes.html#output) contains a string `KmsKeyId`—surely this contains the ID of a <abbr title="Key Management Service">KMS</abbr> key?

_Wrong!_ Many references to <abbr title="Key Management Service">KMS</abbr> keys are named `Id` but actually contain the ARN. While this _is_ noted in the documentation, it can still be a source of confusion. It's not uncommon to reference resources by ID within and across <abbr title="Amazon Web Services">AWS</abbr> services, so this behaviour is unexpected to say the least.

## Data Types

Let's step back into retrieving metadata for resources. The information varies in complexity and volume. Some properties do have reasonable data types. The [size (in bytes) of a Glacier Vault](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/glacier/describe-vault.html#output) is a long integer. Whether a [Glacier Job has completed](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/glacier/describe-job.html#output) is a boolean. Let this not lull you in a false sense of comfort, though.

Would you like to know how many [subscriptions of an SNS topic](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/sns/get-topic-attributes.html#output) have been confirmed? Be sure to convert this string to an integer if you perform any arithmetic operations or comparisons! Do you need to know whether or not the confirmation for a subscription is still pending? This binary piece of information is a string, too!

There are even more inconsistencies to be found in representations of date and time data. Are you interested in the age of an <abbr title="Elastic Compute Cloud">EC2</abbr> instance or a Lambda function? You get an ISO-format datetime string. But if you want to know when an <abbr title="Simple Queue Service">SQS</abbr> queue was created? You instead have to make do with a timestamp in epoch time.

While it is certainly possible to work with this data, you need specific, contextual knowledge to do so… _unless you're using Resoto_. **Resoto provides consistent data types across all resources.**

## Tagging

We briefly touched on resource tagging before. If done diligently, tagging strategies can make a real difference to infrastructure sprawl. Tagging <abbr title="Amazon Web Services">AWS</abbr> Resources can follow a plethora of patterns though.

`tag-resource`, `tag-queue`, `add-tags-to-resource`, `create-or-update-tags`, `update-tags-for-resource`, etc.… the options are almost as numerous as the services. Do you have to provide the tags as an array or as a hashmap? Can you do multiple tags at once or is it one-by-one only?

The workload of tagging existing resources can blow out of proportion really quickly because all the services do their own thing. At this point I'm sure you're guessing it already: **you don't have to worry about any of this when you use Resoto to apply tags.**

Below is a comparison of how to add an `owner: jenkins` tag to an <abbr title="Elastic Compute Cloud">EC2</abbr> instance or <abbr title="Simple Queue Service">SQS</abbr> queue in the <abbr title="Amazon Web Services">AWS</abbr> CLI versus in Resoto:

:::tip EC2 Instance

```bash title="Tagging in the AWS CLI 😒"
> aws ec2 create-tags –resources jenkins-master –tags Key=owner,Value=jenkins
```

```bash title="Tagging in Resoto 💜"
> search is(aws_ec2_instance) and name = jenkins-master | tag update owner jenkins
```

:::

:::tip SQS Queue

```bash title="Tagging in the AWS CLI 😒"
> aws sqs tag-queue –queue-url https://sqs.us-west-2.amazonaws.com/123456789012/MyQueue –tags owner=jenkins
```

```bash title="Tagging in Resoto 💜"
> search is(aws_sqs_queue) and sqs_queue_url = https://sqs.us-west-2.amazonaws.com/123456789012/MyQueue | tag update owner jenkins
```

:::

## <abbr title="too long; didn't read">TL;DR</abbr>

All of these examples are taken from our own experiences implementing Resoto's <abbr title="Amazon Web Services">AWS</abbr> collector. Wading through the <abbr title="Amazon Web Services">AWS</abbr> CLI documentation and attempting to obtain the desired data has resulted in reactions ranging from 🤨 to 🤬.

We dove deep into the details of the responses of each API call and CLI command. But should this be necessary to get meaningful data? Should all of this niche knowledge be required? Here at [Some Engineering](https://some.engineering), we think not! **Exploring and maintaining cloud infrastructure should be straightforward and you should be able to focus on solving actual problems.**

Resoto is [open source](https://github.com/someengineering/resoto/blob/main/LICENSE) and free to use, and currently supports [<abbr title="Amazon Web Services">AWS</abbr>](/docs/getting-started/configure-cloud-provider-access/aws), [<abbr title="Google Cloud Platform">GCP</abbr>](/docs/getting-started/configure-cloud-provider-access/gcp), and [DigitalOcean](/docs/getting-started/configure-cloud-provider-access/digitalocean). [Install Resoto](/docs/getting-started/install-resoto) today!
