import os
import requests

VERSION_MANIFEST_URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
RESOURCE_URL = "https://resources.download.minecraft.net/{0}/{1}"

LANG_FOLDER = "downloaded_lang"

print("downloading version manifest...")
ver_manifest_json = requests.get(VERSION_MANIFEST_URL).json()
print("downloading version json...")
version_json = requests.get(ver_manifest_json["versions"][0]["url"]).json()
print("downloading asset index json...")
assetindex_json = requests.get(version_json["assetIndex"]["url"]).json()

langfiles = []
for file, obj in assetindex_json["objects"].items():
    if file.startswith("minecraft/lang/"):
        langfiles.append((file.split("/")[-1], obj["hash"]))

download_path = os.path.abspath("./downloaded_lang/")
os.makedirs(download_path, exist_ok=True)

for name, obj_hash in langfiles:
    try:
        with open(os.path.abspath(os.path.join(f"./{LANG_FOLDER}/", name)), "x") as f:
            f.write(requests.get(RESOURCE_URL.format(obj_hash[0:2], obj_hash)).text)
    except FileExistsError:
        print(f"\"{name}\" is already exists skipped")
    else:
        print(f"\"{name}\" downloaded")

