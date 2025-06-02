import json
import time
from deep_translator import GoogleTranslator

# --- Hardcoded data ---
hardcoded_ordered_flat_keys = [
    "friday.title", "friday.welcome", "friday.prompt", "friday.help",
    "navigation.new", "navigation.home", "navigation.automations", "navigation.varients",
    "navigation.projects", "navigation.spaces", "navigation.library", "navigation.more",
    "navigation.settings", "navigation.profile", "navigation.dashboard", "navigation.analytics",
    "authentication.sign-in", "authentication.sign-up", "authentication.sign-out",
    "authentication.forgot-password", "authentication.reset-password", "authentication.email-label",
    "authentication.password-label", "authentication.confirm-password",
    "dashboard.overview", "dashboard.recent-activity", "dashboard.quick-actions",
    "dashboard.stats.tasks-completed", "dashboard.stats.active-projects", "dashboard.stats.automation-runs",
    "projects.create", "projects.edit", "projects.delete", "projects.title-placeholder",
    "projects.description-placeholder", "projects.status.in-progress", "projects.status.completed",
    "projects.status.on-hold",
    "automations.create", "automations.run", "automations.pause", "automations.stop",
    "automations.history", "automations.trigger", "automations.action",
    "library.search", "library.filter", "library.categories.templates", "library.categories.scripts",
    "library.categories.datasets", "library.categories.models", "library.upload", "library.download",
    "spaces.create", "spaces.invite", "spaces.leave", "spaces.manage", "spaces.title-placeholder",
    "errors.generic", "errors.not-found", "errors.unauthorized", "errors.invalid-input", "errors.network",
    "tooltips.new-project", "tooltips.automation-run", "tooltips.library-search", "tooltips.space-invite",
    "footer.copyright", "footer.terms", "footer.privacy", "footer.contact"
]

hardcoded_big_text_to_translate = (
    "What can I help you with?||TEXT_SEPARATOR||"
    "Welcome to Friday, your AI-powered assistant!||TEXT_SEPARATOR||"
    "Ask me anything or start a new task.||TEXT_SEPARATOR||"
    "Need assistance? I'm here to guide you.||TEXT_SEPARATOR||"
    "Start New||TEXT_SEPARATOR||"
    "Home||TEXT_SEPARATOR||"
    "Automations||TEXT_SEPARATOR||"
    "Variants||TEXT_SEPARATOR||"
    "Projects||TEXT_SEPARATOR||"
    "Spaces||TEXT_SEPARATOR||"
    "Library||TEXT_SEPARATOR||"
    "More||TEXT_SEPARATOR||"
    "Settings||TEXT_SEPARATOR||"
    "Profile||TEXT_SEPARATOR||"
    "Dashboard||TEXT_SEPARATOR||"
    "Analytics||TEXT_SEPARATOR||"
    "Sign In||TEXT_SEPARATOR||"
    "Sign Up||TEXT_SEPARATOR||"
    "Sign Out||TEXT_SEPARATOR||"
    "Forgot Password?||TEXT_SEPARATOR||"
    "Reset Password||TEXT_SEPARATOR||"
    "Email Address||TEXT_SEPARATOR||"
    "Password||TEXT_SEPARATOR||"
    "Confirm Password||TEXT_SEPARATOR||"
    "Overview||TEXT_SEPARATOR||"
    "Recent Activity||TEXT_SEPARATOR||"
    "Quick Actions||TEXT_SEPARATOR||"
    "Tasks Completed||TEXT_SEPARATOR||"
    "Active Projects||TEXT_SEPARATOR||"
    "Automation Runs||TEXT_SEPARATOR||"
    "Create New Project||TEXT_SEPARATOR||"
    "Edit Project||TEXT_SEPARATOR||"
    "Delete Project||TEXT_SEPARATOR||"
    "Enter project title||TEXT_SEPARATOR||"
    "Enter project description||TEXT_SEPARATOR||"
    "In Progress||TEXT_SEPARATOR||"
    "Completed||TEXT_SEPARATOR||"
    "On Hold||TEXT_SEPARATOR||"
    "Create Automation||TEXT_SEPARATOR||"
    "Run Automation||TEXT_SEPARATOR||"
    "Pause Automation||TEXT_SEPARATOR||"
    "Stop Automation||TEXT_SEPARATOR||"
    "Automation History||TEXT_SEPARATOR||"
    "Trigger||TEXT_SEPARATOR||"
    "Action||TEXT_SEPARATOR||"
    "Search Library||TEXT_SEPARATOR||"
    "Filter||TEXT_SEPARATOR||"
    "Templates||TEXT_SEPARATOR||"
    "Scripts||TEXT_SEPARATOR||"
    "Datasets||TEXT_SEPARATOR||"
    "AI Models||TEXT_SEPARATOR||"
    "Upload Resource||TEXT_SEPARATOR||"
    "Download Resource||TEXT_SEPARATOR||"
    "Create Space||TEXT_SEPARATOR||"
    "Invite Members||TEXT_SEPARATOR||"
    "Leave Space||TEXT_SEPARATOR||"
    "Manage Space||TEXT_SEPARATOR||"
    "Enter space name||TEXT_SEPARATOR||"
    "Something went wrong. Please try again.||TEXT_SEPARATOR||"
    "Resource not found.||TEXT_SEPARATOR||"
    "You are not authorized to perform this action.||TEXT_SEPARATOR||"
    "Please check your input and try again.||TEXT_SEPARATOR||"
    "Network error. Please check your connection.||TEXT_SEPARATOR||"
    "Start a new project to organize your tasks.||TEXT_SEPARATOR||"
    "Run this automation to execute predefined tasks.||TEXT_SEPARATOR||"
    "Search for templates, scripts, or datasets.||TEXT_SEPARATOR||"
    "Invite team members to collaborate in this space.||TEXT_SEPARATOR||"
    "© 2025 Friday AI. All rights reserved.||TEXT_SEPARATOR||"
    "Terms of Service||TEXT_SEPARATOR||"
    "Privacy Policy||TEXT_SEPARATOR||"
    "Contact Us"
)

