---
icon: data
title: Give your agent your own files
description: Let your own AI agent read a folder of your notes and documents, read-only, and answer questions about them from your phone.
prev: a-home-for-your-apps
next: take-it-all-down
---

# Give your agent your own files

*Chapter 7 of [Your own AI agent, from anywhere](../your-own-ai-agent/). New: the agent side is tested on our own machines, the phone side not yet, so [tell us how it goes](mailto:stefano@edgible.com?subject=Playbook%20feedback).*

So far your agent knows what you tell it and what's on the web. This chapter lets it read **your own files**: a folder of notes, appointments, recipes, club minutes, anything you keep as text. Then you can ask from your phone, *"When's my dentist?"*, and it looks it up in your files, on your machine.

It's the first thing your agent can do that you couldn't give it before, and it's read-only: your agent can read the folder, never change it.

> **What you need**
>
> - [Chapters 1 to 4](../your-own-ai-agent/) done: your agent running on your machine.
> - A folder of files **on that machine**: text, Markdown or similar. A few notes are enough to start.
> - **A capable model.** Small models fumble tools. Your gateway's **fast** or **smart** is fine; a 7 billion parameter model on your own machine isn't.

## 1. Ask your AI to give your agent the folder

In your AI assistant on the machine (or in Claude, if it can reach it):

> Give my agent read-only access to the folder /home/me/notes, using the filesystem MCP server. Check that it can read the folder but not change it.

Change the folder to yours. It does three things, and tells you what it's doing:

- **Mounts the folder read-only** into your agent, so even a mistake can't change a file.
- **Adds the filesystem server** to your agent as `notes`, with only its reading tools: list, read and search. Writing, editing and moving are switched off.
- **Restarts your agent** so it picks the folder up.

## 2. Ask it a question about your files

Open your agent, on your computer or your phone, and be specific about where to look:

> List the files in /notes, read the ones that look relevant, and tell me what time my dentist appointment is.

Name the folder, and ask it to list, then read. Two things that trip people up:

- **"Look in my notes folder" isn't enough.** Your agent has its own workspace too, and may look there instead. Say `/notes`.
- **Its search finds file names, not words inside files.** So asking it to *search for the dentist* may find nothing, while asking it to *read the appointments file* works.

## 3. Check it can't change anything

> Add the line "Buy milk" to /notes/shopping.md, then tell me whether it worked.

The file stays as it was. Agents sometimes say a thing worked when it didn't, so **look at the file** instead of trusting the reply: that's the point of read-only, and why we show it to you.

## What you've just done

- **Your agent can read your own files,** and answers from your phone, with your documents staying on your machine.
- **It can't change them.** The folder is read-only twice over: the agent's writing tools are off, and the folder itself is locked.
- **You added a new ability without writing code,** using one of the open MCP servers any agent can use. The same steps work for others.

Honest limits: it reads text, not scans or photos, and it only sees that one folder. Add more folders, or other servers, the same way.

Done with it all? [Take it all down](../take-it-all-down/) removes it cleanly.

<details>
<summary>Prefer to do it by hand?</summary>

This is the notes folder setting of the [edgible-agent card](https://github.com/edgible-org/cards/tree/main/edgible-agent).

**A new agent:** in the card's `card.env`, set `OPENCLAW_NOTES_DIR` to the folder's absolute path before the first Start. Start sets up everything below on its own.

**An agent that's already running:** the setting only applies at the first Start, so do it in two parts.

1. In `docker-compose.yml`, under the `openclaw` service's `volumes:`, add `- /home/me/notes:/notes:ro`, and bring the agent up again.
2. Add the server, with its reading tools only:

```bash
docker compose --env-file edgible-agent/card.env -f edgible-agent/docker-compose.yml run --rm --no-deps openclaw-cli mcp add notes --command npx --arg -y --arg @modelcontextprotocol/server-filesystem@2.1.0 --arg /notes
docker compose --env-file edgible-agent/card.env -f edgible-agent/docker-compose.yml run --rm --no-deps openclaw-cli mcp tools notes --include read_text_file,read_multiple_files,list_directory,list_directory_with_sizes,directory_tree,search_files,get_file_info,list_allowed_directories
```

Check it with `mcp probe notes`: it should list 8 tools.

</details>
