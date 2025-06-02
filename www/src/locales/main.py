import json
import time
from deep_translator import GoogleTranslator

# List of language codes
language_codes = [
    # "af","sq","am","ar","hy","as","ay","az","bm",
    # "eu","be","bn","bho","bs","bg","ca","ceb","ny",
    # "zh-CN","zh-TW","co","hr","cs","da",
    # "dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de",
    # "el","gn","gu","ht","ha","haw","iw","hi","hmn","hu",
    "is","ig","ilo","id",
    "ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
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
def flatten_for_translation(d, parent_key='', sep='.'):
    flat_map_all_stringified = {}  # Stores all values as strings, for structure
    ordered_original_strings_info = []  # List of {'key': flat_key, 'value': original_string}

    def _recursive_flatten(sub_d, current_parent_key):
        for k, v_orig in sub_d.items():
            new_key = f"{current_parent_key}{sep}{k}" if current_parent_key else k
            
            if isinstance(v_orig, dict):
                _recursive_flatten(v_orig, new_key)
            elif isinstance(v_orig, str):
                flat_map_all_stringified[new_key] = v_orig
                ordered_original_strings_info.append({'key': new_key, 'value': v_orig})
            else: # Non-string, non-dict (numbers, booleans, nulls)
                flat_map_all_stringified[new_key] = str(v_orig) # Store as string for structure

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
flat_en_json_struct, original_strings_info = flatten_for_translation(en_json)
texts_to_translate = [info['value'] for info in original_strings_info]

if not texts_to_translate:
    print("No text values found to translate in en.json.")
    exit()

DELIMITER = "````,```" # Changed delimiter
big_text_to_translate = DELIMITER.join(texts_to_translate)

for lang in language_codes:
    if lang == "en":
        continue

    print(f"Processing language: {lang}...")
    translated_json_content = None
    use_individual_translation = False

    # Attempt bulk translation
    try:
        print(f"  Attempting bulk translation for {lang}...")
        translator = GoogleTranslator(source='en', target=lang)
        # Ensure the payload is not excessively long for the translator API if issues persist
        # For some APIs, very long strings can be problematic
        translated_big_text = translator.translate(big_text_to_translate)

        if translated_big_text is None:
            print(f"  Warning: Bulk translation returned None for language {lang}.")
            use_individual_translation = True
        else:
            translated_segments = translated_big_text.split(DELIMITER)
            if len(translated_segments) == len(texts_to_translate):
                temp_translated_flat_dict = flat_en_json_struct.copy()
                for i, string_info in enumerate(original_strings_info):
                    temp_translated_flat_dict[string_info['key']] = translated_segments[i]
                translated_json_content = unflatten(temp_translated_flat_dict)
                print(f"  Bulk translation successful for {lang}.")
            else:
                print(f"  Warning: Mismatch in translated segments for {lang}.")
                print(f"  Expected {len(texts_to_translate)} segments, got {len(translated_segments)}.")
                print(f"  This might be due to the delimiter '{DELIMITER}' being altered or removed during translation.")
                use_individual_translation = True
    
    except Exception as e_bulk:
        print(f"  Error during bulk translation for {lang}: {e_bulk}")
        use_individual_translation = True

    # Fallback to individual translation if bulk failed or was problematic
    if use_individual_translation:
        print(f"  Falling back to individual translation for {lang}...")
        temp_translated_flat_dict_individual = flat_en_json_struct.copy()
        success_count = 0
        fail_count = 0
        for string_info in original_strings_info:
            key = string_info['key']
            text_to_translate_individually = string_info['value']
            try:
                translated_text = GoogleTranslator(source='en', target=lang).translate(text_to_translate_individually)
                if translated_text is not None:
                    temp_translated_flat_dict_individual[key] = translated_text
                    success_count +=1
                else:
                    print(f"    Warning: Individual translation for key '{key}' returned None. Using original text.")
                    fail_count += 1
                time.sleep(0.1) 
            except Exception as e_individual:
                print(f"    Error translating key '{key}' individually: {e_individual}. Using original text.")
                fail_count += 1
        
        translated_json_content = unflatten(temp_translated_flat_dict_individual)
        print(f"  Individual translation for {lang} complete. Successes: {success_count}, Failures (used original): {fail_count}")

    # Save the translated JSON
    if translated_json_content:
        try:
            with open(f"{lang}.json", "w", encoding="utf-8") as out_file:
                json.dump(translated_json_content, out_file, ensure_ascii=False, indent=2)
            print(f"  Successfully saved {lang}.json")
        except Exception as e_save:
            print(f"  Error saving {lang}.json: {e_save}")
            print(f"  Attempting to save original English content as fallback for {lang}.json")
            try:
                with open(f"{lang}.json", "w", encoding="utf-8") as out_file_fb:
                    json.dump(en_json, out_file_fb, ensure_ascii=False, indent=2)
            except Exception as e_save_fb:
                print(f"    Could not even save fallback for {lang}.json: {e_save_fb}")
    else:
        print(f"  Critical error: No translatable JSON content was generated for {lang}. Saving original English text.")
        with open(f"{lang}.json", "w", encoding="utf-8") as out_file:
            json.dump(en_json, out_file, ensure_ascii=False, indent=2)

print("All translations processed!")