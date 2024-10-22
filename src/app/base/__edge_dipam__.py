import re
import os

class EDGE_DIPAM_UNIT:
    """
    Defines a DIPAM edge unit.
    """

    @classmethod
    def gen_view_template(cls, template_path, data = None):
        """
        [NOT-OVERWRITABLE]
        Generates the view template to send to the view
        @return: a HTML template of this data unit
        """

        # load the html template of this data unit;
        with open(template_path, 'r') as file_base:
            template_base = file_base.read()

        # Use regex to extract the desired parts
        match = re.search(r"<!--START:HTML-TEMPLATE-BASE-->(.*?)<!--HTML-TEMPLATE-BASE:END-->", template_base, re.DOTALL)
        if match:
            html_template = match.group(1).format(**data)
            return html_template, None
        return None, None
