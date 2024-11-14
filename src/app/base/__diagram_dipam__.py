import re
import os
from app.base.messenger import DIPAM_MESSENGER
from app.base.__unit_dipam__ import DIPAM_UNIT

class DIAGRAM_DIPAM_UNIT(DIPAM_UNIT):
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

        super().__init__(
            type = "diagram",
            label = label,
            description = description
        )
        self.set_id("diagram-1")
