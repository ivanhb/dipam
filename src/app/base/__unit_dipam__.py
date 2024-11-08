from app.base.messenger import DIPAM_MESSENGER
import app.base.util as util
from collections import defaultdict
from pathlib import Path
import re
import os

class DIPAM_UNIT:
    """
    Defines a DIPAM data unit;
    New data units to integrate should extend this Class, and define the following @param(s) and @method(s)

    @param:
        + <type>: dipam unit type
        + <label>: name/title of the dipam data
        + <description>: a description of the dipam data,

    @method:
        + ...

    [*]: Mandatory

    """
    def __init__(
            self,
            type,
            label = "Dipam unit title",
            description = "A description of the Dipam unit"
        ):
        self.type = type
        self.id = None
        self.unit_class = self.__class__.__name__
        self.label = label
        self.description = description

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
        self.id = str(id)
        return self.id


    def gen_view_template(self, base_view_fpath, unit_view_fpath):
        """
        [NOT-OVERWRITABLE]
        Generates the HTML and JS template of this unit
        """

        # load the html template of this data unit;
        # the html template file must be in same dir with same name of this class but lowercase
        with open(base_view_fpath, 'r') as file_base, open(unit_view_fpath, 'r') as file_unit:
            template_base = file_base.read()
            template_unit = file_unit.read()

        # replace vars in template_base
        template_base = template_base.format(**self.meta_attributes)

        # Extract divs from the <template_unit> and place them in <template_base>
        for pattern, placeholder in [
            (r"<!--START:CSS-->(.*?)<!--END:CSS-->", "<!--CSS-->"),
            (r"<!--START:HTML-->(.*?)<!--END:HTML-->", "<!--HTML-->"),
            (r"<!--START:JS-->(.*?)<!--END:JS-->", "<!--JS-->")
        ]:
            match = re.search(pattern, template_unit, re.DOTALL)
            template_base = template_base.replace(placeholder, match.group(1) if match else "")

        # put args in the HTML part
        # Use regex to extract the desired parts
        match = re.search(r"(.*)<!--START:HTML-->(.*?)<!--END:HTML-->(.*)", template_base, re.DOTALL)
        if match:

            css_template = match.group(1).strip()
            html_template = match.group(2).strip()

            # to make it just clean code
            # remove the script tag from it
            script_template = match.group(3).strip()
            script_template = re.sub(r'<script type="text/javascript">(.*?)</script>', r'\1', script_template, flags=re.DOTALL)

            return css_template + html_template, script_template
        return None, None
