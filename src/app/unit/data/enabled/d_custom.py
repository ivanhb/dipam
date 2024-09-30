# Always import:
from app.unit.data.base.d_dipam import D_DIPAM_UNIT
from app.enabled.io_handler_custom import *
from app.enabled.view_handler_custom import *

import csv
import os


class D_TABLE(D_DIPAM_UNIT):
    """
    D_TABLE extends D_DIPAM_UNIT;
    This type of data is a general table which might be specified as direct VALUE or FILE
    """
    def __init__(self):
        super().__init__(
            label = "Dipam Table",
            description = "A general table type of data (in .csv or .tsv format)",
            family = "General",

            # this Data unit includes:
            #   (1) A CSV io value handler, which could be edited from the view:
            #       via direct value or by uploading a CSV file
            value_index = [
                (
                    IOH_TABLE(), # 0: IO_DIPAM_HANDLER
                    VIEWH_INPUT_BOX(), # 1: VIEW_DIPAM_HANDLER (for VALUE)
                    VIEWH_INPUT_FILE(["csv"]) # 2: VIEW_DIPAM_HANDLER (for FILE)
                )
            ]
        )

class D_TEXT(D_DIPAM_UNIT):
    """
    D_TEXT extends D_DIPAM_UNIT;
    This type of data is a general text which might be specified as direct VALUE or FILE
    """
    def __init__(self):
        super().__init__(
            label = "Dipam Any Text",
            description = "A general textual content. If specified by file any open format textual file is supported (e.g. txt, md, yaml, xml, html, etc)",
            family = "General",

            # this Data unit includes:
            #   (1) A CSV io value handler, which could be edited from the view:
            #       via direct value or by uploading a CSV file
            value_index = [
                (
                    IOH_TEXT(), # 0: IO_DIPAM_HANDLER
                    VIEWH_INPUT_BOX(), # 1: VIEW_DIPAM_HANDLER (for VALUE)
                    VIEWH_INPUT_FILE() # 2: VIEW_DIPAM_HANDLER (for FILE)
                )
            ]
        )
