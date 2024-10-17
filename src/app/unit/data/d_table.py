# Always import:
from app.unit.data.__d_dipam__ import D_DIPAM_UNIT

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
        # custom attributes
        self.header = None
        self.rows_limit = None

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


    def manage_view_direct_value(self, a_value):

        if "input_textarea" in a_value:
            part_value = a_value["input_textarea"]
            if isinstance(part_value, str):
                # Split the string into rows using "\n"
                rows = part_value.strip().split("\n")
                # Split each row into cells using ","
                list_of_lists = [row.split(",") for row in rows]
                return list_of_lists

        return False, "[ERROR] Some files have a non-supported format for this type of data"
