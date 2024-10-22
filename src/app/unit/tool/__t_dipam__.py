from app.base.messenger import DIPAM_MESSENGER
from collections import defaultdict
import re
import os
import json

class T_DIPAM_UNIT:
    """
    @param:
        + label: name of the dipam tool
        + description: a description of the dipam tool,
        + family: the macro family of the tool,
        + param: a list of optional/mandatory values to use as input
        + input: a list of optional/mandatory dipam data unit(s) to use as input
        + output: a list of dipam data unit(s) produced as output by the tool
    """
    def __init__(
            self,
            label = "Dipam tool title",
            description = "A description of the Dipam tool",
            family = "The macro family of the Dipam tool",

            direct_input = [
                # ( DIRECT-INPUT-NAME, True/False if mandatory)
            ],

            input = [
                # ( D-DIPAM-NAME, True/False if mandatory)
            ],

            output = [
                # D-DIPAM-NAME
            ]
        ):
        self.type = "tool"
        self.id = "t-NN"
        self.unit_class = self.__class__.__name__

        # These are metadata values
        self.label = label
        self.description = description
        self.family = family


        self.direct_input = direct_input
        self.input = input
        self.output = output

        self.value = {
            "direct_input": {},
            "input": [],
            "output": []
        }

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

    def dump_attributes(self):
        """
        [NOT-OVERWRITABLE]
        @return: a dict with all the attributes of this class
        """
        return self.__dict__

    def set_meta_attributes(self,data):
        """
        [NOT-OVERWRITABLE]
        Returns the data to be used when storing the index data describing this unit
        """
        updated_keys = set()
        for k in data:
            if hasattr(self, k):
                setattr(self, k, data[k])
                updated_keys.add(k)
        return updated_keys


    # IO operations
    def write(self, data = None, source_is_view = False, unit_base_dir = None):

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
            new_value = data

        # if source_is_view, then a convertion of the data coming from the view is needed
        if source_is_view:

            # manage the given direct_input(s): call the manager of each direct_input
            if "direct_input" in data:
                for p_key, p_val in data["direct_input"].items():
                    try:
                        _direct_input_manager = getattr(self, "direct_input_manager__"+p_key+"__", None)
                        _new_val = _direct_input_manager(p_val)
                        msg = DIPAM_MESSENGER.build_app_msg(_new_val)
                        if not msg[1] == None:
                            return msg

                        new_value["direct_input"][p_key] = _new_val
                    except:
                        return None,"error","Something wrong in the direct input(s) assignment"

            # Manage dipam data units given as input and insert them into self.input format
            if "input" in data:
                new_value["input"] = self.inputs_manage(  data["input"]  )


            # # check if all mandatory params have been set
            # check_mandatory = all(_k in new_value["direct_input"] and new_value["direct_input"][_k] != None for _k in [_p[0] for _p in self.direct_input if _p[1] ])
            # if not check_mandatory:
            #     return None,"error","Some mandatory direct inputs are not set"
            #
            # # check if all mandatory inputs have been set
            # check_mandatory = all(_k in new_value["input"] for _k in [_in[0] for _in in self.input if _in[1] ])
            # if not check_mandatory:
            #     return None,"error","Some mandatory inputs are not set"


        self.value = new_value
        if unit_base_dir:
            new_val = self.store_value(unit_base_dir)

        return new_val

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

    def tool_run(self):
        """
        [NOT-OVERWRITABLE]
        Executes the process and returns the corresponding output
        """
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

    #   -----
    #   Methods to manage the view template
    #   -----

    def gen_view_template(self, base_view_fpath, unit_view_fpath):
        """
        [NOT-OVERWRITABLE]
        Generates the view template to send to the view
        @return: a HTML template of this unit
        """
        # get a dictionary for all the attributes
        template_args = self.dump_attributes()

        # load the html template of this unit;
        # the html template file must be in same dir with same name of this class but lowercase
        # Use the format method to replace placeholders
        with open(base_view_fpath, 'r') as file_base, open(unit_view_fpath, 'r') as file_unit:
            template_base = file_base.read()
            template_unit = file_unit.read()

        # Extract divs from the <template_unit> and place them in <template_base>
        for pattern, placeholder in [
            (r"<!--START:HTML-TEMPLATE-->(.*?)<!--HTML-TEMPLATE:END-->", "<!--HTML-TEMPLATE-UNIT-->"),
            (r"<!--START:VIEW-VALUE-->(.*?)<!--VIEW-VALUE:END-->", "<!--VIEW-VALUE-UNIT-->"),
            (r"<!--START:EVENT-TRIGGER-->(.*?)<!--EVENT-TRIGGER:END-->", "<!--EVENT-TRIGGER-UNIT-->")
        ]:
            match = re.search(pattern, template_unit, re.DOTALL)
            template_base = template_base.replace(placeholder, match.group(1) if match else "")

        # put args in the HTML part
        # Use regex to extract the desired parts
        match = re.search(r"<!--START:HTML-TEMPLATE-BASE-->(.*?)<!--HTML-TEMPLATE-BASE:END-->(.*)", template_base, re.DOTALL)
        if match:
            html_template = match.group(1).format(**template_args)
            script_template = match.group(2).strip()

            # to make it just clean code
            # remove the script tag from it
            script_template = re.sub(r'<script type="text/javascript">(.*?)</script>', r'\1', script_template, flags=re.DOTALL)
            # remove the html comments
            script_template = re.sub(r'<!--.*?-->', '', script_template, flags=re.DOTALL)  # Remove comments
            return html_template, script_template
        return None, None


    def direct_input_manager__DIRECT_INPUT_NAME__(self, a_value):
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
        return a_value


    def inputs_manage(self, a_inputs):
        """
        [NOT-OVERWRITABLE]
        This method is responsible for processing uploaded inputs;
        @param:
            <a_inputs> a list of dipam data unit id(s)
        @return:
            a list of dipam data unit id(s)
        """
        if a_inputs:
            return [k_in for k_in in a_inputs]
        return []
