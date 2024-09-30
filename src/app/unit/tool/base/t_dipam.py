
class T_DIPAM_UNIT:
    """
    @param:
        + label: name of the dipam tool
        + description: a description of the dipam tool,
        + family: the macro family of the tool,
        + req_param: a list of requiered param(s) (of dipam data unit(s))
        + opt_param: a list of optional param(s) (of dipam data unit(s))
        + req_input: a list of requiered input(s) (of dipam data unit(s))
        + opt_input: a list of optional input(s) (of dipam data unit(s))
        + output: a list of output(s) (of dipam data unit(s))
    """
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
        self.type = "tool"
        self.id = "t-NN"
        self.label = label
        self.description = description
        self.family = family
        self.req_param = req_param
        self.opt_param = opt_param
        self.req_input = req_input
        self.opt_input = opt_input
        self.output = output
        # The tool data addresses data units in DIPAM
        self.data_param = []
        self.data_input = []
        self.data_output = []

    def set_id(self, id):
        """
        [NOT-OVERWRITABLE]
        Defines the id of the data unit.
        @param:
            + idx: a number to concat with the rest of the identifier
        @return: the id of the data unit
        """
        self.id = str(id)
        return self.id

    def dump_metadata(self):
        """
        [NOT-OVERWRITABLE]
        Returns the data to be used when storing the index data describing this unit
        """
        data = {
            "type": self.type,
            "id": self.id,
            "class": self.__class__.__name__,
            "label": self.label,
            "description": self.description,
            "family": self.family,
            "req_param": self.req_param,
            "opt_param": self.opt_param,
            "req_input": self.req_input,
            "opt_input": self.opt_input,
            "param":[],
            "data":[],
            "output":[]
        }
        for _p in self.data_param:
            data["param"].append(_p.id)
        for _i in self.data_input:
            data["data"].append(_i.id)
        for _o in self.data_output:
            data["output"].append(_o.id)
        return data

    def backend2view(self):
        """
        [NOT-OVERWRITABLE]
        Generates the data (as dict) to send to the view;
        value are edited following "value_view" (DIPAM_VIEW), if defined.
        @param:
        @return: a directory representing the data to send to the view
        """

        data = {
            "type": self.type,
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "family": self.family
        }
        return data

    def check(self, __input, __params):
        """
        [NOT-OVERWRITABLE]
        """
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

    def set_data_input(self, l_data_unit = []):
        """
        [NOT-OVERWRITABLE]
        Set a list of new DIPAM data unit as input to the tool
        """
        for data_unit in l_data_unit:
            du_c_name = data_unit.__class__.__name__
            if du_c_name in self.req_input or du_c_name in self.opt_input:
                self.data_input.append(data_unit)
        return self.data_input

    def delete_data_input(self, l_data_unit_ids = []):
        """
        [NOT-OVERWRITABLE]
        Set a list of new DIPAM data unit as input to the tool
        """
        new_data_input = []
        for unit_obj in self.data_input:
            if not unit_obj.id in l_data_unit_ids:
                new_data_input.append(unit_obj)
        self.data_input = new_data_input
        return self.data_input

    def set_param(self, data_unit):
        """
        [NOT-OVERWRITABLE]
        Set a new DIPAM data unit as a param to the tool
        """
        du_c_name = data_unit.__class__.__name__
        if du_c_name in self.req_input or du_c_name in self.opt_input:
            self.data_param.append(data_unit)
            return du_c_name
        return None

    def process(self):
        """
        [NOT-OVERWRITABLE]
        Executes the process and returns the corresponding output
        """
        self.tool_run()
        return self.output

    def tool_run(self):
        """
        Defines what the tool should do when it goes in "run" mood;
        By the end of this method the value self.output must be updated
        """
        return None
