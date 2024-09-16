
class T_DIPAM:
    def __init__(
            self,
            label = "Dipam tool title",
            description = "A description of the Dipam tool",
            family = "The macro family of the Dipam tool",
            req_param = [],
            opt_param = [],
            req_input = [],
            opt_input = [],
            output = []
        ):
        """
        label: name of the dipam tool
        description: a description of the dipam tool,
        family: the macro family of the tool,
        req_param: a list of requiered param(s) (of data types)
        opt_param: a list of optional param(s) (of data types)
        req_input: a list of requiered input(s) (of data types)
        opt_input: a list of optional input(s) (of data types)
        output: a list of output(s) (of data types)
        """

        self.label = label
        self.description = description
        self.family = family
        self.req_param = req_param
        self.opt_param = opt_param
        self.req_input = req_input
        self.opt_input = opt_input
        self.output = output


    def check(__input, __params):
        __input__class_names = set( [_a.__class__.__name__ for _a in __input] )
        __params__class_names = set( [_a.__class__.__name__ for _a in __params] )

        input_check = set(req_input).issubset(__input__class_names)
        param_check = set(req_param).issubset(__params__class_names)

        err_msg = ""
        if not input_check:
            err_msg = "Error: input data"
        elif not param_check:
            err_msg = "Error: parameters"

        return ( input_check and param_check , err_msg )
