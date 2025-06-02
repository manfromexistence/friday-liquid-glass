# from deep_translator import GoogleTranslator

# translator = GoogleTranslator(source='auto', target='en')
# languages = translator.get_supported_languages(as_dict=True)

# for code, name in languages.items():
#     print(f"{code}: {name}")

import json
import time
from deep_translator import GoogleTranslator

# List of language codes you provided
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

flat = flatten(en_json)

for lang in language_codes:
    if lang == "en":
        continue  # Skip English itself
    translated = {}
    print(f"Translating to {lang}...")
    for key, text in flat.items():
        try:
            translated[key] = GoogleTranslator(source='en', target=lang).translate(text)
            time.sleep(0.2)  # Be polite to avoid rate-limiting
        except Exception as e:
            print(f"Error translating {key} to {lang}: {e}")
            translated[key] = text  # Fallback to English on error

    # Restore nested structure and save
    translated_json = unflatten(translated)
    with open(f"{lang}.json", "w", encoding="utf-8") as out:
        json.dump(translated_json, out, ensure_ascii=False, indent=2)

print("Done!")











# import json
# import time
# from deep_translator import GoogleTranslator

# # List of language codes (shortened for example; use your full list)
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

# # Flatten the JSON
# flat_en = flatten(en_json)
# keys = list(flat_en.keys())
# texts = list(flat_en.values())

# # Combine all texts into a single string with a delimiter
# delimiter = "|||"
# combined_text = delimiter.join(texts)

# # Translate to all languages
# for lang in language_codes:
#     if lang == "en":
#         continue  # Skip English itself
#     print(f"Translating to {lang}...")
#     try:
#         # Translate the combined text in one go
#         translated_combined = GoogleTranslator(source='en', target=lang).translate(combined_text)
#         # Split the translated text back into individual strings
#         translated_texts = translated_combined.split(delimiter)
        
#         # Ensure the number of translated texts matches the number of keys
#         if len(translated_texts) != len(keys):
#             print(f"Warning: Translation mismatch for {lang}. Expected {len(keys)} items, got {len(translated_texts)}.")
#             continue
        
#         # Create a dictionary with the translated texts
#         translated = dict(zip(keys, translated_texts))
        
#         # Restore nested structure
#         translated_json = unflatten(translated)
        
#         # Save to a new JSON file
#         with open(f"{lang}.json", "w", encoding="utf-8") as out:
#             json.dump(translated_json, out, ensure_ascii=False, indent=2)
#         print(f"Successfully translated to {lang}")
        
#     except Exception as e:
#         print(f"Error translating to {lang}: {e}")
#         # Optionally, save the original English text as a fallback
#         with open(f"{lang}_fallback.json", "w", encoding="utf-8") as out:
#             json.dump(en_json, out, ensure_ascii=False, indent=2)
    
#     time.sleep(1)  # Small delay to avoid rate-limiting

# print("Done!")

# import json
# import time
# from deep_translator import GoogleTranslator

