from app.base.messenger import DIPAM_MESSENGER
import app.base.util as util
from collections import defaultdict
from pathlib import Path
import re
import os

class D_DIPAM_UNIT:
    """
    Defines a DIPAM data unit;
    New data units to integrate should extend this Class.

    @param:
        + <label>: name/title of the dipam data
        + <description>: a description of the dipam data,
        + <family>: the macro family of the data,
        + <handler>: a list of entities representing the values to be stored in this data unit;
            each entity is represented by: its io handler, value handler (if any), and file handler (if any)
    """
    def __init__(
            self,
            label = "Dipam data title",
            description = "A description of the Dipam data",
            family = "The macro family of the Dipam data"
        ):
        self.type = "data"
        self.id = "d-NN"
        self.unit_class = self.__class__.__name__

        # These are metadata values
        self.label = label
        self.description = description
        self.family = family

        self.value = None

    #   -----
    #   Methods to manage base and indexing operations
    #   -----

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


    #   -----
    #   Methods to manage writing/updating self.value
    #   -----

    def write(self, data = None, source_is_view = False, unit_base_dir = None):
        """
        [NOT-OVERWRITABLE]
        This method writes a given value into a "FILE" or "VALUE" (<type>);
        <args> are different depending on the <type> value
        @param:
        @return:
            self.value
        """

        # in case <data> is not provided then take the current self.value
        new_value = self.value
        if data:
            new_value = data

        # if source_is_view, then a convertion of the data into self.value is needed first;
        if source_is_view:

            if "file_input" in data:
                l_files = [ data["file_input"] ]
                if isinstance(data["file_input"], list):
                    l_files = data["file_input"]
                # Manage view file(s) and convert it into self.value format
                new_value = self.manage_view_file(data_to_convert)

            elif "direct_input" in data:
                try:
                    new_value = self.direct_input_manager(data["direct_input"])
                    msg = DIPAM_MESSENGER.build_app_msg(new_value)
                    if msg[1] == "error":
                        return msg
                except:
                    return None,"error","Something wrong in the direct input(s) assignment"

        # control if the new value passes the check
        _check = self.check_value(new_value)
        msg = DIPAM_MESSENGER.build_app_msg(_check)
        if msg[1] == "error":
            return msg

        # control if the new value is different from the current one
        # stop here in case this was not the init of the unit
        _check = self.is_value_match(new_value)
        if _check:
            if data:
                return None,"warning","Nothing to write: value is the same"

        # Assign the new value
        self.value = new_value

        # Dump it in case <unit_dir_path> is given
        if unit_base_dir:
            if not os.path.exists(unit_base_dir):
                Path(unit_base_dir).mkdir(parents=True, exist_ok=True)
            self.store_value(unit_base_dir)

        return self.value

    def check_value(self, a_value):
        return True

    def store_value(self, unit_dir_path):
        """
        [OVERWRITABLE]
        This methods defines how to write a file contating the data of this unit;
        its based on the values contained in <self.value>;
        @param:
            <unit_dir_path>: to define where to store the file to write
        @return:
            True/False, If False, an explaination is given (tuple)
        @NOTE: Subclasses must override this method and use <self.value>;
            also it must always contain <unit_dir_path> as param
        """
        return True

    def is_value_match(self, a_value):
        """
        [OVERWRITABLE]
        Checks if a given value <a_value> is "equal" to <self.value>
        @return:
            True/False
        """
        return True

    def manage_view_file(self, l_files):
        """
        [OVERWRITABLE]
        This method is responsible for processing uploaded files;
        It reads the file data, applies relevant transformations, and returns a new value (with the format of <self.value>) as a result;
        The content validation of the new value produced is out of scope for this method.
        @param:
            <data> is a list of files (use read() to read the content of each item in the list)
        @return:
            a new value that follow the format of <self.value>
        """
        new_value = ""
        for file in l_files:
            pref = file.filename.split(".")[-1]
            if not pref == 'txt':
                return False, "[ERROR] Some files have a non-supported format for this type of data"
            file_content = file.read()
            new_value = new_value +"\n"+ file_content.decode('utf-8')
        return new_value

    def direct_input_manager(self, a_value):
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


    #   -----
    #   Methods to manage reading self.value
    #   -----

    def read(self, file_path = []):
        """
        [NOT-OVERWRITABLE]
        This method reads a given data, "FILE" or "VALUE" (<type>)
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments;
        """
        if file_path:
            if os.path.exists(file_path):
                self.value = self.f_read(file_path)
        return self.v_read()

    def f_read(self, file_path = []):
        """
        [OPT-OVERWRITABLE]
        This method reads a value(s) in <value> and returns its value
        @param:
            + <value>: a corresponding value
        """
        return None

    def v_read(self):
        """
        [OPT-OVERWRITABLE]
        This method returns the value
        """
        return self.value


    #   -----
    #   Methods to manage the view template
    #   -----

    def gen_view_template(self, base_view_fpath, unit_view_fpath):
        """
        [NOT-OVERWRITABLE]
        Generates the view template to send to the view
        @return: a HTML template of this data unit
        """
        # get a dictionary for all the sub-args of "value"
        template_args = self.dump_attributes()

        # load the html template of this data unit;
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
