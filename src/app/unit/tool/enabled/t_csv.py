from basic.t_dipam import T_DIPAM

"""
T_HALFCSV extends T_DIPAM
"""

class T_HALFCSV(T_DIPAM):

    def __init__(self, d_csv):
        super().__init__(
            label = "Half CSV",
            description = "This tool split the CSV file in two files",
            family = "CSV tools",
            req_params = [],
            opt_params = [],
            req_input = ["D_CSV"],
            opt_input = [],
            output = ["D_CSV","D_CSV"]
        )
        self.label = "Table"

    def process(self):
        # ... 
