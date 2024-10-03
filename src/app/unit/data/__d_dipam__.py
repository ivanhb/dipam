from collections import defaultdict

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
        self.label = label
        self.description = description
        self.family = family
        self.f_att = f_att
        self.value = None


    def check(self, type, *args):
        """
        [NOT-OVERWRITABLE]
        This method checks if a given data ("FILE" or "VALUE") respects this io_dipam_handler
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments;
                a value(s) in case <type> == "VALUE";
                a file path(s) in case <type> == "FILE"
        """
        check = True
        if type == "FILE":
            check = self.f_check(args)
        check = check and self.v_check(args)
        return check

    def f_check(self, f_path = []):
        """
        [OPT-OVERWRITABLE]
        This method checks if a file in <f_path> is suitable for this file_dipam_handler
        @param:
            + <f_path>: a list of file path(s)
        """
        check = True
        for _fp in f_path:
          check &= any([_fp.endswith(f_ext) for f_ext in self.f_att.extension])
        return check


    def v_check(self, a_val):
        """
        [OPT-OVERWRITABLE]
        This method checks if a value in <value> is suitable for this file_dipam_handler
        """
        check = False
        if a_val:
            check = True
        return check


    def write(self, dir_path = None, *args):
        """
        [NOT-OVERWRITABLE]
        This method writes a given value into a "FILE" or "VALUE" (<type>);
        <args> are different depending on the <type> value
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments
        """
        self.value = self.v_write(args)
        if file_path:
            self.f_write(dir_path)
        return res


    def f_write(self, dir_path):
        """
        [OVERWRITABLE]
        This methods defines how to write a file contating the data of this unit;
        its based on the values contained in <self.value>;
        it takes <file_path> to define where to store the file to write;
        **@NOTE: Subclasses must override this method and use <self.value>;
            also it must always contain <dest_path> as param
        """
        return True

    def v_write(self, *args):
        """
        [OVERWRITABLE]
        This methods defines the new value to assign for this this data unit value;
        """
        _val = args[0]
        return _val


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
            "family": self.family
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


    def prepare_view_template(self):
        """
        [NOT-OVERWRITABLE]
        Generates the view template to send to the view
        @return: a HTML template of this data unit
        """
        # get a dictionary for all the sub-args of "value"
        _value = self.read()
        template_args_value = self.map_value_to_template_args(_value)
        # add base attributes to <template_args>
        template_args_base = self.map_base_to_template_args()
        # concat both
        template_args = template_args_value | template_args_base

        # load the html template of this data unit;
        # the html template file must be in same dir with same name of this class but lowercase
        html_template_file = self.__class__.__name__.lower()+".html"
        with open(html_template_file, 'r') as file:
            html_template = file.read()

        # Use the format method to replace placeholders
        filled_html_template = html_template.format(**template_args)
        return html_output

    def map_base_to_template_args(self):
        """
        [NOT-OVERWRITABLE]
        @return: a dict with all the base.{} arguments to subtitute in the HTML template of this data unit
        """
        res = {
            "base.id": self.id,
            "base.type": self.type,
            "base.label": self.label,
            "base.description": self.description,
            "base.family": self.family
        }
        return res

    def map_value_to_template_args(self, value):
        """
        [OVERWRITABLE]
        @return: a dict with all the value.{} arguments to subtitute in the HTML template of this data unit
        **NOTE: Subclasses must override this method without changing params
                <value> is a value that respects this data unti value format (v_check() > True)
        """
        res = {"value.content": value}
        return res

    def backend2view(self):
        """
        [NOT-OVERWRITABLE]
        This method must build the entire HTML view of this data unit;
        Using "d_dipam.html" template and the corresponding template of this data unit,
        """
        html_content = ""
        return html_content


    def view2backend(self, type, *args):
        """
        Defines the id of the data unit.
        @param:
            + <type>: is either "VALUE" or "FILE", to specify the corresponding view trigger
        @return:
        """

        if type == "VALUE":
            self.value_view_handler(args)
        elif type == "FILE":
            self.file_view_handler(args)

        if self.io_handler.check(type, args):
            # read it and save it as the current value of this data unit
            self.value = self.io_handler.read(type, args)
            # store the new value on the target dir of this dipam data unit
            self.io_handler.store(self.value)
            return True

        return False
