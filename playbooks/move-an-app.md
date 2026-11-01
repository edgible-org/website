---
icon: machine
title: Move an app to another machine
description: Move an app and its data from one computer to another, even a different kind of computer, and check that nothing was lost on the way.
prev: restore-and-prove-it
---

# Move an app to another machine

*Chapter 3 of [Looking after it](../looking-after-it/). *New: we ran this once, moving a wiki from a Mac to a Windows laptop. Other pairs of machines are still to be tried, so [tell us how it goes](mailto:stefano@edgible.com?subject=Playbook%20feedback).**

Sooner or later an app outgrows its machine, or the machine goes. A move is a restore (chapter 2) onto a different computer, then a switch. The old copy keeps serving until the switch, so you can stop at any point and nothing is lost.

> **What you need**
>
> - [Chapters 1 and 2](../back-up-an-app/) done, so you know a backup of this app restores.
> - The new machine, set up as in [Get Edgible running](../get-edgible-running/) and showing as online in Edgible. Your assistant can set it up.
> - Your AI assistant on the old machine, and on the new one. We ran it that way, with you passing the file between them.
> - A way to carry the backup across (step 2).

## 1. Back up on the old machine

> Back up my team wiki, and tell me what will stop first.

It's the same backup as in [chapter 1](../back-up-an-app/). Your assistant tells you what stops and for how long, and waits for your yes. In our run, a small wiki stopped for **8 seconds**. It then reports a fingerprint of the data, for us "3 pages", which the new machine will have to match.

Ask for a single file you can carry:

> Pack that backup into one file I can copy, and give me its checksum.

## 2. Carry it to the new machine

The backup holds the app's settings and its passwords and keys, so treat it like a password. Don't email it and don't put it in a shared chat or a public folder. A USB stick is the simplest and safest way. If both computers are on the same network, your assistant can also share the one file for a few minutes and shut the share down as soon as the other machine has it. We did that, and checked the checksum on the other side: it matched exactly.

> Copy that file to my new machine, and check that it arrived whole.

## 3. Restore it on the new machine

> Restore that backup on this machine as my team wiki, and tell me if it matches.

Your assistant checks every file, loads the data, starts the app, and compares the fingerprint with the backup's: "3 pages, same as the backup: pass". The old machine is still serving the real app, so nothing has changed for anyone yet.

Two things to expect when the machines are different:

- **The processor can differ.** Our Mac has an Apple chip and the Windows laptop an Intel-style one. The wiki ran on both, because its image supports both. Your assistant checks this when it starts the app, and tells you if an app won't run on the new machine.
- **The app's settings name the old machine.** Your assistant changes the device name in the settings to the new one before publishing.

## 4. Switch

This is the only step where your app is down. Ask first:

> Switch my team wiki to the new machine. Tell me when it's down and when it's back.

Your assistant removes the app's address on the old machine, publishes it from the new one, and waits until the address answers. In our run that took about a minute and a half. The address stays the same, so bookmarks and links keep working.

## 5. Check it, as a person

Open the address, sign in, and look. We checked three things, and so should you:

- **Your pages are there,** with the text you wrote.
- **Your account still works,** with the same password. Accounts live in the app's data, so they move with it.
- **The sign-in in front of the app** is still the one you chose.

If anything is missing, don't delete anything on the old machine. Its data and the backup are untouched by the move, and we didn't need to go back, so putting the app back there is untried.

## 6. Retire the old copy, later

Keep the old machine's copy of the data and the backup for a few days. When you're sure, ask your assistant to remove them, and tell it to ask before each deletion.

## What you've just done

- **You moved an app and its data** to a different kind of computer.
- **You proved it** with a fingerprint and a look, not by hoping.
- **You kept the way back** open until you were sure.

<details>
<summary>Prefer to do it by hand?</summary>

card-kit's `backup-card`, `restore-card` and `verify-card`, from the Edgible skill. On the old machine:

```bash
python3 backup-card.py ~/otter-wiki --dry-run
python3 backup-card.py ~/otter-wiki                       # writes ~/otter-wiki-backups/<stamp>/
tar -czf otter-wiki-backup.tgz -C ~/otter-wiki-backups <stamp>
shasum -a 256 otter-wiki-backup.tgz                       # sha256sum on Linux
```

On the new machine, after the file arrives and the checksum matches:

```bash
mkdir in && tar -xzf otter-wiki-backup.tgz -C in
python3 restore-card.py in/<stamp> ~/otter-wiki --dry-run
python3 restore-card.py in/<stamp> ~/otter-wiki --yes
sed -i 's/^DEVICE=.*/DEVICE=<new device name>/' ~/otter-wiki/card.env
```

Then publish with the card's README (the Publish step), after `edgible app delete otter-wiki --yes` on the old side.

Snags we hit, so you don't have to:

- **A backup packed on a Mac** includes hidden `._` files. Delete them from the unpacked copy (`find in -name '._*' -delete`) before restoring, or pack with `COPYFILE_DISABLE=1 tar …`.
- **Run the restore as your own user** when you can, not with `sudo`. If you used `sudo`, run `sudo chown -R "$USER": ~/otter-wiki` afterwards, or the Publish step can't read `card.env`.

</details>
