from collections import defaultdict
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
            family = "The macro family of the Dipam data",
            f_att = {
                "name": None,
                "extension": []
                # ... To be extended by the sub class
            }
        ):
        self.type = "data"
        self.id = "d-NN"
        self.unit_class = self.__class__.__name__
        self.label = label
        self.description = description
        self.family = family
        self.f_att = f_att
        self.value = None
        self.view = dict()

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

    def dump_metadata(self):
        """
        [NOT-OVERWRITABLE]
        Returns the data to be used when storing the index data describing this unit
        """
        data = {
            "type": self.type,
            "id": self.id,
            "unit_class": self.unit_class,
            "label": self.label,
            "description": self.description,
            "family": self.family,
            "view": self.view
        }
        return data

    def set_metadata(self,data):
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

    def write(self, data, source_is_view = False, unit_dir_path = None):
        """
        [NOT-OVERWRITABLE]
        This method writes a given value into a "FILE" or "VALUE" (<type>);
        <args> are different depending on the <type> value
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments
        @returns:
            self.value
        """

        new_value = data

        # if source_is_view, then a convertion of the data into self.value is needed first;
        if source_is_view:

            if "file" in data:
                l_files = [ data["file"] ]
                if isinstance(data["file"], list):
                    l_files = data["file"]
                # Manage view file(s) and convert it into self.value format
                new_value = self.manage_view_file(data_to_convert)

            elif "value" in data:
                direct_value = data["value"]
                # Manage view direct value and convert it into self.value format
                new_value = self.manage_view_direct_value(direct_value)

        # control if the new value passes the check
        _check = self.check_value(new_value)
        if isinstance(_check, tuple):
            return _check

        # control if the new value is different from the current one
        _check = self.is_value_match(new_value)
        if _check:
            return None,"[INFO] nothing to write value is the same"

        # Assign the new value
        self.value = new_value
        # Dump it in case <unit_dir_path> is given
        if unit_dir_path:
            self.store_value(unit_dir_path)

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
        file_path = os.path.join(unit_dir_path, "__d_dipam__.txt")
        with open(file_path, 'w') as file:
            file.write(self.value)
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

    def manage_view_direct_value(self, a_value):
        """
        [OVERWRITABLE]
        This method is responsible for processing uploaded direct unit view values;
        It reads data, applies relevant transformations, and returns a new value (with the format of <self.value>) as a result;
        The content validation of the new value produced is out of scope for this method.
        @param:
            <a_value> a view value in the dipam_unit_value format.
        @return:
            a new value that follow the format of <self.value>
        """
        new_value = a_value
        return new_value


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
        #_value = self.read()
        #template_args_value = self.map_value_to_template_args(_value)
        template_args_value = {}
        # add base attributes to <template_args>
        template_args_base = self.map_base_to_template_args()
        # concat both
        template_args = template_args_value | template_args_base

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

    def map_base_to_template_args(self):
        """
        [NOT-OVERWRITABLE]
        @return: a dict with all the base.{} arguments to subtitute in the HTML template of this data unit
        """
        res = {
            "base-id": self.id,
            "base-type": self.type,
            "base-unit_class": self.unit_class,
            "base-label": self.label,
            "base-description": self.description,
            "base-family": self.family
        }
        return res

    def map_value_to_template_args(self, value):
        """
        [OVERWRITABLE]
        @return: a dict with all the value.{} arguments to subtitute in the HTML template of this data unit
        **NOTE: Subclasses must override this method without changing params
                <value> is a value that respects this data unti value format
        """
        res = {"value-content": value}
        return res

    def update_view_data(self, data):
        if "file" in data:
            l_files = [ data["file"] ]
            if isinstance(data["file"], list):
                l_files = data["file"]
            self.view["file"] = str(len(l_files))+ " files uploaded"
        elif "value" in data:
            self.view["value"] = data["value"]
        return True

    def backend2view(self):
        """
        [NOT-OVERWRITABLE]
        This method must build the entire HTML view of this data unit;
        Using "d_dipam.html" template and the corresponding template of this data unit,
        """
        html_content = ""
        return html_content
