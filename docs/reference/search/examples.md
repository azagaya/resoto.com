---
sidebar_position: 10
sidebar_label: Examples
---

# Search Examples

Resoto's search syntax is quite powerful and has many features. We suggest trying some of the following searches to get a feel for Resoto's capabilities:

```bash title="Search for resources with property value 'foo'"
> search "foo"
```

```bash title="Get number of all collected resources"
> search all | count
```

```bash title="Get number of all collected resources by kind"
> search all | count kind
```

```bash title="List compute instances"
> search is(instance)
```

```bash title="List name, type, cores, and memory for each account in CSV format"
> search is(instance) | list --csv name, instance_type, instance_cores as cores, instance_memory as memory, /ancestors.account.reported.name as account
```

```bash title="Write list of instance IDs and their creation times as markdown table to outfile.md"
> search is(instance) | list --markdown id, ctime | write outfile.md
```

```bash title="List compute instances with more than two CPU cores"
> search is(instance) and instance_cores > 2
```

```bash title="Get all instances and display the metadata of the last instance"
> search is(instance) | tail -1 | dump
```

```bash title="List volumes that are not in use, larger than 10GB, older than 30 days, and with no I/O during the past 7 days"
> search is(volume) and volume_status != in-use and volume_size > 10 and age > 30d and last_access > 7d
```

```bash title="Count the number of EC2 instances by account ID"
> search is(aws_ec2_instance) | count /ancestors.account.reported.id
```

```bash title="Aggregate RAM usage (bytes) data grouped by cloud, account, region, and instance type"
> search is(instance) and instance_status == running | aggregate /ancestors.cloud.reported.name as cloud, /ancestors.account.reported.name as account, /ancestors.region.reported.name as region, instance_type as type: sum(instance_memory * 1024 * 1024 * 1024) as memory_bytes
```

```bash title="Aggregate hourly instance cost grouped by cloud, account, region, and type from the cost information associated with the instance_type higher up in the graph"
> search is(instance) and instance_status == running | aggregate /ancestors.cloud.reported.name as cloud, /ancestors.account.reported.name as account, /ancestors.region.reported.name as region, instance_type as type: sum(/ancestors.instance_type.reported.ondemand_cost) as instances_hourly_cost_estimate
```

```bash title="Find orphaned load balancers that have no active backend"
> search is(aws_alb) and age > 7d and backends==[] with(empty, <-- is(aws_alb_target_group) and target_type = instance and age > 7d with(empty, <-- is(aws_ec2_instance) and instance_status != terminated)) <-[0:1]- is(aws_alb_target_group) or is(aws_alb)
```

```bash title="Ensure there is only one active access key available for any single IAM user"
> search is(access_key) and access_key_status = "Active" | aggregate user_name as user : sum(1) as number_of_keys
```

```bash title="Find expired SSL certificates"
> search is(certificate) and expires < @UTC@
```

```bash title="Find current quota consumption to prevent service interruptions"
> search is(quota) and usage > 0
```

```bash title="Find unused AWS volumes older than 30 days with no I/O in the past 7 days"
> search is(aws_ec2_volume) and age > 30d and last_access > 7d and last_update > 7d and volume_status = available
```

:::tip

Need help writing search syntax? Join us on [Discord](https://discord.gg/someengineering) and we'll do our best to help!

Have you written a search others may find useful? [Contributions to this page are welcomed!](https://github.com/someengineering/resoto.com/edit/main/docs/reference/search/examples.md)

:::
