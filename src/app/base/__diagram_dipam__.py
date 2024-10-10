import re
import os

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
        self.id = "diagram"
        self.unit_class = self.__class__.__name__
        self.label = label
        self.description = description

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
            "description": self.description
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

    def gen_view_template(self, base_view_fpath):
        """
        [NOT-OVERWRITABLE]
        Generates the view template to send to the view
        @return: a HTML template of this data unit
        """

        # Add base attributes to <template_args>
        template_args_base = self.map_base_to_template_args()

        # load the html template of this data unit;
        # the html template file must be in same dir with same name of this class but lowercase
        # Use the format method to replace placeholders
        with open(base_view_fpath, 'r') as file_base:
            template_base = file_base.read()

        # put args in the HTML part
        # Use regex to extract the desired parts
        match = re.search(r"<!--START:HTML-TEMPLATE-BASE-->(.*?)<!--HTML-TEMPLATE-BASE:END-->", template_base, re.DOTALL)
        if match:
            html_template = match.group(1).format(**template_args_base)
            return html_template, None
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
            "base-description": self.description
        }
        return res
