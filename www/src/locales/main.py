# import json
# import time
# from deep_translator import GoogleTranslator

# # List of language codes you provided
# language_codes = [
#     # "af","sq","am","ar","hy","as","ay","az","bm",
#     # "eu","be","bn","bho","bs","bg","ca","ceb","ny",
#     # "zh-CN","zh-TW","co","hr","cs","da",
#     # "dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de",
#     "el","gn","gu","ht","ha","haw","iw","hi","hmn",
#     "hu","is","ig","ilo","id","ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
#     "lg","lb","mk","mai","mg","ms","ml","mt","mi","mr","mni-Mtei","lus","mn","my","ne","no","or","om","ps","fa","pl","pt","pa",
#     "qu","ro","ru","sm","sa","gd","nso","sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te","th",
#     "ti","ts","tr","tk","ak","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu"
# ]

# # Load your en.json
# with open("en.json", "r", encoding="utf-8") as f:
#     en_json = json.load(f)

# # Helper: flatten nested dict for easier translation
# def flatten(d, parent_key='', sep='.'):
#     items = []
#     for k, v in d.items():
#         new_key = f"{parent_key}{sep}{k}" if parent_key else k
#         if isinstance(v, dict):
#             items.extend(flatten(v, new_key, sep=sep).items())
#         else:
#             items.append((new_key, v))
#     return dict(items)

# # Helper: unflatten to restore structure
# def unflatten(d, sep='.'):
#     result_dict = {}
#     for key, value in d.items():
#         keys = key.split(sep)
#         d_ref = result_dict
#         for k in keys[:-1]:
#             d_ref = d_ref.setdefault(k, {})
#         d_ref[keys[-1]] = value
#     return result_dict

# flat = flatten(en_json)

# for lang in language_codes:
#     if lang == "en":
#         continue  # Skip English itself
#     translated = {}
#     print(f"Translating to {lang}...")
#     for key, text in flat.items():
#         try:
#             translated[key] = GoogleTranslator(source='en', target=lang).translate(text)
#             # time.sleep(0.2)  # Be polite to avoid rate-limiting
#         except Exception as e:
#             print(f"Error translating {key} to {lang}: {e}")
#             translated[key] = text  # Fallback to English on error

#     # Restore nested structure and save
#     translated_json = unflatten(translated)
#     with open(f"{lang}.json", "w", encoding="utf-8") as out:
#         json.dump(translated_json, out, ensure_ascii=False, indent=2)

# print("Done!")


# import json
# import time
# from deep_translator import GoogleTranslator

# # List of language codes you provided
# language_codes = [
#     # "af","sq","am","ar","hy","as","ay","az","bm",
#     # "eu","be","bn","bho","bs","bg","ca","ceb","ny",
#     # "zh-CN","zh-TW","co","hr","cs","da",
#     # "dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de",
#     # "el","gn","gu","ht","ha","haw","iw","hi","hmn","hu",
#     "is","ig","ilo","id","ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
#     "lg","lb","mk","mai","mg","ms","ml","mt","mi","mr","mni-Mtei","lus","mn","my","ne","no","or","om","ps","fa","pl","pt","pa",
#     "qu","ro","ru","sm","sa","gd","nso","sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te","th",
#     "ti","ts","tr","tk","ak","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu"
# ]

# # Load your en.json
# with open("en.json", "r", encoding="utf-8") as f:
#     en_json = json.load(f)

# # Helper: flatten nested dict for easier translation
# def flatten(d, parent_key='', sep='.'):
#     items = []
#     for k, v in d.items():
#         new_key = f"{parent_key}{sep}{k}" if parent_key else k
#         if isinstance(v, dict):
#             items.extend(flatten(v, new_key, sep=sep).items())
#         else:
#             items.append((new_key, v))
#     return dict(items)

# # Helper: unflatten to restore structure
# def unflatten(d, sep='.'):
#     result_dict = {}
#     for key, value in d.items():
#         keys = key.split(sep)
#         d_ref = result_dict
#         for k in keys[:-1]:
#             d_ref = d_ref.setdefault(k, {})
#         d_ref[keys[-1]] = value
#     return result_dict

# flat = flatten(en_json)

# for lang in language_codes:
#     if lang == "en":
#         continue  # Skip English itself
#     translated = {}
#     print(f"Translating to {lang}...")
#     for key, text in flat.items():
#         try:
#             translated[key] = GoogleTranslator(source='en', target=lang).translate(text)
#             # time.sleep(0.2)  # Be polite to avoid rate-limiting
#         except Exception as e:
#             print(f"Error translating {key} to {lang}: {e}")
#             translated[key] = text  # Fallback to English on error

#     # Restore nested structure and save
#     translated_json = unflatten(translated)
#     with open(f"{lang}.json", "w", encoding="utf-8") as out:
#         json.dump(translated_json, out, ensure_ascii=False, indent=2)

# print("Done!")

import json
import time
from deep_translator import GoogleTranslator

# List of language codes you provided
language_codes = [
    # "af","sq","am","ar","hy","as","ay","az","bm",
    # "eu","be","bn","bho","bs","bg","ca","ceb","ny",
    # "zh-CN","zh-TW","co","hr","cs","da",
    # "dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de",
    # "el","gn","gu","ht","ha","haw","iw","hi","hmn","hu",
    "is","ig","ilo","id","ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
    "lg","lb","mk","mai","mg","ms","ml","mt","mi","mr","mni-Mtei","lus","mn","my","ne","no","or","om","ps","fa","pl","pt","pa",
    "qu","ro","ru","sm","sa","gd","nso","sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te","th",
    "ti","ts","tr","tk","ak","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu"
]

# Load your en.json
with open("en.json", "r", encoding="utf-8") as f:
    en_json = json.load(f)

# Helper: flatten nested dict for easier translation
def flatten(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

# Helper: unflatten to restore structure
def unflatten(d, sep='.'):
    result_dict = {}
    for key, value in d.items():
        keys = key.split(sep)
        d_ref = result_dict
        for k in keys[:-1]:
            d_ref = d_ref.setdefault(k, {})
        d_ref[keys[-1]] = value
    return result_dict

flat = flatten(en_json)

for lang in language_codes:
    if lang == "en":
        continue  # Skip English itself
    translated = {}
    print(f"Translating to {lang}...")
    for key, text in flat.items():
        try:
            translated[key] = GoogleTranslator(source='en', target=lang).translate(text)
            # time.sleep(0.2)  # Be polite to avoid rate-limiting
        except Exception as e:
            print(f"Error translating {key} to {lang}: {e}")
            translated[key] = text  # Fallback to English on error

    # Restore nested structure and save
    translated_json = unflatten(translated)
    with open(f"{lang}.json", "w", encoding="utf-8") as out:
        json.dump(translated_json, out, ensure_ascii=False, indent=2)

print("Done!")
