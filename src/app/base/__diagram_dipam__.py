import re
import os
from app.base.messenger import DIPAM_MESSENGER

class DIAGRAM_DIPAM_UNIT:
    """
    Defines a DIPAM diagram unit.

    @param:
        + <label>: name/title of the dipam data
        + <description>: a description of the dipam data,
    """
    def __init__(
            self,
            label = "DIPAM v2.0",
            description = "This is DIPAM v2.0, designed to be more configurable and customizable. The core functionality is powered entirely by Python, allowing new data and tool units to be easily defined, along with their corresponding interface templates."
        ):
        self.type = "diagram"
        self.id = "diagram-1"
        self.unit_class = self.__class__.__name__
        self.label = label
        self.description = description

    @property
    def view_attributes(self):
        """
        To be called when exchanging values with the view
        Dynamically fetches the latest attribute values each time it's accessed;
        """
        return {
            "label": self.label,
            "description": self.description
        }

    @property
    def meta_attributes(self):
        """
        [NOT-OVERWRITABLE]
        @return: a dict with all the attributes of this class
        """
        return self.__dict__

    def set_id(self, id):
        """
        [NOT-OVERWRITABLE]
        Defines the id of the data unit.
        @param:
            + idx: a number to concat with the rest of the identifier
        @return: the id of the data unit
        """
        return self.id

    def write_value(self, data = None, source_is_view = False, unit_base_dir = None):
        """
        [NOT-OVERWRITABLE]
        This method writes a new given value;
        """

        if new_value == None or new_value == False:
            return DIPAM_MESSENGER.build_app_msg(None,400)

        # all went fine: assign view values to to self attributes
        if source_is_view:
            self.assign_view_values(data)

        # Dump it in case <unit_dir_path> is given
        if unit_base_dir:
            self.store_value(unit_base_dir)

        return True


    def store_value(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        This methods defines how to write a json file contating the data of this unit;
        """
        try:
            file_path = os.path.join(unit_dir_path, str(self.id)+".json")
            with open(file_path, 'w') as file:
                json.dump(self.value, file, indent=4)
            return self.value
        except:
            return None,"error","Something wrong happend while storing the tool values"

    def gen_view_template(self, template_path, unit_path = None):
        """
        [NOT-OVERWRITABLE]
        Generates the view template to send to the view
        @return: a HTML template of this data unit
        """
        # load the html template of this data unit;
        with open(template_path, 'r') as file_base:
            template_base = file_base.read()

        # Use regex to extract the desired parts
        match = re.search(r"(.*?)<!--START:HTML-TEMPLATE-BASE-->(.*?)<!--HTML-TEMPLATE-BASE:END-->", template_base, re.DOTALL)
        if match:
            css_template = match.group(1)
            html_template = match.group(2).format(**self.meta_attributes)

            html_template = css_template + html_template

            return html_template, None, None
        return None, None, None
