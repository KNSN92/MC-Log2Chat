
import os
import json
import re
import typing

FORMAT_MATCHER = re.compile(r"% ?(s|\d+ ?\$ ?s)")

LANG_FOLDER = "downloaded_lang"

targets: dict[str, tuple[str, list[tuple[str, str]], list[tuple[str, str]]]] = {
    "death.": ("death", [], [("Player", "[a-zA-Z0-9_]+?"), ("By", ".+?"), ("Item", ".+?")]),
    "multiplayer.player.joined": ("join", [("Player", "[a-zA-Z0-9_]+?"), ("OldName", "[a-zA-Z0-9_]+?")], []),
    "multiplayer.player.left": ("leave", [("Player", "[a-zA-Z0-9_]+?")], []),
    "commands.message.display.incoming": ("tell_from", [("Sender", "[a-zA-Z0-9_]+?"), ("Message", ".*")], []),
    "commands.message.display.outgoing": ("tell_to", [("Receiver", "[a-zA-Z0-9_]+?"), ("Message", ".*")], []),
}

excluded_targets = [
    "death.attack.badRespawnPoint.link"
]

print(targets.items())

ESCAPE_TRANSLATE = str.maketrans({
    ".": "\\.",
    "*": "\\*",
    "+": "\\+",
    "^": "\\^",
    "$": "\\$",
    "|": "\\|",
    "?": "\\?",
    "(": "\\(",
    ")": "\\)",
    "[": "\\[",
    "]": "\\]",
    "{": "\\{",
    "}": "\\}",
})

extracted = {k[0] : set() for k in targets.values()}

lang_files = [f for f in os.listdir(LANG_FOLDER) if os.path.isfile(os.path.join(LANG_FOLDER, f)) and f.endswith(".json")]
lang_files.sort()
for i, lang_file in enumerate(lang_files):
    with open(os.path.join(LANG_FOLDER, lang_file), "r") as f:
        print("Extracting file:", lang_file, i)
        lang_data = json.load(f)
        for key, value in lang_data.items():
            if not any([key.startswith(target) for target in targets.keys()]) or any([key.startswith(excluded_target) for excluded_target in excluded_targets]):
                continue
            s_count, n_alreadies = 0, []
            for target, (category, s_names, n_names) in targets.items():
                if not key.startswith(target):
                    continue
                spliteds = re.split(FORMAT_MATCHER, value)
                for i, splited in enumerate(spliteds):
                    splited = typing.cast(str, splited)
                    if i % 2 == 0:
                        spliteds[i] = splited.translate(ESCAPE_TRANSLATE)
                        continue
                    splited = splited.replace(" ", "")
                    if splited.strip().startswith("s"):
                        if s_count < len(s_names):
                            tag, regex = s_names[s_count]
                            splited = rf"(?<{tag}>{regex})"
                            s_count += 1
                        else:
                            splited = r"([a-zA-Z0-9_]+?)"
                    else:
                        idx = int(splited[:-2]) - 1
                        if idx < len(n_names) and idx not in n_alreadies:
                            tag, regex = n_names[idx]
                            splited = rf"(?<{tag}>{regex})"
                            n_alreadies.append(idx)
                        else:
                            splited = r"([a-zA-Z0-9_]+?)"
                    spliteds[i] = splited
                extracted[category].add("".join(spliteds))
                break

extracted = {k : sorted(list(v)) for k, v in extracted.items()}
print("Creating extracted json file...")
with open("extracted_lang.json", "w") as f:
    json.dump(extracted, f, indent=2, ensure_ascii=False)

print("All done!")