# Always import:
from app.unit.data.__d_dipam__ import D_DIPAM_UNIT


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
                "name": "text",
                # -- Added Attributes
                "header": None,
                "rows_limit": None
            }
        )

    def v_check(self, a_val):
        """
        If the value is a string, the check is successful.
        """
        return isinstance(a_val, str)


    def f_read(self, file_path):
        """
        """
        value = None
        with open(file_path, 'r') as file:
            value = file.read()
        return value

    def f_write(self, dir_path):
        """
        """
        value = self.value
        dest_dir = dir_path

        res_files = []
        total_rows = len(value)

        # Split data into chunks and write each chunk to a new CSV file
        step = self.f_att.rows_limit
        if step == None:
            # in case no limit is given the for step is equal all rows (the iteration is done one time only)
            step = total_rows + 1

        file_count = 1
        value = value.split("\n")
        for start_idx in range(0, total_rows, step):
            end_idx = min(start_idx + self.f_att.rows_limit, total_rows)
            chunk = value[start_idx:end_idx]
            chunk_concat = "\n".join(chunk)

            # Write this chunk to a new file
            dest_file = os.path.join(dest_dir,self.f_att.name,"-",str(file_count),".txt")
            with open(_dest, 'w') as file:
                file.write( chunk_concat )
            file_count += 1
            res_files.append(dest_file)

        return res_files

    def map_value_to_template_args(self, value):
        """
        """
        res = {
            "value-title": self.label,
            "value-description": self.description,
            "value-text_palceholder": "Set a string value ..."
        }
        return res
