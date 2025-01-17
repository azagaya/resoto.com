---
sidebar_label: aws
---

# `aws` Command

The `aws` command executes an operation on an AWS resource. The command supports the same services and operations as the AWS CLI.

:::info

Please refer to the [list of available services](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html#available-services) and their operations.

:::

There are two modes of operation:

1. Pipe the result of a [search](../../../concepts/search.md) to the `aws` command. The command will be invoked on each resource returned by the search. You can template parameters to define the exact invocation arguments.
2. Call the `aws` command directly (without passing a resource) to interact with AWS directly.

## Usage

```bash
aws  [--account <override_account>] [--role <override_role>] [--profile <override_profile>] [--region] [service] [operation] [operation_args]
```

### Options

| Option                         | Description      |
| ------------------------------ | ---------------- |
| `--account <override_account>` | Override account |
| `--role <override_role>`       | Override role    |
| `--profile <override_profile>` | Override profile |

### Parameters

| Parameter        | Description          | Required? | Default Value |
| ---------------- | -------------------- | --------- | ------------- |
| `service`        | AWS service name     | ✅️       | N/A           |
| `operation`      | Operation to perform | ✅        | N/A           |
| `operation_args` | Additional arguments | ❌        | N/A           |

## Examples

```bash title="Get the calling identity for the configured access"
> aws sts get-caller-identity
# highlight-start
​UserId: AIDA42373XXXXXXXXXXXX
​Account: '882374444444'
​Arn: arn:aws:iam::882374444444:user/matthias
# highlight-end
```

```bash title="Call describe-volume-attribute for all EC2 volumes"
​# Search for EC2 volumes and then call describe-volume-attribute on each volume.
​# Note: The aws command is invoked on each volume and replaces {id} with the volume ID.
> search is(aws_ec2_volume) | aws ec2 describe-volume-attribute --volume-id {id} --attribute autoEnableIO
# highlight-start
​volume AutoEnableIO:
​  Value: false
​  VolumeId: vol-009b0a28d2754927e
# highlight-end
```

```bash title="Stop running EC2 instances with name test"
​# Search for running EC2 instances with the term test in the name and stop them.
​# Note: The aws command is invoked on each instance and replaces {id} with the instance ID.
> search is(aws_ec2_instance) and instance_status=running and name~test | aws ec2 stop-instances --instance-ids {id}
# highlight-start
​StoppingInstances:
​  - InstanceId: i-1234567890abcdef0
​    CurrentState:
​      Code: 64
​      Name: stopping
​    PreviousState:
​      Code: 16
​      Name: running
# highlight-end
```

```bash title="Start stopped EC2 instances with name test"
​# Search for stopped EC2 instances with the term test in the name and start them.
​# Note: The aws command is invoked on each instance and replaces {id} with the instance ID.
> search is(aws_ec2_instance) and instance_status=stopped and name~test | aws ec2 start-instances --instance-ids {id}
# highlight-start
​StartingInstances:
​  - InstanceId: i-1234567890abcdef0
​    CurrentState:
​      Code: 0
​      Name: pending
​    PreviousState:
​      Code: 80
​      Name: stopped
# highlight-end
```
