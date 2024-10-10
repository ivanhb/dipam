# Always import:
from app.unit.data.__d_dipam__ import D_DIPAM_UNIT

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
            f_att = {
                "extension": ["txt"],
                "name": "gtext",
                # -- Added Attributes
                "header": None,
                "rows_limit": None
            }
        )

    #   -----
    #   Methods to manage writing/updating self.value
    #   -----

    def store_value(self, unit_dir_path):
        file_path = os.path.join(unit_dir_path, self.f_att["name"]+".txt")
        with open(file_path, 'w') as file:
            file.write(self.value)
        return True

    def is_value_match(self, a_value):
        return a_value == self.value

    def manage_view_file(self, l_files):
        new_value = ""
        for file in l_files:
            pref = file.filename.split(".")[-1]
            if not pref == 'txt':
                return False, "[ERROR] Some files have a non-supported format for this type of data"
            file_content = file.read()
            new_value = new_value +"\n"+ file_content.decode('utf-8')
        return new_value

    def manage_view_direct_value(self, a_value):
        if not isinstance(a_value,str):
            return False, "[ERROR] Some files have a non-supported format for this type of data"
        new_value = a_value
        return new_value


    def f_read(self, file_path):
        """
        """
        value = None
        with open(file_path, 'r') as file:
            value = file.read()
        return value
