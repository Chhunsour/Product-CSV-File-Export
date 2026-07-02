export type Locale = "en" | "km";

const messages: Record<Locale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.commerce": "WordPress",
    "nav.images": "Images",
    "nav.videos": "Videos",
    "nav.notes": "Notes",
    "nav.blogs": "Blogs",
    "nav.new_item": "New Item",
    "nav.workspace": "private workspace",
    "nav.light_mode": "Light mode",
    "nav.dark_mode": "Dark mode",
    "nav.sign_out": "Sign out",
    "nav.lang_label": "Language",
    "nav.lang_toggle_en": "English",
    "nav.lang_toggle_km": "ខ្មែរ",
    "home.system_online": "SYSTEM ONLINE",
    "home.welcome_back": "Welcome back,",
    "home.workspace_synced":
      "Your workspace is synced, inventory is steady, and the next export run is ready.",
    "home.open_commerce": "Open WordPress",
    "home.create_item": "Create New Item",
    "home.readiness": "Readiness",
    "home.ready_to_export": "Catalog ready to export",
    "home.export_snapshot": "Export Snapshot",
    "home.export_missing": "Export Missing",
    "home.missing_images": "Missing images",
    "home.draft_queue": "Draft queue",
    "home.last_update": "Last update",
    "home.image_vault": "Image Vault",
    "home.catalog": "Catalog",
    "home.export_queue": "Export Queue",
    "home.system": "System",
    "home.inventory": "Inventory",
    "home.latency": "Latency",
    "home.ready": "ready",
    "admin.title": "WordPress",
    "admin.subtitle": "Manage products, exports, and inventory.",
    "admin.export_csv": "Export CSV",
    "admin.exporting": "Exporting...",
    "admin.import_csv": "Import CSV",
    "admin.importing": "Importing...",
    "admin.text_to_csv": "Text → CSV",
    "admin.select": "Select",
    "admin.done": "Done",
    "admin.new_item": "New Item",
    "admin.operational_status": "Operational Status",
    "admin.last_update": "Last update",
    "admin.published": "Published",
    "admin.drafts": "Drafts",
    "admin.private": "Private",
    "admin.csv_workspaces": "CSV Workspaces",
    "admin.csv_help": "Keep test imports separate from production.",
    "admin.active_workspace": "Active workspace",
    "admin.items": "items",
    "admin.new_folder": "New folder",
    "admin.duplicate": "Duplicate",
    "admin.rename": "Rename",
    "admin.delete": "Delete",
    "admin.search_placeholder": "Search title, ID, SKU, slug, tags, price",
    "admin.category": "Category",
    "admin.clear": "Clear",
    "admin.import_issues": "Import issues",
    "admin.import_preview": "Import Preview",
    "admin.cancel": "Cancel",
    "admin.import": "Import CSV",
    "admin.export_selected": "Export selected",
    "admin.delete_selected": "Delete selected",
    "admin.select_visible": "Select visible",
    "admin.clear_selection": "Clear selection",
    "admin.text_csv_title": "Text to CSV",
    "admin.text_csv_subtitle": "Paste text, export to CSV",
    "admin.text_csv_hint": "Supports auto-detect for comma, tab, pipe, or semicolon.",
    "admin.paste_text": "Paste text",
    "admin.file_name": "File name",
    "admin.delimiter": "Delimiter",
    "admin.save_to_folder": "Save to folder",
    "admin.header_row": "First row is header",
    "admin.download_file": "Download CSV file",
    "admin.save_file": "Save CSV file to folder",
    "admin.convert": "Convert",
    "admin.clear_text": "Clear",
    "admin.showing": "Showing",
    "admin.of": "of",
    "admin.filters_active": "Filters active",
    "admin.edit": "Edit",
    "admin.delete_item": "Delete"
    ,"admin.folder_create_title": "Create new folder"
    ,"admin.folder_rename_title": "Rename folder"
    ,"admin.folder_duplicate_title": "Duplicate folder"
    ,"admin.folder_rename_sub": "Rename \"{name}\" to a new workspace folder."
    ,"admin.folder_duplicate_sub": "Copy all items from \"{name}\" into a new folder."
    ,"admin.folder_create_sub": "Create a new workspace folder to separate CSV runs."
    ,"admin.folder_create_btn": "Create"
    ,"admin.folder_name_required": "Please enter a folder name."
    ,"admin.folder_exists": "Folder already exists."
    ,"admin.delete_folder_title": "Delete folder"
    ,"admin.delete_folder_message": "Delete \"{name}\"? Items inside will be moved to \"{fallback}\"."
    ,"admin.delete_confirm": "Delete"
    ,"admin.delete_item_title": "Delete item"
    ,"admin.delete_item_message": "Delete \"{name}\"? This cannot be undone."
    ,"admin.delete_selected_title": "Delete selected"
    ,"admin.delete_selected_message": "Delete {count} item(s)? This cannot be undone."
    ,"admin.load_failed": "Failed to load items."
    ,"admin.delete_failed": "Failed to delete item."
    ,"admin.delete_selected_failed": "Failed to delete selected items."
    ,"media.images.system": "SYSTEM"
    ,"media.images.title": "Image Library"
    ,"media.images.subtitle": "All product visuals in one place."
    ,"media.videos.system": "SYSTEM"
    ,"media.videos.title": "Video Library"
    ,"media.videos.subtitle": "Product clips, demos, and walkthroughs."
    ,"media.refresh": "Refresh"
    ,"media.copy_links": "Copy Links"
    ,"media.select": "Select"
    ,"media.done": "Done"
    ,"media.total": "Total"
    ,"media.images": "Images"
    ,"media.videos": "Videos"
    ,"media.stored": "Stored"
    ,"media.files": "Files"
    ,"media.linked": "Linked"
    ,"media.external": "External"
    ,"media.items": "Items"
    ,"media.products": "Products"
    ,"media.webp": "WebP"
    ,"media.optimized": "Optimized"
    ,"media.formats": "Formats"
    ,"media.types": "Types"
    ,"media.updated": "Updated"
    ,"media.latest": "Latest"
    ,"media.add_image": "Add image"
    ,"media.add_image_sub": "Upload directly to your Media Vault. Images can be auto-converted to WebP."
    ,"media.add_video": "Add video"
    ,"media.add_video_sub": "Upload to a product item. Supported: mp4, webm, mov, m4v."
    ,"media.media_vault": "Media Vault"
    ,"media.save_to": "Save to"
    ,"media.label": "Label"
    ,"media.label_placeholder": "Optional label"
    ,"media.product_slug": "Product slug"
    ,"media.product_slug_placeholder": "typhon-naga-40-mini-excavator"
    ,"media.product_id": "Product ID / SKU"
    ,"media.product_id_placeholder": "SKU or Woo ID"
    ,"media.poster_asset": "Poster asset ID"
    ,"media.poster_asset_placeholder": "Paste an image asset id (optional)"
    ,"media.view": "View"
    ,"media.view_placeholder": "front-left"
    ,"media.key_spec": "Key spec"
    ,"media.key_spec_placeholder": "yanmar24hp"
    ,"media.alt_text": "Alt text"
    ,"media.alt_placeholder": "Auto-generated if left blank"
    ,"media.title_text": "Title"
    ,"media.title_placeholder": "Optional title"
    ,"media.category_select": "Category"
    ,"media.category_placeholder": "Select category"
    ,"media.image_file": "Image file"
    ,"media.video_file": "Video file"
    ,"media.convert_webp": "Convert to WebP"
    ,"media.upload_image": "Upload Image"
    ,"media.upload_video": "Upload Video"
    ,"media.uploading": "Uploading..."
    ,"media.search_images": "Search images"
    ,"media.search_videos": "Search videos"
    ,"media.search_items": "Search items"
    ,"media.search_items_placeholder": "Search by title or SKU"
    ,"media.attach_item": "Attach to item"
    ,"media.select_item": "Select an item"
    ,"media.loading_items": "Loading items..."
    ,"media.sort_newest": "Newest first"
    ,"media.sort_oldest": "Oldest first"
    ,"media.sort_name": "Name A to Z"
    ,"media.view_grid": "Grid"
    ,"media.view_list": "List"
    ,"media.clear": "Clear"
    ,"media.source": "Source"
    ,"media.format": "Format"
    ,"media.category": "Category"
    ,"media.filter_all": "All"
    ,"media.filter_stored": "Stored"
    ,"media.filter_linked": "Linked"
    ,"media.selected_count": "{count} selected"
    ,"media.select_all": "Select all"
    ,"media.clear_selection": "Clear selection"
    ,"media.import": "Import"
    ,"media.import_mode": "Import as"
    ,"media.import_linked": "Linked (external URLs)"
    ,"media.import_stored": "Stored (download)"
    ,"media.convert": "Convert"
    ,"media.delete": "Delete"
    ,"media.working": "Working..."
    ,"media.sign_in_image": "Sign in to view and manage your WebP image library."
    ,"media.sign_in_video": "Sign in to view and manage your video library."
    ,"media.no_preview": "No preview"
    ,"media.open": "Open"
    ,"media.copy": "Copy"
    ,"media.no_images": "No images yet. Upload product images in any item and they will appear here."
    ,"media.no_videos": "No videos yet. Upload product videos in any item and they will appear here."
    ,"media.video_helper": "Video conversion to WebP is not supported here. Upload videos as mp4 or webm."
    ,"media.no_updates": "No updates yet"
    ,"media.load_more": "Load more"
    ,"media.copy_links_selected": "Copied {count} link(s)."
    ,"media.copy_links_empty": "No items to copy yet."
    ,"media.vault_setting_up": "Setting up vault"
    ,"media.vault_ready": "Vault ready"
    ,"media.vault_error": "Vault error"
    ,"media.vault_offline": "Vault offline"
    ,"media.vault_setting_up_long": "Setting up Media Vault..."
    ,"media.vault_setup_failed": "Media Vault setup failed. Refresh the page."
    ,"media.vault_not_ready": "Media Vault not ready yet."
    ,"media.choose_file": "Choose a file to upload."
    ,"media.no_images_copy": "No images to copy yet."
    ,"media.no_videos_copy": "No videos to copy yet."
    ,"media.clipboard_unavailable": "Clipboard unavailable."
    ,"media.copy_failed": "Copy failed."
    ,"media.link_copied": "Link copied."
    ,"media.links_copied": "Copied {count} links."
    ,"media.failed_load_images": "Failed to load images."
    ,"media.failed_load_videos": "Failed to load videos."
    ,"media.failed_load_items": "Failed to load items."
    ,"media.failed_setup_vault": "Failed to set up Media Vault."
    ,"media.failed_upload_image": "Failed to upload image."
    ,"media.failed_upload_video": "Failed to upload video."
    ,"media.image_added": "Image added."
    ,"media.video_added": "Video added."
    ,"media.choose_file_first": "Choose a file first."
    ,"media.media_vault_not_ready": "Media Vault is not ready yet."
    ,"media.failed_delete_selection": "Failed to delete selection."
    ,"media.sign_in_import": "Sign in to import media."
    ,"media.select_destination": "Select a destination item."
    ,"media.failed_import": "Failed to import selection."
    ,"media.failed_convert": "Failed to convert selection."
    ,"media.no_items_yet": "No items yet. Create one in Admin."
    ,"media.select_item_and_file": "Select an item and a file to enable upload."
    ,"media.select_item_attach": "Select an item to attach this file."
    ,"media.deleted_items": "Deleted {count} item(s)."
    ,"media.imported_items": "Imported {count} item(s)."
    ,"media.confirm_delete_images": "Delete {count} selected image(s)?"
    ,"media.confirm_delete_videos": "Delete {count} selected video(s)?"
    ,"media.converted_items": "Converted {count} item(s)."
    ,"media.converted_items_skipped": "Converted {count} item(s). {skipped} already {format}."
    ,"media.failed_convert_items": "Failed to convert {count} item(s)."
    ,"media.category.mini_excavator": "Mini Excavator"
    ,"media.category.forklift": "Forklift"
    ,"media.category.road_roller": "Road Roller"
    ,"media.category.skid_steer": "Skid Steer"
    ,"media.category.attachments": "Attachments"
    ,"login.sign_in": "Sign in"
    ,"login.magic_link": "Use a magic link to access your workspace."
    ,"login.email": "Email"
    ,"login.email_placeholder": "you@company.com"
    ,"login.send_magic": "Send magic link"
    ,"login.sending": "Sending..."
    ,"login.or": "or"
    ,"login.password": "Password"
    ,"login.password_placeholder": "Enter your password"
    ,"login.sign_in_password": "Sign in with password"
    ,"login.signing_in": "Signing in..."
    ,"login.forgot_password": "forgot password"
    ,"login.reset_copy": "We will send a reset link to your email. The link opens a local reset page."
    ,"login.send_reset": "Send password reset link"
    ,"login.magic_sent": "Check your email for the magic link."
    ,"login.magic_error": "Unable to send magic link."
    ,"login.password_error": "Unable to sign in with password."
    ,"login.enter_email_first": "Please enter your email above first."
    ,"login.reset_sent": "Password reset email sent. Check your inbox."
    ,"login.reset_error": "Unable to send reset email."
  },
  km: {
    "nav.home": "ទំព័រដើម",
    "nav.commerce": "WordPress",
    "nav.images": "រូបភាព",
    "nav.videos": "វីដេអូ",
    "nav.notes": "Notes",
    "nav.blogs": "ប្លុក",
    "nav.new_item": "ធាតុថ្មី",
    "nav.workspace": "កន្លែងធ្វើការឯកជន",
    "nav.light_mode": "របៀបពន្លឺ",
    "nav.dark_mode": "របៀបងងឹត",
    "nav.sign_out": "ចាកចេញ",
    "nav.lang_label": "ភាសា",
    "nav.lang_toggle_en": "អង់គ្លេស",
    "nav.lang_toggle_km": "ខ្មែរ",
    "home.system_online": "ប្រព័ន្ធអនឡាញ",
    "home.welcome_back": "ស្វាគមន៍មកវិញ,",
    "home.workspace_synced":
      "កន្លែងធ្វើការត្រូវបានសមកាលកម្ម ស្តុកមានស្ថេរភាព ហើយការនាំចេញបន្ទាប់បានត្រៀមរួច។",
    "home.open_commerce": "បើក WordPress",
    "home.create_item": "បង្កើតធាតុថ្មី",
    "home.readiness": "ភាពត្រៀមខ្លួន",
    "home.ready_to_export": "កាតាឡុកត្រៀមនាំចេញ",
    "home.export_snapshot": "នាំចេញសង្ខេប",
    "home.export_missing": "នាំចេញអ្វីខ្វះ",
    "home.missing_images": "រូបភាពខ្វះ",
    "home.draft_queue": "ជួរទុកសេចក្តីព្រាង",
    "home.last_update": "អាប់ដេតចុងក្រោយ",
    "home.image_vault": "គន្លងរូបភាព",
    "home.catalog": "កាតាឡុក",
    "home.export_queue": "ជួរនាំចេញ",
    "home.system": "ប្រព័ន្ធ",
    "home.inventory": "ស្តុក",
    "home.latency": "ពេលវេលាបណ្ដោះអាសន្ន",
    "home.ready": "ត្រៀម",
    "admin.title": "WordPress",
    "admin.subtitle": "គ្រប់គ្រងផលិតផល ការនាំចេញ និងស្តុក។",
    "admin.export_csv": "នាំចេញ CSV",
    "admin.exporting": "កំពុងនាំចេញ...",
    "admin.import_csv": "នាំចូល CSV",
    "admin.importing": "កំពុងនាំចូល...",
    "admin.text_to_csv": "អត្ថបទ → CSV",
    "admin.select": "ជ្រើសរើស",
    "admin.done": "រួចរាល់",
    "admin.new_item": "ធាតុថ្មី",
    "admin.operational_status": "ស្ថានភាពប្រតិបត្តិការ",
    "admin.last_update": "អាប់ដេតចុងក្រោយ",
    "admin.published": "បានផ្សព្វផ្សាយ",
    "admin.drafts": "ព្រាង",
    "admin.private": "ឯកជន",
    "admin.csv_workspaces": "ឃ្លាំង CSV",
    "admin.csv_help": "បំបែកការធ្វើតេស្តពីការផលិតពិត។",
    "admin.active_workspace": "ឃ្លាំងកំពុងប្រើ",
    "admin.items": "ធាតុ",
    "admin.new_folder": "ថតថ្មី",
    "admin.duplicate": "ចម្លង",
    "admin.rename": "ប្ដូរឈ្មោះ",
    "admin.delete": "លុប",
    "admin.search_placeholder": "ស្វែងរកចំណងជើង ID SKU slug ស្លាក តម្លៃ",
    "admin.category": "ប្រភេទ",
    "admin.clear": "សម្អាត",
    "admin.import_issues": "បញ្ហានាំចូល",
    "admin.import_preview": "មើលមុននាំចូល",
    "admin.cancel": "បោះបង់",
    "admin.import": "នាំចូល CSV",
    "admin.export_selected": "នាំចេញបានជ្រើស",
    "admin.delete_selected": "លុបដែលបានជ្រើស",
    "admin.select_visible": "ជ្រើសរើសដែលមើលឃើញ",
    "admin.clear_selection": "សម្អាតការជ្រើស",
    "admin.text_csv_title": "អត្ថបទទៅ CSV",
    "admin.text_csv_subtitle": "បិទភ្ជាប់អត្ថបទ ហើយនាំចេញជា CSV",
    "admin.text_csv_hint": "គាំទ្រការរកឃើញឌេលីមីទ័រដោយស្វ័យប្រវត្តិ។",
    "admin.paste_text": "បិទភ្ជាប់អត្ថបទ",
    "admin.file_name": "ឈ្មោះឯកសារ",
    "admin.delimiter": "ឌេលីមីទ័រ",
    "admin.save_to_folder": "រក្សាទុកទៅថត",
    "admin.header_row": "ជួរដំបូងគឺក្បាល",
    "admin.download_file": "ទាញយកឯកសារ CSV",
    "admin.save_file": "រក្សាទុកឯកសារ CSV ទៅថត",
    "admin.convert": "បម្លែង",
    "admin.clear_text": "សម្អាត",
    "admin.showing": "បង្ហាញ",
    "admin.of": "នៃ",
    "admin.filters_active": "មានតម្រង",
    "admin.edit": "កែប្រែ",
    "admin.delete_item": "លុប"
    ,"admin.folder_create_title": "បង្កើតថតថ្មី"
    ,"admin.folder_rename_title": "ប្ដូរឈ្មោះថត"
    ,"admin.folder_duplicate_title": "ចម្លងថត"
    ,"admin.folder_rename_sub": "ប្ដូរឈ្មោះ \"{name}\" ទៅជាថតថ្មី។"
    ,"admin.folder_duplicate_sub": "ចម្លងធាតុទាំងអស់ពី \"{name}\" ទៅថតថ្មី។"
    ,"admin.folder_create_sub": "បង្កើតថតថ្មីដើម្បីបំបែកការនាំចេញ CSV។"
    ,"admin.folder_create_btn": "បង្កើត"
    ,"admin.folder_name_required": "សូមបញ្ចូលឈ្មោះថត។"
    ,"admin.folder_exists": "ឈ្មោះថតមានរួចហើយ។"
    ,"admin.delete_folder_title": "លុបថត"
    ,"admin.delete_folder_message": "លុប \"{name}\"? ធាតុខាងក្នុងនឹងផ្ទេរទៅ \"{fallback}\"។"
    ,"admin.delete_confirm": "លុប"
    ,"admin.delete_item_title": "លុបធាតុ"
    ,"admin.delete_item_message": "លុប \"{name}\"? មិនអាចត្រឡប់វិញបាន។"
    ,"admin.delete_selected_title": "លុបដែលបានជ្រើស"
    ,"admin.delete_selected_message": "លុប {count} ធាតុ? មិនអាចត្រឡប់វិញបាន។"
    ,"admin.load_failed": "បរាជ័យក្នុងការផ្ទុកធាតុ។"
    ,"admin.delete_failed": "បរាជ័យក្នុងការលុបធាតុ។"
    ,"admin.delete_selected_failed": "បរាជ័យក្នុងការលុបធាតុដែលបានជ្រើស។"
    ,"media.images.system": "ប្រព័ន្ធ"
    ,"media.images.title": "បណ្ណាល័យរូបភាព"
    ,"media.images.subtitle": "ទុករូបភាពផលិតផលទាំងអស់នៅកន្លែងតែមួយ។"
    ,"media.videos.system": "ប្រព័ន្ធ"
    ,"media.videos.title": "បណ្ណាល័យវីដេអូ"
    ,"media.videos.subtitle": "វីដេអូផលិតផល សាកល្បង និងការបង្ហាញ។"
    ,"media.refresh": "ធ្វើបច្ចុប្បន្ន"
    ,"media.copy_links": "ចម្លងតំណ"
    ,"media.select": "ជ្រើសរើស"
    ,"media.done": "រួចរាល់"
    ,"media.total": "សរុប"
    ,"media.images": "រូបភាព"
    ,"media.videos": "វីដេអូ"
    ,"media.stored": "រក្សាទុក"
    ,"media.files": "ឯកសារ"
    ,"media.linked": "ភ្ជាប់តំណ"
    ,"media.external": "ខាងក្រៅ"
    ,"media.items": "ធាតុ"
    ,"media.products": "ផលិតផល"
    ,"media.webp": "WebP"
    ,"media.optimized": "បានបង្កើនប្រសិទ្ធភាព"
    ,"media.formats": "ទម្រង់"
    ,"media.types": "ប្រភេទ"
    ,"media.updated": "បានអាប់ដេត"
    ,"media.latest": "ចុងក្រោយ"
    ,"media.add_image": "បន្ថែមរូបភាព"
    ,"media.add_image_sub": "បង្ហោះទៅ Media Vault ដោយផ្ទាល់។ អាចបម្លែងទៅ WebP ស្វ័យប្រវត្តិ។"
    ,"media.add_video": "បន្ថែមវីដេអូ"
    ,"media.add_video_sub": "បង្ហោះទៅធាតុផលិតផល។ គាំទ្រ mp4, webm, mov, m4v។"
    ,"media.media_vault": "Media Vault"
    ,"media.save_to": "រក្សាទុកទៅ"
    ,"media.label": "ស្លាក"
    ,"media.label_placeholder": "ស្លាកស្រេចចិត្ត"
    ,"media.product_slug": "Slug ផលិតផល"
    ,"media.product_slug_placeholder": "typhon-naga-40-mini-excavator"
    ,"media.product_id": "លេខផលិតផល / SKU"
    ,"media.product_id_placeholder": "SKU ឬ Woo ID"
    ,"media.poster_asset": "ID រូប Poster"
    ,"media.poster_asset_placeholder": "បិទភ្ជាប់ ID រូបភាព (ជម្រើស)"
    ,"media.view": "មុំមើល"
    ,"media.view_placeholder": "front-left"
    ,"media.key_spec": "លក្ខណៈពិសេស"
    ,"media.key_spec_placeholder": "yanmar24hp"
    ,"media.alt_text": "អក្សរ Alt"
    ,"media.alt_placeholder": "បង្កើតស្វ័យប្រវត្តិ ប្រសិនបើទុកឲ្យទទេ"
    ,"media.title_text": "ចំណងជើង"
    ,"media.title_placeholder": "ជម្រើស បន្ថែម"
    ,"media.category_select": "ប្រភេទ"
    ,"media.category_placeholder": "ជ្រើសប្រភេទ"
    ,"media.image_file": "ឯកសាររូបភាព"
    ,"media.video_file": "ឯកសារវីដេអូ"
    ,"media.convert_webp": "បម្លែងទៅ WebP"
    ,"media.upload_image": "បង្ហោះរូបភាព"
    ,"media.upload_video": "បង្ហោះវីដេអូ"
    ,"media.uploading": "កំពុងបង្ហោះ..."
    ,"media.search_images": "ស្វែងរករូបភាព"
    ,"media.search_videos": "ស្វែងរកវីដេអូ"
    ,"media.search_items": "ស្វែងរកធាតុ"
    ,"media.search_items_placeholder": "ស្វែងរកតាមចំណងជើង ឬ SKU"
    ,"media.attach_item": "ភ្ជាប់ទៅធាតុ"
    ,"media.select_item": "ជ្រើសរើសធាតុ"
    ,"media.loading_items": "កំពុងផ្ទុកធាតុ..."
    ,"media.sort_newest": "ថ្មីជាងគេ"
    ,"media.sort_oldest": "ចាស់ជាងគេ"
    ,"media.sort_name": "ឈ្មោះ A ទៅ Z"
    ,"media.view_grid": "ក្រឡាចត្រង្គ"
    ,"media.view_list": "បញ្ជី"
    ,"media.clear": "សម្អាត"
    ,"media.source": "ប្រភព"
    ,"media.format": "ទម្រង់"
    ,"media.category": "ប្រភេទ"
    ,"media.filter_all": "ទាំងអស់"
    ,"media.filter_stored": "រក្សាទុក"
    ,"media.filter_linked": "ភ្ជាប់តំណ"
    ,"media.selected_count": "បានជ្រើស {count}"
    ,"media.select_all": "ជ្រើសរើសទាំងអស់"
    ,"media.clear_selection": "សម្អាតការជ្រើស"
    ,"media.import": "នាំចូល"
    ,"media.import_mode": "នាំចូលជាប្រភេទ"
    ,"media.import_linked": "ភ្ជាប់ (URL ខាងក្រៅ)"
    ,"media.import_stored": "ផ្ទុក (ទាញយក)"
    ,"media.convert": "បម្លែង"
    ,"media.delete": "លុប"
    ,"media.working": "កំពុងដំណើរការ..."
    ,"media.sign_in_image": "សូមចូលគណនីដើម្បីមើល និងគ្រប់គ្រងបណ្ណាល័យរូបភាព WebP។"
    ,"media.sign_in_video": "សូមចូលគណនីដើម្បីមើល និងគ្រប់គ្រងបណ្ណាល័យវីដេអូ។"
    ,"media.no_preview": "មិនមានការមើលជាមុន"
    ,"media.open": "បើក"
    ,"media.copy": "ចម្លង"
    ,"media.no_images": "មិនមានរូបភាពនៅឡើយទេ។ បង្ហោះរូបភាពផលិតផល ហើយវានឹងបង្ហាញទីនេះ។"
    ,"media.no_videos": "មិនមានវីដេអូនៅឡើយទេ។ បង្ហោះវីដេអូផលិតផល ហើយវានឹងបង្ហាញទីនេះ។"
    ,"media.video_helper": "មិនគាំទ្របម្លែងវីដេអូទៅ WebP នៅទីនេះ។ សូមបង្ហោះជា mp4 ឬ webm។"
    ,"media.no_updates": "មិនមានការអាប់ដេតនៅឡើយទេ"
    ,"media.load_more": "ផ្ទុកបន្ថែម"
    ,"media.copy_links_selected": "បានចម្លង {count} តំណ"
    ,"media.copy_links_empty": "មិនទាន់មានធាតុសម្រាប់ចម្លង"
    ,"media.vault_setting_up": "កំពុងរៀបចំឃ្លាំង"
    ,"media.vault_ready": "ឃ្លាំងរួចរាល់"
    ,"media.vault_error": "កំហុសឃ្លាំង"
    ,"media.vault_offline": "ឃ្លាំងមិនភ្ជាប់"
    ,"media.vault_setting_up_long": "កំពុងរៀបចំ Media Vault..."
    ,"media.vault_setup_failed": "ការរៀបចំ Media Vault បរាជ័យ។ សូមធ្វើបច្ចុប្បន្ន។"
    ,"media.vault_not_ready": "Media Vault មិនទាន់រួចរាល់។"
    ,"media.choose_file": "ជ្រើសរើសឯកសារដើម្បីបង្ហោះ។"
    ,"media.no_images_copy": "មិនមានរូបភាពសម្រាប់ចម្លង។"
    ,"media.no_videos_copy": "មិនមានវីដេអូសម្រាប់ចម្លង។"
    ,"media.clipboard_unavailable": "មិនអាចប្រើ clipboard បាន។"
    ,"media.copy_failed": "ចម្លងបរាជ័យ។"
    ,"media.link_copied": "បានចម្លងតំណ។"
    ,"media.links_copied": "បានចម្លង {count} តំណ។"
    ,"media.failed_load_images": "បរាជ័យក្នុងការផ្ទុករូបភាព។"
    ,"media.failed_load_videos": "បរាជ័យក្នុងការផ្ទុកវីដេអូ។"
    ,"media.failed_load_items": "បរាជ័យក្នុងការផ្ទុកធាតុ។"
    ,"media.failed_setup_vault": "បរាជ័យក្នុងការរៀបចំ Media Vault។"
    ,"media.failed_upload_image": "បរាជ័យក្នុងការបង្ហោះរូបភាព។"
    ,"media.failed_upload_video": "បរាជ័យក្នុងការបង្ហោះវីដេអូ។"
    ,"media.image_added": "បានបន្ថែមរូបភាព។"
    ,"media.video_added": "បានបន្ថែមវីដេអូ។"
    ,"media.choose_file_first": "សូមជ្រើសរើសឯកសារមុន។"
    ,"media.media_vault_not_ready": "Media Vault មិនទាន់រួចរាល់ទេ។"
    ,"media.failed_delete_selection": "បរាជ័យក្នុងការលុបដែលបានជ្រើស។"
    ,"media.sign_in_import": "សូមចូលគណនីដើម្បីនាំចូលមេឌៀ។"
    ,"media.select_destination": "សូមជ្រើសរើសធាតុគោលដៅ។"
    ,"media.failed_import": "បរាជ័យក្នុងការនាំចូល។"
    ,"media.failed_convert": "បរាជ័យក្នុងការបម្លែង។"
    ,"media.no_items_yet": "មិនមានធាតុនៅឡើយទេ។ បង្កើតនៅ Admin ជាមុន។"
    ,"media.select_item_and_file": "ជ្រើសរើសធាតុ និងឯកសារដើម្បីបើកការបង្ហោះ។"
    ,"media.select_item_attach": "ជ្រើសរើសធាតុដើម្បីភ្ជាប់ឯកសារនេះ។"
    ,"media.deleted_items": "បានលុប {count} ធាតុ។"
    ,"media.imported_items": "បាននាំចូល {count} ធាតុ។"
    ,"media.confirm_delete_images": "លុបរូបភាពដែលបានជ្រើស {count}?"
    ,"media.confirm_delete_videos": "លុបវីដេអូដែលបានជ្រើស {count}?"
    ,"media.converted_items": "បានបម្លែង {count} ធាតុ។"
    ,"media.converted_items_skipped": "បានបម្លែង {count} ធាតុ។ {skipped} មានរួច {format}។"
    ,"media.failed_convert_items": "បរាជ័យក្នុងការបម្លែង {count} ធាតុ។"
    ,"media.category.mini_excavator": "មីនីអិចកាវ៉ាទ័រ"
    ,"media.category.forklift": "ហ្វ័រខ្លីហ្វ"
    ,"media.category.road_roller": "រ៉ូល្លឺផ្លូវ"
    ,"media.category.skid_steer": "ស្គីដស្ទៀរ"
    ,"media.category.attachments": "គ្រឿងភ្ជាប់"
    ,"login.sign_in": "ចូលគណនី"
    ,"login.magic_link": "ប្រើតំណអាថ៌កំបាំងដើម្បីចូលកន្លែងធ្វើការ។"
    ,"login.email": "អ៊ីមែល"
    ,"login.email_placeholder": "you@company.com"
    ,"login.send_magic": "ផ្ញើតំណអាថ៌កំបាំង"
    ,"login.sending": "កំពុងផ្ញើ..."
    ,"login.or": "ឬ"
    ,"login.password": "ពាក្យសម្ងាត់"
    ,"login.password_placeholder": "បញ្ចូលពាក្យសម្ងាត់"
    ,"login.sign_in_password": "ចូលដោយពាក្យសម្ងាត់"
    ,"login.signing_in": "កំពុងចូល..."
    ,"login.forgot_password": "ភ្លេចពាក្យសម្ងាត់"
    ,"login.reset_copy": "យើងនឹងផ្ញើតំណកំណត់ឡើងវិញទៅអ៊ីមែល។ តំណនឹងបើកទំព័រកំណត់ឡើងវិញ។"
    ,"login.send_reset": "ផ្ញើតំណកំណត់ពាក្យសម្ងាត់"
    ,"login.magic_sent": "សូមពិនិត្យអ៊ីមែលសម្រាប់តំណអាថ៌កំបាំង។"
    ,"login.magic_error": "មិនអាចផ្ញើតំណអាថ៌កំបាំងបាន។"
    ,"login.password_error": "មិនអាចចូលដោយពាក្យសម្ងាត់បាន។"
    ,"login.enter_email_first": "សូមបញ្ចូលអ៊ីមែលនៅខាងលើជាមុន។"
    ,"login.reset_sent": "បានផ្ញើអ៊ីមែលកំណត់ពាក្យសម្ងាត់។ សូមពិនិត្យប្រអប់សារ។"
    ,"login.reset_error": "មិនអាចផ្ញើអ៊ីមែលកំណត់ពាក្យសម្ងាត់បាន។"
  }
};

const format = (value: string, params?: Record<string, string>) => {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
};

export const useLocale = () => {
  const locale = useState<Locale>("locale", () => "en");

  const t = (key: string, params?: Record<string, string>) => {
    const entry = messages[locale.value]?.[key] ?? messages.en[key] ?? key;
    return format(entry, params);
  };

  const setLocale = (value: Locale) => {
    locale.value = value;
    if (!process.client) return;
    localStorage.setItem("locale", value);
    document.documentElement.lang = value === "km" ? "km" : "en";
  };

  const initLocale = () => {
    if (!process.client) return;
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved === "km" || saved === "en") {
      setLocale(saved);
      return;
    }
    const prefersKhmer = navigator.language?.toLowerCase().startsWith("km");
    setLocale(prefersKhmer ? "km" : "en");
  };

  return { locale, t, setLocale, initLocale };
};
