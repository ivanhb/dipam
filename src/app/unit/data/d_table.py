# Always import:
from app.unit.data.base.__d_dipam__ import D_DIPAM_UNIT

import os
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
            family = "General"
        )

        # set the attributes of this data unit
        self.header = None
        self.rows_limit = None
        self.tab_direct_raw = None

        # set the initial value of this data unit
        self.value = []

    def store_value(self, unit_dir_path):

        value = self.value

        res_files = []
        total_rows = len(value)

        # Split data into chunks and write each chunk to a new CSV file
        # in case no limit is given the for step is equal all rows (the iteration is done one time only)
        step = self.rows_limit
        if step == None:
            step = total_rows + 1

        file_count = 1
        for start_idx in range(0, total_rows, step):
            end_idx = min(start_idx + step, total_rows)
            chunk = value[start_idx:end_idx]

            if self.header:
                chunk.insert(0,self.header)

            # Write this chunk to a new file
            dest_file = os.path.join(unit_dir_path,"gtab-"+str(file_count)+".csv")
            with open(dest_file, mode='w', newline='') as file:
                csv.writer(file).writerows(chunk)
            file_count += 1

            res_files.append(dest_file)

        return True


    def is_value_match(self, a_value):
        a = a_value
        b = self.value

        if b:
            # Check if both matrices have the same dimensions
            if len(a) != len(b) or any(len(row_a) != len(row_b) for row_a, row_b in zip(a, b)):
                return False
            # Compare each element in both matrices
            for row_a, row_b in zip(a, b):
                if row_a != row_b:
                    return False
            return True

        return False


    def manage_view_file(self, l_files):
        new_value = []

        for file in l_files:
            # Check if the file is a CSV by checking the extension
            if not file.endswith('.csv'):
                return None

            with open(file, mode='r', newline='') as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    new_value.append(row)

        return new_value


    def direct_input_manager(self, a_value):
        """
        """
        try:
            res = []
            rows = a_value["tab_direct_raw"].strip().split("\n")
            if len(rows) > 0:
                rows = [row.split(",") for row in rows]
                header = rows[0]
                for r_cells in rows:
                    if len(r_cells) != len(header):
                        return None, "error", "The provided value is not convertable into table format – rows have different number of cells"
                    res.append(r_cells)
            return res
        except:
            return None, "error", "The provided value is not convertable into table format"
