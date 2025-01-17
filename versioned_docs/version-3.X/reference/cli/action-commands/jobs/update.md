---
sidebar_label: update
---

# `jobs update` Command

The `jobs update` command updates a job.

## Usage

```bash
jobs update <id> [--schedule <cron_expression>] [--wait-for-event <event_name>] <command>
```

### Options

| Option                          | Description                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `--schedule <cron_expression>`  | The schedule as a `cron` expression                                                                                                             |
| `--wait-for-event <event_name>` | Waits for the specified event to occur (if this option is defined in conjunction with the `--schedule` option, the schedule must trigger first) |
| `--timeout`                     | Number of seconds for which the job is allowed to run before being automatically terminated (default 3600)                                      |

### Parameters

| Parameter | Description                                                    | Required? | Default Value |
| --------- | -------------------------------------------------------------- | --------- | ------------- |
| `id`      | Job identifier                                                 | ✔️        | N/A           |
| `command` | CLI command that will be executed when the job is triggered \* | ✔️        | N/A           |

\* It is recommended to either surround the `command` with single quotes (`'`) or escape special characters such as pipes (`|`) or semicolons (`;`). Multiple commands can be delimited using semicolons.
