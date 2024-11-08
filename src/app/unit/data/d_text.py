# Always import:
from app.unit.base.__d_dipam__ import D_DIPAM_UNIT

import os

class D_TEXT(D_DIPAM_UNIT):
    """
    D_TEXT extends D_DIPAM_UNIT;
    This type of data is a general text which might be specified as direct VALUE or FILE
    """
    def __init__(self):
        super().__init__(
            label = "Dipam Any Text",
            description = "A general textual content. If specified by file any open format textual file is supported (e.g. txt, md, yaml, xml, html, etc)",
            family = "General",
            value = ""
        )

    def store_value(self, unit_dir_path):
        file_path = os.path.join(unit_dir_path, "gtext.txt")
        with open(file_path, 'w') as file:
            file.write(self.value)
        return True

    def is_value_match(self, a_value):
        return a_value == self.value

    def load_value(self, unit_dir_path):
        all_text = ""
        for filename in os.listdir(unit_dir_path):
            if filename.endswith('.txt'):
                file_path = os.path.join(unit_dir_path, filename)
                with open(file_path, 'r', encoding='utf-8') as file:
                    all_text += file.read()
                    all_text += "\n"
        return all_text


    # ---
    # Methods to manage the view inputs:
    # (1) finput_manager(): to manage the uploaded files
    # (2) vinput_manager(): to manage the <data-dipam-value>(s) defined in the HTML template;
    # ---

    def finput_manager(self, files):
        """
        If defined then the view will integrate the possibility of uploading a file.
        It reads and elaborates the given files and returns a new value to assign for this data unit.
        """
        new_value = ""
        for file in files:
            pref = file.filename.split(".")[-1]
            if not pref == 'txt':
                return False, "[ERROR] Some files have a non-supported format for this type of data"
            file_content = file.read()
            new_value = new_value +"\n"+ file_content.decode('utf-8')
        return new_value

    def vinput_manager(self, data):
        """
        This method manages all the <data-dipam-value>(s) defined in the HTML template;
        It reads and elaborates the given values and returns a new value to assign for this data unit.
        """
        try:
            _freetxt = data["input_freetxt"]
            if isinstance(_freetxt, str):
                return _freetxt
            else:
                return ""
        except:
            return None, "error", "The provided value is not a string value"

        return None, "error", "No values have been provided"
