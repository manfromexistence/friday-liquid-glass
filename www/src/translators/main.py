import json
import time
import threading
from collections import deque
from googletrans import Translator
from concurrent.futures import ThreadPoolExecutor, as_completed

# List of language codes
language_codes = [
    "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", 
    "ceb", "ny", "zh-cn", "zh-tw", "co", "hr", "cs", "da", "nl", "en", "eo", 
    "et", "tl", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", 
    "haw", "iw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", 
    "jw", "kn", "kk", "km", "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", 
    "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "or", 
    "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", 
    "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "te", 
    "th", "tr", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"
]

# Reduce concurrency to help avoid connection issues
MAX_WORKERS = 10

# Rate limiter: max 3 calls per 2 seconds (more conservative)
class RateLimiter:
    def __init__(self, max_calls, period=2.0):
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

rate_limiter = RateLimiter(max_calls=3, period=2.0)

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

def safe_translate(translator, text, dest_lang, max_retries=3):
    """Safely translate text with retries and error handling"""
    for attempt in range(max_retries):
        try:
            rate_limiter.acquire()
            result = translator.translate(text, dest=dest_lang)
            
            # Check if result is valid
            if result and hasattr(result, 'text') and result.text:
                return result.text
            else:
                print(f"    Attempt {attempt + 1}: Invalid result for text: {text[:50]}...")
                if attempt < max_retries - 1:
                    time.sleep(1)  # Wait before retry
                    translator = Translator()  # Create new translator instance
                continue
                
        except Exception as e:
            print(f"    Attempt {attempt + 1} failed for '{text[:50]}...': {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait longer before retry
                translator = Translator()  # Create new translator instance
            else:
                print(f"    All attempts failed, using original text")
                return text
    
    return text  # Fallback to original text

def translate_and_save_language(lang_code):
    if lang_code == "en":
        return f"Skipped {lang_code} (source language)."

    print(f"Starting translation for: {lang_code}")

    try:
        translator = Translator()
        translated_texts_list = []
        
        for i, text in enumerate(texts_to_translate_list):
            if i % 10 == 0:  # Progress indicator
                print(f"  Translating {i+1}/{len(texts_to_translate_list)} for {lang_code}")
            
            translated_text = safe_translate(translator, text, lang_code)
            translated_texts_list.append(translated_text)

        # Build the final JSON
        current_lang_flat_dict = flat_en_json_template.copy()
        for i, string_info in enumerate(original_strings_info):
            current_lang_flat_dict[string_info['key']] = translated_texts_list[i]
        translated_json_content = unflatten(current_lang_flat_dict)

    except Exception as e:
        print(f"  Critical error during translation for {lang_code}: {e}")
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