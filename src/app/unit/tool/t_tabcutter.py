# Always import:
from app.unit.base.__t_dipam__ import T_DIPAM_UNIT

class T_TABCUTTER(T_DIPAM_UNIT):
    """
    @param:
        + label: name of the dipam tool
        + description: a description of the dipam tool,
        + family: the macro family of the tool,
        + direct_input: a list of optional/mandatory values to use as input
        + input: a list of optional/mandatory dipam data unit(s) to use as input
        + output: a list of dipam data unit(s) produced as output by the tool
    """
    def __init__(self):
        super().__init__(
            label = "Table Cutter",
            description = "This tool takes a table as input and splits it in more tables",
            family = "General",

            param = [
                ("rowsnum",True)
            ],

            input = [
                ("D_TABLE",True)
            ],

            output = [
                "D_TABLE"
            ]
        )


    def vinput_manager(self, data):
        """
        This method manages all the <data-dipam-value>(s) defined in the HTML template;
        It reads and elaborates the given values and returns a new value to assign for the param value.
        """
        new_params = {}
        try:
            _val = data["din_rowsnum"].strip()
            if _val == "":
                return None, "error", "Please provide the number of rows to cut!"
            new_params["rowsnum"] = int( _val )
        except:
            return None, "error", "The row number value is not supported"

        return new_params
