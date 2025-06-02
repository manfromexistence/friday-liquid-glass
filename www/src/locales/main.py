# from deep_translator import GoogleTranslator

# translator = GoogleTranslator(source='auto', target='en')
# languages = translator.get_supported_languages(as_dict=True)

# for code, name in languages.items():
#     print(f"{code}: {name}")

# import json
# import time
# from deep_translator import GoogleTranslator

# # List of language codes you provided
# language_codes = [
#     # "af","sq","am","ar","hy","as","ay","az","bm",
#     "eu","be","bn","bho","bs","bg","ca","ceb","ny","zh-CN","zh-TW","co","hr","cs",
#     "da","dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de","el","gn","gu","ht","ha","haw","iw","hi","hmn",
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
#             time.sleep(0.2)  # Be polite to avoid rate-limiting
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

# List of language codes (shortened for example; use your full list)
language_codes = [
    # "af","sq","am","ar","hy","as","ay","az","bm",
    "eu","be","bn","bho","bs","bg","ca","ceb","ny","zh-CN","zh-TW","co","hr","cs",
    "da","dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de","el","gn","gu","ht","ha","haw","iw","hi","hmn",
    "hu","is","ig","ilo","id","ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
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

# Flatten the JSON
flat_en = flatten(en_json)
keys = list(flat_en.keys())
texts = list(flat_en.values())

# Combine all texts into a single string with a delimiter
delimiter = "|||"
combined_text = delimiter.join(texts)

# Translate to all languages
for lang in language_codes:
    if lang == "en":
        continue  # Skip English itself
    print(f"Translating to {lang}...")
    try:
        # Translate the combined text in one go
        translated_combined = GoogleTranslator(source='en', target=lang).translate(combined_text)
        # Split the translated text back into individual strings
        translated_texts = translated_combined.split(delimiter)
        
        # Ensure the number of translated texts matches the number of keys
        if len(translated_texts) != len(keys):
            print(f"Warning: Translation mismatch for {lang}. Expected {len(keys)} items, got {len(translated_texts)}.")
            continue
        
        # Create a dictionary with the translated texts
        translated = dict(zip(keys, translated_texts))
        
        # Restore nested structure
        translated_json = unflatten(translated)
        
        # Save to a new JSON file
        with open(f"{lang}.json", "w", encoding="utf-8") as out:
            json.dump(translated_json, out, ensure_ascii=False, indent=2)
        print(f"Successfully translated to {lang}")
        
    except Exception as e:
        print(f"Error translating to {lang}: {e}")
        # Optionally, save the original English text as a fallback
        with open(f"{lang}_fallback.json", "w", encoding="utf-8") as out:
            json.dump(en_json, out, ensure_ascii=False, indent=2)
    
    time.sleep(1)  # Small delay to avoid rate-limiting

print("Done!")
