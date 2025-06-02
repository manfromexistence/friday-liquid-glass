import json
import time
import threading
from collections import deque
from googletrans import Translator
from concurrent.futures import ThreadPoolExecutor, as_completed

# List of language codes (shortened for demonstration)
language_codes = [
    "af",  # afrikaans
    "sq",  # albanian
    "am",  # amharic
    "ar",  # arabic
    "hy",  # armenian
    "az",  # azerbaijani
    "eu",  # basque
    "be",  # belarusian
    "bn",  # bengali
    "bs",  # bosnian
    "bg",  # bulgarian
    "ca",  # catalan
    "ceb", # cebuano
    "ny",  # chichewa
    "zh-cn", # chinese (simplified)
    "zh-tw", # chinese (traditional)
    "co",  # corsican
    "hr",  # croatian
    "cs",  # czech
    "da",  # danish
    "nl",  # dutch
    "en",  # english
    "eo",  # esperanto
    "et",  # estonian
    "tl",  # filipino
    "fi",  # finnish
    "fr",  # french
    "fy",  # frisian
    "gl",  # galician
    "ka",  # georgian
    "de",  # german
    "el",  # greek
    "gu",  # gujarati
    "ht",  # haitian creole
    "ha",  # hausa
    "haw", # hawaiian
    "iw",  # hebrew
    "he",  # hebrew
    "hi",  # hindi
    "hmn", # hmong
    "hu",  # hungarian
    "is",  # icelandic
    "ig",  # igbo
    "id",  # indonesian
    "ga",  # irish
    "it",  # italian
    "ja",  # japanese
    "jw",  # javanese
    "kn",  # kannada
    "kk",  # kazakh
    "km",  # khmer
    "ko",  # korean
    "ku",  # kurdish (kurmanji)
    "ky",  # kyrgyz
    "lo",  # lao
    "la",  # latin
    "lv",  # latvian
    "lt",  # lithuanian
    "lb",  # luxembourgish
    "mk",  # macedonian
    "mg",  # malagasy
    "ms",  # malay
    "ml",  # malayalam
    "mt",  # maltese
    "mi",  # maori
    "mr",  # marathi
    "mn",  # mongolian
    "my",  # myanmar (burmese)
    "ne",  # nepali
    "no",  # norwegian
    "or",  # odia
    "ps",  # pashto
    "fa",  # persian
    "pl",  # polish
    "pt",  # portuguese
    "pa",  # punjabi
    "ro",  # romanian
    "ru",  # russian
    "sm",  # samoan
    "gd",  # scots gaelic
    "sr",  # serbian
    "st",  # sesotho
    "sn",  # shona
    "sd",  # sindhi
    "si",  # sinhala
    "sk",  # slovak
    "sl",  # slovenian
    "so",  # somali
    "es",  # spanish
    "su",  # sundanese
    "sw",  # swahili
    "sv",  # swedish
    "tg",  # tajik
    "ta",  # tamil
    "te",  # telugu
    "th",  # thai
    "tr",  # turkish
    "uk",  # ukrainian
    "ur",  # urdu
    "ug",  # uyghur
    "uz",  # uzbek
    "vi",  # vietnamese
    "cy",  # welsh
    "xh",  # xhosa
    "yi",  # yiddish
    "yo",  # yoruba
    "zu"   # zulu
]

# Reduce concurrency to help avoid address/port exhaustion
MAX_WORKERS = 20

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

rate_limiter = RateLimiter(max_calls=5, period=1.0)

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
        translator = Translator()

        translated_texts_list = []
        for text in texts_to_translate_list:
            try:
                rate_limiter.acquire()  # rate-limit each call
                result = translator.translate(text, dest=lang_code)
                # Check for unexpected None results
                if result and hasattr(result, 'text'):
                    translated_texts_list.append(result.text)
                else:
                    # If translator returns None or invalid structure, store fallback
                    translated_texts_list.append(text)
            except Exception as single_error:
                print(f"  Error translating text for {lang_code}: {single_error}")
                translated_texts_list.append(text)

        if not translated_texts_list or len(translated_texts_list) != len(texts_to_translate_list):
            print(f"  Warning: Translation for {lang_code} returned unexpected result.")
            translated_json_content = en_json  # fallback
        else:
            current_lang_flat_dict = flat_en_json_template.copy()
            for i, string_info in enumerate(original_strings_info):
                current_lang_flat_dict[string_info['key']] = translated_texts_list[i]
            translated_json_content = unflatten(current_lang_flat_dict)

    except Exception as e:
        print(f"  Error during translation for {lang_code}: {e}")
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