DELIMITER = "||TEXT_SEPARATOR||"
EXPECTED_SEGMENTS = len(hardcoded_ordered_flat_keys)

# --- Helper function ---
def unflatten(d, sep='.'):
    result_dict = {}
    for key, value in d.items():
        keys = key.split(sep)
        d_ref = result_dict
        for k_idx, k_val in enumerate(keys[:-1]):
            d_ref = d_ref.setdefault(k_val, {})
        d_ref[keys[-1]] = value
    return result_dict

# --- Main translation logic ---
# Test with a single language first, e.g., 'is' (Icelandic) or 'ig' (Igbo)
# or any language that was problematic.
target_languages = [
    # "af","sq","am","ar","hy","as","ay","az","bm","eu",
    # "be","bn","bho","bs","bg","ca","ceb","ny","zh-CN","zh-TW",
    # "co","hr","cs","da","dv","doi","nl","en","eo","et",
    # "ee","tl","fi","fr","fy","gl","ka","de","el","gn",
    # "gu","ht","ha","haw","iw","hi","hmn","hu",
    "is","ig","ilo","id",
    "ga","it","ja","jw","kn","kk","km","rw","gom","ko","kri","ku","ckb","ky","lo","la","lv","ln","lt",
    "lg","lb","mk","mai","mg","ms","ml","mt","mi","mr","mni-Mtei","lus","mn","my","ne","no","or","om","ps","fa","pl","pt","pa",
    "qu","ro","ru","sm","sa","gd","nso","sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te","th",
    "ti","ts","tr","tk","ak","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu"
]

for lang_code in target_languages:
    print(f"\n--- Translating to {lang_code} ---")
    translated_json_content = None
    try:
        translator = GoogleTranslator(source='en', target=lang_code)
        translated_big_text = translator.translate(hardcoded_big_text_to_translate)

        if translated_big_text is None:
            print(f"  ERROR: Translation returned None for language {lang_code}.")
            continue # Skip to next language

        print(f"  Raw translated output (first 100 chars): {translated_big_text[:100]}")
        
        translated_segments = translated_big_text.split(DELIMITER)
        
        print(f"  Expected segments: {EXPECTED_SEGMENTS}")
        print(f"  Segments received: {len(translated_segments)}")

        if len(translated_segments) == EXPECTED_SEGMENTS:
            # Reconstruct the flat dictionary
            translated_flat_dict = {}
            for i, key in enumerate(hardcoded_ordered_flat_keys):
                translated_flat_dict[key] = translated_segments[i]
            
            # Unflatten to restore original JSON structure
            translated_json_content = unflatten(translated_flat_dict)
            print(f"  SUCCESS: Reconstructed JSON for {lang_code}.")
        else:
            print(f"  ERROR: Segment count mismatch for {lang_code}.")
            print(f"    This means the delimiter '{DELIMITER}' was likely altered or removed by the translation engine.")
            # You could print the full translated_big_text here to inspect it,
            # but it might be very long.
            # print(f"    Full translated text for debugging:\n{translated_big_text}\n")

    except Exception as e:
        print(f"  ERROR: An exception occurred during translation or processing for {lang_code}: {e}")
        continue

    # Save the translated JSON if successful
    if translated_json_content:
        try:
            output_filename = f"{lang_code}_hardcoded_test.json"
            with open(output_filename, "w", encoding="utf-8") as out_file:
                json.dump(translated_json_content, out_file, ensure_ascii=False, indent=2)
            print(f"  Successfully saved to {output_filename}")
        except Exception as e_save:
            print(f"  ERROR: Could not save {output_filename}: {e_save}")

print("\nHardcoded translation test finished.")
