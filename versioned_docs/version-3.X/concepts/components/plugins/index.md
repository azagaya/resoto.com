# Plugins

```mdx-code-block
import DocCardList from '@theme/DocCardList';
```

Plugins can be used to perform actions whenever something happens within Resoto. Cleanup plugins for instance exist for automated cleanup that is more complex than what a simple CLI search can do. Plugins are loaded by [Resoto Worker](../worker.md) and often come with their own configuration. Enable or configure them using the [`config edit resoto.worker`](../../../reference/cli/setup-commands/configs/edit.md) command.

<DocCardList />
