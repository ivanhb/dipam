from app.base.messenger import DIPAM_MESSENGER
from app.base.__unit_dipam__ import DIPAM_UNIT
import app.base.util as util
from collections import defaultdict
import re
import os
import json

class T_DIPAM_UNIT(DIPAM_UNIT):
    """
    Defines a DIPAM tool unit;
    New tool units to integrate should extend this Class, and define the following @param(s) and @method(s)

    @param:
        + <label>: name/title of the dipam tool
        + <description>: a description of the dipam tool,
        + <family>: the macro family of the tool,
        + <param>: a list of params this tool can have
        + <input>: a list of Dipam Data Units this tool can have
        + <output>: a list of Dipam Data Units this tool will output

    @method:
        + ...

    [*]: Mandatory

    """
    def __init__(
            self,
            label = "Dipam tool title",
            description = "A description of the Dipam tool",
            family = "The macro family of the Dipam tool",

            param = [
                # ( PARAM-NAME, True/False if mandatory)
            ],

            input = [
                # ( D-DIPAM-NAME, True/False if mandatory)
            ],

            output = [
                # D-DIPAM-NAME
            ]
        ):

        super().__init__(
            type = "tool",
            label = label,
            description = description
        )

        self.family = family
        self.param = param
        self.input = input
        self.output = output

        self.value = {
            "param": {},
            "input": {},
            "output": {}
        }

    #   -----
    #   Methods to manage writing/updating self.value
    #   -----


    def write_value(self, data = None, source_is_view = False, unit_base_dir = None):
        """
        [NOT-OVERWRITABLE]
        This method writes the given view data (<data>) of the unit in <self.value>
        @param:
        @returns:
            self.value
        @Note: to return an log msg the data to return must be followed by a log-type, and log-msg;
            e.g. "Hi my name is ivan", "info", "this is a general info"
        """
        new_value = self.value
        if data:
            new_value |= data

        # if source_is_view, then a convertion of the data coming from the view is needed
        if source_is_view:

            # Manage the given value inputs to update value.param
            if "vinput" in data:
                new_value["param"] = self.vinput_manager(data["vinput"])

            # Manage dipam data units given as input to update value.input
            if "uinput" in data:
                new_value["input"] = self.uinput_manager(data["uinput"])

        self.value |= new_value
        if unit_base_dir:
            unit_file_path = self.mk_storage(unit_base_dir)
            if self.value:
                self.store_value(unit_file_path)

        return self.value

    def store_value(self, unit_file_path):
        """
        [NOT-OVERWRITABLE]
        This methods defines how to write a json file contating the data of this unit;
        its based on the values contained in <self.value>;
        @param:
            <unit_file_path>: the JSON file where to store the data
        @return:
            True/False, If False, an explaination is given (tuple)
        """
        try:
            with open(unit_file_path, 'w') as file:
                # remove view value attributes
                print("Store data:",self.value)
                try:
                    del self.value["vinput"]
                    del self.value["uinput"]
                    del self.value["label"]
                except:
                    pass
                json.dump(self.value, file, indent=4)
            return self.value
        except:
            return None,"error","Something wrong happend while storing the tool values"

    def load_value(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        Reads the value of the unit; if <unit_dir_path> then it reads it from the filesystem;
        """
        file_path = os.path.join(unit_dir_path, str(self.id)+".json")
        with open(file_path, 'r') as f_json:
            return json.load(f_json)

    def rm_storage(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        Remove the File system storage
        """
        print(unit_dir_path)
        file_path = os.path.join(unit_dir_path, str(self.id)+".json")
        return util.delete_file( file_path )

    def mk_storage(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        Remove the File system storage
        """
        file_path = os.path.join(unit_dir_path, str(self.id)+".json")
        if not os.path.exists(file_path):
            with open(file_path, 'w') as file:
                json.dump(self.value, file, indent=4)
        return file_path

    def tool_run(self):
        """
        [NOT-OVERWRITABLE]
        Executes the process and returns the corresponding output
        """
        # check if all mandatory params have been set
        check_mandatory = all(_k in self.value["direct_input"] for _k in [_p[0] for _p in self.direct_input if _p[1] ])
        if not check_mandatory:
            return None,"error","Some mandatory direct inputs are not set"

        # check if all mandatory inputs have been set
        check_mandatory = all(_k in self.value["input"] for _k in [_in[0] for _in in self.input if _in[1] ])
        if not check_mandatory:
            return None,"error","Some mandatory inputs are not set"

        self.output = self.process()
        return self.output

    def process(self):
        """
        [OVERWRITABLE]
        Defines the processing behaviour of the tool;
        The method must use <self.value.param> to access the corresponding values
        @return:
            + A dict, with pairs: <self.output:key>: <value>
                *Note: all keys of self.output must have a corresponding value
        """
        return None

    def remove_input(self, din_id):
        """
        [NOT-OVERWRITABLE]
        This method is responsible for removing an input from <self.value>;
        @param:
            <din_id> the id of the input (d_dipam)
        @return:
            True/False
        """
        new_input_val = {}
        found_it = False, "warning", "element not found"
        for k,v in self.value["input"].items():
            if v != din_id:
                new_input_val[k] = v
            else:
                found_it = True, "info", "element found and removed"

        self.value["input"] = new_input_val
        return found_it


    # ---
    # Methods to manage the view:
    # (1) gen_view_template(): to generate the view template of this data unit
    # (2) [OVERWRITABLE] finput_manager(): to manage the uploaded files
    # (3) [OVERWRITABLE] vinput_manager(): to manage the <data-dipam-value>(s) defined in the HTML template;
    # ---

    def uinput_manager(self, a_inputs):
        """
        [NOT-OVERWRITABLE]
        This method is responsible for managing uploaded inputs;
        @param:
            <a_inputs> a list of dipam data unit id(s)
        @return:
            a list of dipam data unit id(s)
        """
        return a_inputs

    def vinput_manager(self, data):
        """
        [OVERWRITABLE]
        This method manages all the <data-dipam-value>(s) defined in the HTML template;
        It reads and elaborates the given values and returns a new value to assign for the param value.
        @param:
            <data> the <data-dipam-value>(s) with corresponding values
        @return:
            a new param dict to assign to value.param
        """
        return True
