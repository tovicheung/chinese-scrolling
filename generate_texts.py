from dataclasses import dataclass
import json
import os

@dataclass
class Config:
    start_paragraph: int = 1
    long: bool = False # use smaller font when rendering?

TEXTS = {}
TEXTS2 = {}

def generate_from_lines(base_name: str, lines: list[str], config: Config):
    para_counter = config.start_paragraph
    paragraph = ""

    index = 0
    translations = {}

    TEXTS2[base_name] = {}

    while len(lines[0].strip("\n")) == 0:
        lines.pop(0)
    
    def report_done():
        key = f"{base_name}-#{para_counter}"
        TEXTS[key] = {
            "text": paragraph,
            "translations": translations,
            "long": config.long,
        }
        # chinese characters take up double the space
        npad = 18 - len(base_name) * 2 - 2 - len(str(para_counter))
        print("Generated", key, " " * npad, f"({len(translations)} translates)".ljust(15), paragraph[:15], "...")

        TEXTS2[base_name][para_counter] = {
            "text": paragraph,
            "translations": translations,
        }

    for raw_line in lines:
        line = raw_line.strip("\n ")

        if len(line) == 0:
            # new paragraph
            report_done()
            para_counter += 1
            paragraph = ""

            index = 0
            translations = {}
        else:
            translation_index = -1 # index of starting bracket, -1 if none
            translation_length = 0
            translation = ""
            processed_text = ""

            for char in line:
                if translation_index != -1:
                    if char == "]":
                        length = max(1, translation_length)
                        translations[translation_index - length + 1] = (length, translation)
                        translation_index = -1
                    elif char == ".":
                        translation_length += 1
                    else:
                        translation += char
                    continue
                # not in brackets
                if char == "[":
                    translation_index = index - 1
                    translation_length = 0
                    translation = ""
                    continue
                if char in " 0123456789.":
                    continue
                processed_text += char
                index += 1
            
            paragraph += processed_text
        
    if paragraph:
        report_done()


for file in os.listdir("texts.ignore"):
    with open("texts.ignore/" + file, encoding = "utf-8") as f:
        lines = f.readlines()
        config = {}

        if lines[0].startswith("config "):
            config_str = lines.pop(0).removeprefix("config ")
            config: dict = json.loads(config_str)
        
        generate_from_lines(file, lines, Config(**config))

with open("data/texts.js", "w", encoding = "utf-8") as f:
    f.write("// This file is generated.\n\nconst TEXTS = ")
    f.write(json.dumps(TEXTS))
    f.write("\n")

with open("data/texts2.js", "w", encoding = "utf-8") as f:
    f.write("// This file is generated.\n\nconst TEXTS = ")
    f.write(json.dumps(TEXTS2))
    f.write("\n")
