
# The base class to extend
from app.data.base.d_dipam import D_DIPAM_UNIT

import csv
import os

"""
D_TABLE extends D_DIPAM_UNIT
"""

class D_TABLE(D_DIPAM_UNIT):

    def __init__(self,
        file_path = None
    ):

        super().__init__(
            label = "Table",
            description = "A general table",
            family = "Common data",
            extension = ["csv","tsv"],
            file_path = file_path
        )


class D_CSV:
    def __init__(self,
        file_path = None
    ):
        """
        Initialize the path to the CSV file.
        :param file_path: Path to the CSV file.
        """
        self.file_path = file_path
        self.extension = "csv"
        self.label = "CSV File"

    def read(self):
        """
        Read the contents of the CSV file and return it as a list of rows.
        :return: List of rows, where each row is a list of strings.
        :raises FileNotFoundError: If the file does not exist.
        """
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"The file {self.file_path} does not exist.")

        with open(self.file_path, 'r', newline='') as file:
            reader = csv.reader(file)
            return list(reader)

    def write(self, rows, headers=None):
        """
        Write rows to the CSV file, overwriting any existing content.

        :param rows: List of rows, where each row is a list of strings.
        :param headers: Optional list of headers to write as the first row.
        """
        with open(self.file_path, 'w', newline='') as file:
            writer = csv.writer(file)
            if headers:
                writer.writerow(headers)
            writer.writerows(rows)

    def append(self, rows):
        """
        Append rows to the CSV file.
        :param rows: List of rows, where each row is a list of strings.
        """
        with open(self.file_path, 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerows(rows)

    def delete(self):
        """
        Delete the CSV file.
        :raises FileNotFoundError: If the file does not exist.
        """
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"The file {self.file_path} does not exist.")

        os.remove(self.file_path)
