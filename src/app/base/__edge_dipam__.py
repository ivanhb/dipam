import re
import os
from app.base.messenger import DIPAM_MESSENGER
from app.base.__unit_dipam__ import DIPAM_UNIT

class EDGE_DIPAM_UNIT(DIPAM_UNIT):
    """
    Defines a DIPAM edge unit.

    @param:
        + <label>: name/title of the dipam edge
        + <description>: a description of the dipam edge,
    """
    def __init__(
            self,
            label = "Edge",
            description = "This is an edge used to connect two different nodes of the diagram. Only available operation is the remotion.",
            source = None,
            target = None
        ):
        super().__init__(
            type = "edge",
            label = label,
            description = description
        )
        self.source = source
        self.target = target


    def set_source(self, source):
        self.source = source

    def set_target(self, target):
        self.target = target

    def set_id(self):
        """
        [NOT-OVERWRITABLE]
        Defines the id of the data unit.
        @param:
            + idx: a number to concat with the rest of the identifier
        @return: the id of the data unit
        """
        if self.source and self.target:
            self.id = "e-"+self.source+"_"+self.target
            return True
        return False
