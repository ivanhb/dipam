from app.base.io_handler import IO_DIPAM_HANDLER

import csv


class IOH_TABLE(IO_DIPAM_HANDLER):
    """
    A DIPAM IO instance to handler read/write operations for Table data types
    """
    def __init__(self):

        super().__init__(
            id = "ioh_table",
            v_att = {},
            f_att = {
                "extension": ["csv"],
                "name": None,
                "header": [],
                "rows_limit": None
            }
        )

    def f_read(self, *args):
        """
        <args> must contain:
            + a list storing the file paths to read
        """
        f_path = args[0]
        value = []
        # concat all values in the CSV(s) together in one matrix
        for _fp in f_path:
            with open(_fp, mode='r') as file:
                csv_reader = csv.reader(file)
                # in case a header is supposed to be in the file: skip it
                if len(self.header) > 0:
                    header = next(csv_reader)
                value.append( [row for row in csv_reader] )
        return value


    def f_write(self, *args):
        """
        <args> must contain:
            + a value
            + a destination directory where to write the files
        """
        value = args[0]
        dest_dir = args[1]

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
            dest_file = os.path.join(dest_dir,self.f_att.f_name,"-",str(file_count),".csv")
            with open(dest_file, mode='w', newline='') as file:
                csv.writer(file).writer.writerows(chunk)
            file_count += 1

            res_files.append(dest_file)

        return res_files



class IOH_TEXT(IO_DIPAM_HANDLER):
    """
    A DIPAM IO instance to handler read/write operations for Textual data types
    """
    def __init__(self):

        super().__init__(
            id = "ioh_text",
            v_att = {},
            f_att = {
                "extension": ["txt"],
                "name": None,
                "rows_limit": None
            }
        )

    def f_read(self, *args):
        """
        <args> must contain:
            + a list storing the file paths to read
            + a separator to use in case pf multiple files
        """
        f_path = args[0]
        f_sep = args[1]
        value = ""
        # concat all values in the CSV(s) together in one matrix
        for _fp in f_path:
            with open(_fp, 'r') as file:
                value += file.read()
            value += f_sep
        return value

    def f_write(self, *args):
        """
        <args> must contain:
            + a value to write
            + a destination directory
        """
        """
        [REQ-OVERWRITABLE]
        """
        value = args[0]
        value = value.split("\n")
        dest_dir = args[1]

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
            chunk_concat = "\n".join(chunk)

            # Write this chunk to a new file
            dest_file = os.path.join(dest_dir,self.f_att.f_name,"-",str(file_count),".txt")
            with open(_dest, 'w') as file:
                file.write( chunk_concat )
            file_count += 1
            res_files.append(dest_file)

        return res_files
