# Always import:
from app.unit.data.__d_dipam__ import D_DIPAM_UNIT

import csv

class D_TABLE(D_DIPAM_UNIT):
    """
    D_TABLE extends D_DIPAM_UNIT;
    This type of data is a general table which might be specified as direct VALUE or FILE

    Value format: List of List
    File format: a CSV file
    """
    def __init__(self):
        super().__init__(
            label = "Dipam Table",
            description = "A general table type of data (in .csv or .tsv format)",
            family = "General",
            f_att = {
                "extension": ["csv"],
                "name": "tab",
                # -- Added Attributes
                "header": [],
                "rows_limit": None
            }
        )

    def v_check(self, a_val):
        """
        If the value is a List(List), the check is successful.
        """
        if isinstance(a_val, list):
            return all(isinstance(i, list) for i in a_val)
        return False

    def f_read(self, file_path):
        """
        """
        value = []
        # concat all values in the CSV(s) together in one matrix
        for _fp in file_path:
            with open(_fp, mode='r') as file:
                csv_reader = csv.reader(file)
                # in case a header is supposed to be in the file: skip it
                if len(self.header) > 0:
                    header = next(csv_reader)
                value.append( [row for row in csv_reader] )
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
        for start_idx in range(0, total_rows, step):
            end_idx = min(start_idx + self.f_att.rows_limit, total_rows)
            chunk = value[start_idx:end_idx]

            if len(self.f_att.header) > 0:
                chunk.insert(0,self.f_att.header)

            # Write this chunk to a new file
            dest_file = os.path.join(dest_dir,self.f_att.name,"-",str(file_count),".csv")
            with open(dest_file, mode='w', newline='') as file:
                csv.writer(file).writer.writerows(chunk)
            file_count += 1

            res_files.append(dest_file)

        return res_files