# # Hardcoded text string from en.json
# combined_text = "What can I help you with?###UNIQUEDELIM123###Welcome to Friday, your AI-powered assistant!###UNIQUEDELIM123###Ask me anything or start a new task.###UNIQUEDELIM123###Need assistance? I'm here to guide you.###UNIQUEDELIM123###Start New###UNIQUEDELIM123###Home###UNIQUEDELIM123###Automations###UNIQUEDELIM123###Variants###UNIQUEDELIM123###Projects###UNIQUEDELIM123###Spaces###UNIQUEDELIM123###Library###UNIQUEDELIM123###More###UNIQUEDELIM123###Settings###UNIQUEDELIM123###Profile###UNIQUEDELIM123###Dashboard###UNIQUEDELIM123###Analytics###UNIQUEDELIM123###Sign In###UNIQUEDELIM123###Sign Up###UNIQUEDELIM123###Sign Out###UNIQUEDELIM123###Forgot Password?###UNIQUEDELIM123###Reset Password###UNIQUEDELIM123###Email Address###UNIQUEDELIM123###Password###UNIQUEDELIM123###Confirm Password###UNIQUEDELIM123###Overview###UNIQUEDELIM123###Recent Activity###UNIQUEDELIM123###Quick Actions###UNIQUEDELIM123###Tasks Completed###UNIQUEDELIM123###Active Projects###UNIQUEDELIM123###Automation Runs###UNIQUEDELIM123###Create New Project###UNIQUEDELIM123###Edit Project###UNIQUEDELIM123###Delete Project###UNIQUEDELIM123###Enter project title###UNIQUEDELIM123###Enter project description###UNIQUEDELIM123###In Progress###UNIQUEDELIM123###Completed###UNIQUEDELIM123###On Hold###UNIQUEDELIM123###Create Automation###UNIQUEDELIM123###Run Automation###UNIQUEDELIM123###Pause Automation###UNIQUEDELIM123###Stop Automation###UNIQUEDELIM123###Automation History###UNIQUEDELIM123###Trigger###UNIQUEDELIM123###Action###UNIQUEDELIM123###Search Library###UNIQUEDELIM123###Filter###UNIQUEDELIM123###Templates###UNIQUEDELIM123###Scripts###UNIQUEDELIM123###Datasets###UNIQUEDELIM123###AI Models###UNIQUEDELIM123###Upload Resource###UNIQUEDELIM123###Download Resource###UNIQUEDELIM123###Create Space###UNIQUEDELIM123###Invite Members###UNIQUEDELIM123###Leave Space###UNIQUEDELIM123###Manage Space###UNIQUEDELIM123###Enter space name###UNIQUEDELIM123###Something went wrong. Please try again.###UNIQUEDELIM123###Resource not found.###UNIQUEDELIM123###You are not authorized to perform this action.###UNIQUEDELIM123###Please check your input and try again.###UNIQUEDELIM123###Network error. Please check your connection.###UNIQUEDELIM123###Start a new project to organize your tasks.###UNIQUEDELIM123###Run this automation to execute predefined tasks.###UNIQUEDELIM123###Search for templates, scripts, or datasets.###UNIQUEDELIM123###Invite team members to collaborate in this space.###UNIQUEDELIM123###© 2025 Friday AI. All rights reserved.###UNIQUEDELIM123###Terms of Service###UNIQUEDELIM123###Privacy Policy###UNIQUEDELIM123###Contact Us"

# # Hardcoded keys to map translations back to JSON structure
# keys = [
#     "friday.title", "friday.welcome", "friday.prompt", "friday.help",
#     "navigation.new", "navigation.home", "navigation.automations", "navigation.varients", "navigation.projects",
#     "navigation.spaces", "navigation.library", "navigation.more", "navigation.settings", "navigation.profile",
#     "navigation.dashboard", "navigation.analytics", "authentication.sign-in", "authentication.sign-up",
#     "authentication.sign-out", "authentication.forgot-password", "authentication.reset-password",
#     "authentication.email-label", "authentication.password-label", "authentication.confirm-password",
#     "dashboard.overview", "dashboard.recent-activity", "dashboard.quick-actions", "dashboard.stats.tasks-completed",
#     "dashboard.stats.active-projects", "dashboard.stats.automation-runs", "projects.create", "projects.edit",
#     "projects.delete", "projects.title-placeholder", "projects.description-placeholder", "projects.status.in-progress",
#     "projects.status.completed", "projects.status.on-hold", "automations.create", "automations.run",
#     "automations.pause", "automations.stop", "automations.history", "automations.trigger", "automations.action",
#     "library.search", "library.filter", "library.categories.templates", "library.categories.scripts",
#     "library.categories.datasets", "library.categories.models", "library.upload", "library.download",
#     "spaces.create", "spaces.invite", "spaces.leave", "spaces.manage", "spaces.title-placeholder",
#     "errors.generic", "errors.not-found", "errors.unauthorized", "errors.invalid-input", "errors.network",
#     "tooltips.new-project", "tooltips.automation-run", "tooltips.library-search", "tooltips.space-invite",
#     "footer.copyright", "footer.terms", "footer.privacy", "footer.contact"
# ]

# # Original texts for fallback (split from combined_text)
# texts = combined_text.split("###UNIQUEDELIM123###")

