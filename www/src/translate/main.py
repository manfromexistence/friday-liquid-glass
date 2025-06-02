import json
import time
import threading
from collections import deque
from deep_translator import GoogleTranslator
from concurrent.futures import ThreadPoolExecutor, as_completed

# List of language codes
language_codes = [
    "af", "sq", "am", "ar", "hy", "as", "ay", "az", "bm", "eu", "be", "bn",
    "bho", "bs", "bg", "ca", "ceb", "ny", "zh-CN", "zh-TW", "co", "hr", "cs",
    "da", "dv", "doi", "nl", "en", "eo", "et", "ee", "tl", "fi", "fr", "fy",
    "gl", "ka", "de", "el", "gn", "gu", "ht", "ha", "haw", "iw", "hi", "hmn",
    "hu", "is", "ig", "ilo", "id", "ga", "it", "ja", "jw", "kn", "kk", "km",
    "rw", "gom", "ko", "kri", "ku", "ckb", "ky", "lo", "la", "lv", "ln", "lt",
    "lg", "lb", "mk", "mai", "mg", "ms", "ml", "mt", "mi", "mr", "mni-Mtei",
    "lus", "mn", "my", "ne", "no", "or", "om", "ps", "fa", "pl", "pt", "pa",
    "qu", "ro", "ru", "sm", "sa", "gd", "nso", "sr", "st", "sn", "sd", "si",
    "sk", "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "tt", "te", "th",
    "ti", "ts", "tr", "tk", "ak", "uk", "ur", "ug", "uz", "vi", "cy", "xh",
    "yi", "yo", "zu"
]

# Max concurrent workers for translation API calls. Adjust based on API limits and testing.
MAX_WORKERS = 150

# Rate limiter: max 5 calls per 1 second
class RateLimiter:
    def __init__(self, max_calls, period=1.0):
        self.max_calls = max_calls
        self.period = period
        self.lock = threading.Lock()
        self.calls = deque()

    def acquire(self):
        while True:
            with self.lock:
                now = time.monotonic()
                # Remove timestamps older than period
                while self.calls and now - self.calls[0] > self.period:
                    self.calls.popleft()
                if len(self.calls) < self.max_calls:
                    # Allow the call
                    self.calls.append(now)
                    return
                # Otherwise compute sleep time until the oldest timestamp expires
                sleep_time = self.period - (now - self.calls[0])
            # Sleep outside the lock
            if sleep_time > 0:
                time.sleep(sleep_time)
            else:
                # In rare case of negative or zero, loop immediately
                continue

rate_limiter = RateLimiter(max_calls=5, period=1.0)

# Load your en.json
try:
    with open("en.json", "r", encoding="utf-8") as f:
        en_json = json.load(f)
except FileNotFoundError:
    print(
        "Error: en.json not found. Please make sure the file exists in the same directory as the script."
    )
    exit()
except json.JSONDecodeError:
    print("Error: en.json is not a valid JSON file.")
    exit()


def flatten_for_translation(d, parent_key='', sep='.'):
    flat_map_all_stringified = {}
    ordered_original_strings_info = []

    def _recursive_flatten(sub_d, current_parent_key):
        for k, v_orig in sub_d.items():
            new_key = f"{current_parent_key}{sep}{k}" if current_parent_key else k
            if isinstance(v_orig, dict):
                _recursive_flatten(v_orig, new_key)
            elif isinstance(v_orig, str):
                flat_map_all_stringified[new_key] = v_orig
                ordered_original_strings_info.append({
                    'key': new_key,
                    'value': v_orig
                })
            else:
                flat_map_all_stringified[new_key] = str(v_orig)

    _recursive_flatten(d, parent_key)
    return flat_map_all_stringified, ordered_original_strings_info


def unflatten(d, sep='.'):
    result_dict = {}
    for key, value in d.items():
        keys = key.split(sep)
        d_ref = result_dict
        for k_idx, k_val in enumerate(keys[:-1]):
            d_ref = d_ref.setdefault(k_val, {})
        d_ref[keys[-1]] = value
    return result_dict


# Prepare data from en.json - this is done once
flat_en_json_template, original_strings_info = flatten_for_translation(en_json)
texts_to_translate_list = [info['value'] for info in original_strings_info]

if not texts_to_translate_list:
    print("No text values found to translate in en.json.")
    exit()


def translate_and_save_language(lang_code):
    if lang_code == "en":
        return f"Skipped {lang_code} (source language)."

    print(f"Starting translation for: {lang_code}")

    try:
        # Enforce rate limit before each API call
        rate_limiter.acquire()
        translator = GoogleTranslator(source='en', target=lang_code)
        translated_texts_list = translator.translate_batch(texts_to_translate_list)

        if not translated_texts_list or len(translated_texts_list) != len(texts_to_translate_list):
            print(f"  Warning: Batch translation for {lang_code} returned unexpected result.")
            translated_json_content = en_json  # fallback
        else:
            current_lang_flat_dict = flat_en_json_template.copy()
            for i, string_info in enumerate(original_strings_info):
                current_lang_flat_dict[string_info['key']] = translated_texts_list[i]
            translated_json_content = unflatten(current_lang_flat_dict)

    except Exception as e:
        print(f"  Error during batch translation for {lang_code}: {e}")
        translated_json_content = en_json  # fallback

    # Save the translated JSON
    try:
        with open(f"{lang_code}.json", "w", encoding="utf-8") as out_file:
            json.dump(translated_json_content, out_file, ensure_ascii=False, indent=2)
        return f"Successfully translated and saved {lang_code}.json"
    except Exception as e_save:
        return f"Error saving {lang_code}.json: {e_save}"


# Main execution with ThreadPoolExecutor
start_time = time.time()
results = []

with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    future_to_lang = {
        executor.submit(translate_and_save_language, lang): lang
        for lang in language_codes if lang != "en"
    }

    for future in as_completed(future_to_lang):
        lang = future_to_lang[future]
        try:
            result_message = future.result()
            print(result_message)
            results.append(result_message)
        except Exception as exc:
            print(f"{lang} generated an exception: {exc}")
            results.append(f"Failed {lang} with exception: {exc}")

end_time = time.time()
print(f"\nAll translations processed in {end_time - start_time:.2f} seconds.")
# You can further inspect 'results' if needed