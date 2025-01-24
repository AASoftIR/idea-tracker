import os
import re

def replace_jsdoc_comments_recursive(directory):
    # JSDoc comment regex pattern (matches multi-line and single-line JSDoc comments)
    jsdoc_pattern = re.compile(r'/\*\*[\s\S]*?\*/', re.MULTILINE)
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            # Process only .js files
            if file.endswith('.js') or file.endswith('.svelte'):
                file_path = os.path.join(root, file)
                try:
                    # Read the file content
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace JSDoc comments
                    modified_content = jsdoc_pattern.sub('// jsdoc', content)
                    
                    # Write back to the file if content was modified
                    if modified_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(modified_content)
                        print(f"Processed: {file_path}")
                
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

def main():
    # Use the current directory by default
    base_directory = "./project/frontend/src"
    
    # Call the recursive function to replace JSDoc comments
    replace_jsdoc_comments_recursive(base_directory)
    print("JSDoc comment replacement complete.")

if __name__ == "__main__":
    main()