# # List of language codes
# language_codes = [
#     # "af","sq","am","ar","hy","as","ay","az","bm",
#     "eu","be","bn","bho","bs","bg","ca","ceb","ny","zh-CN","zh-TW","co","hr","cs",
#     "da","dv","doi","nl","en","eo","et","ee","tl","fi","fr","fy","gl","ka","de","el","gn","gu","ht","ha","haw","iw","hi","hmn",
#     "hu","is","ig","ilo","id","ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
#     "lg","lb","mk","mai","mg","ms","ml","mt","mi","mr","mni-Mtei","lus","mn","my","ne","no","or","om","ps","fa","pl","pt","pa",
#     "qu","ro","ru","sm","sa","gd","nso","sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te","th",
#     "ti","ts","tr","tk","ak","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu"
# ]

# # Helper: Unflatten to restore JSON structure
# def unflatten(d, sep='.'):
#     result_dict = {}
#     for key, value in d.items():
#         keys = key.split(sep)
#         d_ref = result_dict
#         for k in keys[:-1]:
#             d_ref = d_ref.setdefault(k, {})
#         d_ref[keys[-1]] = value
#     return result_dict

# # Print combined text length for debugging
# print(f"Combined text length: {len(combined_text)} characters")

# # Translate to all languages
# for lang in language_codes:
#     if lang == "en":
#         continue  # Skip English itself
#     print(f"Translating to {lang}...")
#     try:
#         # Try combined translation first
#         translated_combined = GoogleTranslator(source='en', target=lang).translate(combined_text)
#         print(f"Translated text for {lang} (first 100 chars): {translated_combined[:100]}...")
#         translated_texts = translated_combined.split("###UNIQUEDELIM123###")
        
#         # Check if the number of translated texts matches the expected count
#         if len(translated_texts) == len(keys):
#             print(f"Combined translation successful for {lang}")
#             translated = dict(zip(keys, translated_texts))
#         else:
#             print(f"Warning: Translation mismatch for {lang}. Expected {len(keys)} items, got {len(translated_texts)}. Falling back to batched translations.")
#             # Fallback: Translate in batches of 10
#             batch_size = 10
#             translated = {}
#             for i in range(0, len(texts), batch_size):
#                 batch_texts = texts[i:i + batch_size]
#                 batch_keys = keys[i:i + batch_size]
#                 batch_combined = "###UNIQUEDELIM123###".join(batch_texts)
#                 try:
#                     batch_translated = GoogleTranslator(source='en', target=lang).translate(batch_combined)
#                     batch_translated_texts = batch_translated.split("###UNIQUEDELIM123###")
#                     if len(batch_translated_texts) != len(batch_texts):
#                         print(f"Batch translation mismatch for {lang}, batch {i//batch_size + 1}. Translating individually.")
#                         # Translate individually within the batch
#                         for key, text in zip(batch_keys, batch_texts):
#                             try:
#                                 translated[key] = GoogleTranslator(source='en', target=lang).translate(text)
#                                 time.sleep(0.2)
#                             except Exception as e:
#                                 print(f"Error translating {key} to {lang}: {e}")
#                                 translated[key] = text
#                     else:
#                         for key, trans_text in zip(batch_keys, batch_translated_texts):
#                             translated[key] = trans_text
#                     time.sleep(0.5)  # Delay between batches
#                 except Exception as e:
#                     print(f"Error in batch {i//batch_size + 1} for {lang}: {e}")
#                     for key, text in zip(batch_keys, batch_texts):
#                         translated[key] = text  # Fallback to English
#                     time.sleep(0.5)
        
#         # Restore nested structure
#         translated_json = unflatten(translated)
        
#         # Save to a new JSON file
#         with open(f"{lang}.json", "w", encoding="utf-8") as out:
#             json.dump(translated_json, out, ensure_ascii=False, indent=2)
#         print(f"Successfully wrote {lang}.json")
        
#     except Exception as e:
#         print(f"Error translating to {lang}: {e}")
#         # Save original English as fallback
#         translated_json = unflatten(dict(zip(keys, texts)))
#         with open(f"{lang}_fallback.json", "w", encoding="utf-8") as out:
#             json.dump(translated_json, out, ensure_ascii=False, indent=2)
#         print(f"Wrote fallback {lang}_fallback.json")
    
#     time.sleep(1)  # Delay between languages to avoid rate-limiting

# print("Done!")