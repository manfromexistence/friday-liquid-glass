import json
import time
from deep_translator import GoogleTranslator

# List of language codes
language_codes = [
    # "af","sq","am","ar","hy","as","ay","az","bm","eu",
    # "be","bn","bho","bs","bg","ca","ceb","ny","zh-CN","zh-TW",
    # "co","hr","cs","da","dv","doi","nl","en","eo","et",
    # "ee","tl","fi","fr","fy","gl","ka","de","el","gn",
    # "gu","ht","ha","haw","iw","hi","hmn","hu",
    # "is","ig","ilo","id","ga","it","ja",
    "jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
    "lg","lb","mk","mai","mg","ms","ml","mt","mi","mr","mni-Mtei","lus","mn","my","ne","no","or","om","ps","fa","pl","pt","pa",
    "qu","ro","ru","sm","sa","gd","nso","sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te","th",
    "ti","ts","tr","tk","ak","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu"
]

# Load your en.json
try:
    with open("en.json", "r", encoding="utf-8") as f:
        en_json = json.load(f)
except FileNotFoundError:
    print("Error: en.json not found. Please make sure the file exists in the same directory as the script.")
    exit()
except json.JSONDecodeError:
    print("Error: en.json is not a valid JSON file.")
    exit()

# Helper: Flattens the dictionary and identifies original strings for translation.
# Returns:
#   - flat_map_all_stringified: A flat dictionary where all values are strings (original strings or stringified non-strings).
#                               Used as a template for reconstructing the JSON with translated values.
#   - ordered_original_strings_info: A list of dictionaries, each {'key': flat_key, 'value': original_string_to_translate}.
#                                    The order is crucial and is maintained by translate_batch.
def flatten_for_translation(d, parent_key='', sep='.'):
    flat_map_all_stringified = {}
    ordered_original_strings_info = []

    def _recursive_flatten(sub_d, current_parent_key):
        for k, v_orig in sub_d.items():
            new_key = f"{current_parent_key}{sep}{k}" if current_parent_key else k
            
            if isinstance(v_orig, dict):
                _recursive_flatten(v_orig, new_key) # Recurse for nested dicts
            elif isinstance(v_orig, str):
                # This is an original string that needs translation
                flat_map_all_stringified[new_key] = v_orig
                ordered_original_strings_info.append({'key': new_key, 'value': v_orig})
            else:
                # Non-string, non-dict (numbers, booleans, nulls). Stringify for structure.
                flat_map_all_stringified[new_key] = str(v_orig)
                # We don't add these to ordered_original_strings_info as they aren't translated.
                # They are preserved in flat_map_all_stringified.

    _recursive_flatten(d, parent_key)
    return flat_map_all_stringified, ordered_original_strings_info

# Helper: unflatten to restore structure
def unflatten(d, sep='.'):
    result_dict = {}
    for key, value in d.items():
        keys = key.split(sep)
        d_ref = result_dict
        for k_idx, k_val in enumerate(keys[:-1]):
            d_ref = d_ref.setdefault(k_val, {})
        d_ref[keys[-1]] = value
    return result_dict

# Prepare data from en.json
flat_en_json_template, original_strings_info = flatten_for_translation(en_json)
texts_to_translate_list = [info['value'] for info in original_strings_info]

if not texts_to_translate_list:
    print("No text values found to translate in en.json.")
    exit()

for lang in language_codes:
    if lang == "en":
        # Optionally, save en.json in the same format if needed for consistency
        # with open("en.json", "w", encoding="utf-8") as out:
        #     json.dump(en_json, out, ensure_ascii=False, indent=2)
        continue

    print(f"Processing language: {lang}...")
    
    try:
        # Use translate_batch for efficiency and reliability
        translator = GoogleTranslator(source='en', target=lang)
        print(f"  Translating {len(texts_to_translate_list)} text segments for {lang} in batch...")
        translated_texts_list = translator.translate_batch(texts_to_translate_list)

        if translated_texts_list is None or len(translated_texts_list) != len(texts_to_translate_list):
            print(f"  Warning: Batch translation for {lang} returned an unexpected result.")
            print(f"  Expected {len(texts_to_translate_list)} segments, got {len(translated_texts_list) if translated_texts_list else 'None'}.")
            print(f"  Falling back to saving original English text for {lang}.json")
            translated_json_content = en_json # Fallback content
        else:
            # Create a new flat dictionary for the translated language
            # Start with the template that includes stringified non-string values
            current_lang_flat_dict = flat_en_json_template.copy()
            
            # Populate with translated strings
            for i, string_info in enumerate(original_strings_info):
                current_lang_flat_dict[string_info['key']] = translated_texts_list[i]
            
            translated_json_content = unflatten(current_lang_flat_dict)
            print(f"  Batch translation successful for {lang}.")

    except Exception as e:
        print(f"  Error during batch translation for {lang}: {e}")
        print(f"  Falling back to saving original English text for {lang}.json")
        translated_json_content = en_json # Fallback content
        # Optional: Implement individual translation as a further fallback here if desired

    # Save the translated JSON
    try:
        with open(f"{lang}.json", "w", encoding="utf-8") as out_file:
            json.dump(translated_json_content, out_file, ensure_ascii=False, indent=2)
        print(f"  Successfully saved {lang}.json")
    except Exception as e_save:
        print(f"  Error saving {lang}.json: {e_save}")
        # If even saving the fallback fails, there's little more to do in this automated step
        print(f"    Could not save {lang}.json (even fallback).")


print("\nAll translations processed!")