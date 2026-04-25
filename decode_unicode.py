#!/usr/bin/env python3
import re
import sys

def decode_unicode(match):
    return chr(int(match.group(1), 16))

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace \uXXXX patterns with actual unicode chars
    new_content = re.sub(r'\\u([0-9a-fA-F]{4})', decode_unicode, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ Decoded {filepath}")
        return True
    else:
        print(f"- No changes needed in {filepath}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 decode_unicode.py <file1> [file2] ...")
        sys.exit(1)

    changed = 0
    for filepath in sys.argv[1:]:
        if process_file(filepath):
            changed += 1

    print(f"\n{changed} file(s) modified")
