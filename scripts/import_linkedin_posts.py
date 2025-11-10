#!/usr/bin/env python3
"""
LinkedIn Post Importer for Hugo

This script imports LinkedIn posts from a CSV file and converts them into
Hugo-compatible markdown files in the content/posts/ directory.

CSV Format:
- date: Publication date (YYYY-MM-DD)
- title: Post title
- content: Post content (can be multiline)
- slug: Optional URL slug (auto-generated from title if not provided)

Usage:
    python3 scripts/import_linkedin_posts.py <csv_file>

Example:
    python3 scripts/import_linkedin_posts.py linkedin_posts.csv
"""

import csv
import os
import sys
import re
from datetime import datetime
from pathlib import Path


def slugify(text):
    """Convert text to a URL-friendly slug."""
    # Convert to lowercase
    text = text.lower()
    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    # Remove non-alphanumeric characters except hyphens
    text = re.sub(r'[^\w\-]', '', text)
    # Remove multiple consecutive hyphens
    text = re.sub(r'-+', '-', text)
    # Strip hyphens from start and end
    text = text.strip('-')
    return text


def validate_date(date_str):
    """Validate and parse date string in YYYY-MM-DD format."""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def create_hugo_post(date, title, content, slug=None, output_dir='content/posts'):
    """
    Create a Hugo markdown post file.
    
    Args:
        date: Publication date (YYYY-MM-DD)
        title: Post title
        content: Post content
        slug: Optional URL slug (auto-generated if not provided)
        output_dir: Output directory for posts
    
    Returns:
        str: Path to created file
    """
    # Generate slug from title if not provided
    if not slug:
        slug = slugify(title)
    
    # Create front matter
    front_matter = f"""---
date: {date}
title: "{title}"
---

"""
    
    # Combine front matter and content
    full_content = front_matter + content.strip()
    
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Create filename
    filename = f"{slug}.md"
    filepath = output_path / filename
    
    # Check if file already exists
    if filepath.exists():
        print(f"⚠️  Warning: File already exists: {filepath}")
        response = input("Overwrite? (y/n): ")
        if response.lower() != 'y':
            print(f"Skipped: {filename}")
            return None
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)
    
    print(f"✓ Created: {filepath}")
    return str(filepath)


def import_from_csv(csv_file, output_dir='content/posts'):
    """
    Import LinkedIn posts from a CSV file.
    
    Args:
        csv_file: Path to CSV file
        output_dir: Output directory for posts
    
    Returns:
        tuple: (success_count, error_count)
    """
    if not os.path.exists(csv_file):
        print(f"❌ Error: CSV file not found: {csv_file}")
        return 0, 0
    
    success_count = 0
    error_count = 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Validate required columns
        required_columns = {'date', 'title', 'content'}
        if not required_columns.issubset(reader.fieldnames):
            print(f"❌ Error: CSV must contain columns: {', '.join(required_columns)}")
            print(f"Found columns: {', '.join(reader.fieldnames)}")
            return 0, 0
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
            try:
                # Validate required fields
                date = row['date'].strip()
                title = row['title'].strip()
                content = row['content'].strip()
                slug = row.get('slug', '').strip() or None
                
                if not date or not title or not content:
                    print(f"❌ Row {row_num}: Missing required field(s)")
                    error_count += 1
                    continue
                
                # Validate date format
                if not validate_date(date):
                    print(f"❌ Row {row_num}: Invalid date format (expected YYYY-MM-DD): {date}")
                    error_count += 1
                    continue
                
                # Create post
                result = create_hugo_post(date, title, content, slug, output_dir)
                if result:
                    success_count += 1
                else:
                    error_count += 1
                    
            except Exception as e:
                print(f"❌ Row {row_num}: Error - {str(e)}")
                error_count += 1
    
    return success_count, error_count


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/import_linkedin_posts.py <csv_file>")
        print("\nExample:")
        print("  python3 scripts/import_linkedin_posts.py linkedin_posts.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    # Get script directory and repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    output_dir = repo_root / 'content' / 'posts'
    
    print(f"Importing LinkedIn posts from: {csv_file}")
    print(f"Output directory: {output_dir}")
    print("-" * 60)
    
    success, errors = import_from_csv(csv_file, str(output_dir))
    
    print("-" * 60)
    print(f"Import complete:")
    print(f"  ✓ Successfully imported: {success}")
    print(f"  ✗ Errors: {errors}")
    
    if errors > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
