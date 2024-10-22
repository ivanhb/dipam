# Always import:
from app.unit.tool.__t_dipam__ import T_DIPAM_UNIT

class T_TABCUTTER(T_DIPAM_UNIT):
    """
    @param:
        + label: name of the dipam tool
        + description: a description of the dipam tool,
        + family: the macro family of the tool,
        + param: a list of optional/mandatory values to use as input
        + input: a list of optional/mandatory dipam data unit(s) to use as input
        + output: a list of dipam data unit(s) produced as output by the tool
    """
    def __init__(self):
        super().__init__(
            label = "Table Cutter",
            description = "This tool takes a table as input and splits it in more tables",
            family = "General",

            direct_input = [
                ("din_rowsnum",True)
            ],

            input = [
                ("D_TABLE",True)
            ],

            output = [
                "D_TABLE"
            ]
        )


    #   -----
    #   Methods to manage the parametrs;
    #   Each method describes how to normalize the value of a specific parameter returned from the view
    #   The method to manage a param must be named as: param_manager__{PARAM_NAME}__(p_val)
    #   -----
    def direct_input_manager__din_rowsnum__(self, _val):
        try:
            return int( _val.strip() )
        except:
            return None, "error", "The row number value is not supported"
