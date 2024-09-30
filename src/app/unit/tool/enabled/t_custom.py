# Always import:
from app.unit.tool.base.t_dipam import T_DIPAM_UNIT
from app.enabled.io_handler_custom import *
from app.enabled.view_handler_custom import *

class T_TABLE_HALVE(T_DIPAM_UNIT):

    def __init__(self):
        super().__init__(
            label = "Halve Table",
            description = "This tool split a Table in two tables",
            family = "Table Editor",
            req_param = [],
            opt_param = [],
            req_input = ["D_TABLE"],
            opt_input = [],
            output = ["D_TABLE","D_TABLE"]
        )


    def tool_run(self):
        return None
