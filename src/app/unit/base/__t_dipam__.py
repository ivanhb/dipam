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
            new_value = new_value | data

        # if source_is_view, then a convertion of the data coming from the view is needed
        if source_is_view:

            # Manage the given value inputs to update value.param
            if "vinput" in data:
                new_value["param"] = self.vinput_manager(data["vinput"])

            # Manage dipam data units given as input to update value.input
            if "uinput" in data:
                new_value["input"] = self.uinput_manager(data["uinput"])

        self.value = new_value
        if unit_base_dir:
            self.store_value(unit_base_dir)

        return new_value

    def store_value(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        This methods defines how to write a json file contating the data of this unit;
        its based on the values contained in <self.value>;
        @param:
            <unit_dir_path>: to define where to store the file to write
        @return:
            True/False, If False, an explaination is given (tuple)
        """
        try:
            file_path = os.path.join(unit_dir_path, str(self.id)+".json")
            with open(file_path, 'w') as file:
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

    def remove_uinput(self, din_id):
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
    # (2) uinput_manager(): This method is responsible for managing uploaded inputs;
    # (3) [OVERWRITABLE] input_manager(): to manage the <data-dipam-value>(s) defined in the HTML template;
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
        This method is responsible for processing/normalizing an uploaded direct input from the view;
        The content validation of the new value produced is out of scope for this method.
        DIRECT_INPUT_NAME must be set as the name of the direct input that this method manages
        @param:
            <a_value> the direct_input value given by the view
        @return:
            a new normalized value to assign to the direct_input of the tool
        """
        return True
