# LinkedIn Post Import Scripts

This directory contains scripts for importing LinkedIn posts into the Hugo site as articles.

## CSV Import Method

The CSV import method allows you to export your LinkedIn posts to a CSV file and then import them as Hugo markdown files.

### How to Export LinkedIn Posts

1. Go to LinkedIn and navigate to your posts
2. Create a CSV file with the following columns:
   - `date`: Publication date in YYYY-MM-DD format
   - `title`: Post title
   - `content`: Post content (can span multiple lines)
   - `slug`: (Optional) URL-friendly slug for the post

See `linkedin_posts_example.csv` for a sample format.

### Usage

```bash
python3 scripts/import_linkedin_posts.py <csv_file>
```

### Example

```bash
# Import posts from a CSV file
python3 scripts/import_linkedin_posts.py linkedin_posts.csv

# Use the example file to test
python3 scripts/import_linkedin_posts.py scripts/linkedin_posts_example.csv
```

### CSV Format

The CSV file should have the following structure:

```csv
date,title,content,slug
2025-04-15,Post Title,"Post content here. Can be multiline.",optional-slug
```

**Notes:**
- The `date` field must be in `YYYY-MM-DD` format
- The `title` and `content` fields are required
- The `slug` field is optional; if not provided, it will be auto-generated from the title
- Use quotes around content with commas or newlines
- Multiline content is supported within quoted fields

### Generated Files

The script will create markdown files in the `content/posts/` directory with the following format:

```markdown
---
date: 2025-04-15
title: "Post Title"
---

Post content here...
```

### Tips

1. **Exporting from LinkedIn**: LinkedIn doesn't provide a direct CSV export for posts. You'll need to:
   - Copy/paste your posts into a spreadsheet
   - Export the spreadsheet as CSV
   - Or use a third-party LinkedIn data export tool

2. **Handling Multiline Content**: When creating your CSV, wrap content with line breaks in double quotes

3. **Avoiding Duplicates**: The script will warn you if a file with the same slug already exists and ask for confirmation before overwriting

## Future Enhancements

Potential future additions:
- Direct LinkedIn API integration (requires OAuth authentication)
- Support for images and embedded media
- Automated LinkedIn engagement data (likes, comments)
- Batch processing with dry-run mode
